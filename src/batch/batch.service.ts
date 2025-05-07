// src/batch/batch.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MergeTransactionService } from '../merge-transaction/merge-transaction.service';
import { TransactionService } from '../transaction/transaction.service';
import { StoreTransactionService } from '../store-transaction/store-transaction.service';
import { CsvService } from '../utils/csv.service';
import { BatchHistoryService } from '../history/batch-history.service';

@Injectable()
export class BatchService {
  private readonly logger = new Logger(BatchService.name);
  private readonly BATCH_SIZE = 10;

  constructor(
    private readonly mergeTxService: MergeTransactionService,
    private readonly txService: TransactionService,
    private readonly storeTxService: StoreTransactionService,
    private readonly csvService: CsvService,
    private readonly historyService: BatchHistoryService,
  ) {}

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async collectData() {
    this.logger.log('데이터 수집 시작 (매 1분마다)');
    const start = Date.now();
    let success = 0,
      fail = 0,
      total = 0;
    try {
      // 1. Transaction 데이터 수집 (Mock1 + CSV)
      const transactions = [
        ...(await this.txService.fetchAllFromMockServer()),
        ...(await this.csvService.parseCsv()),
      ];
      this.logger.log(`수집 대상 트랜잭션: ${transactions.length}건`);

      // 2. StoreTransaction 데이터 수집 (Mock2)
      const storeTxs = await this.storeTxService.fetchAll(transactions);
      this.logger.log(`수집된 스토어 트랜잭션: ${storeTxs.length}건`);

      // 3. Merge 및 저장 (처리율 제한 적용)
      this.logger.log('데이터 병합 및 저장 시작');
      for (let i = 0; i < transactions.length; i += this.BATCH_SIZE) {
        const batch = transactions.slice(i, i + this.BATCH_SIZE);
        const batchStart = Date.now();

        // 배치 처리
        await Promise.all(
          batch.map(async (tx) => {
            try {
              const storeTx = storeTxs.find(
                (st) => st.transactionId === tx.transactionId,
              );
              if (!storeTx) {
                this.logger.warn(
                  `StoreTransaction을 찾을 수 없음: ${tx.transactionId} (건너뜀)`,
                );
                return;
              }

              const mergeTx = {
                ...tx,
                ...storeTx,
                amount: Number(tx.amount),
                balance: Number(tx.balance),
              };

              total++;
              await this.mergeTxService.save(mergeTx);
              success++;
            } catch (e) {
              fail++;
              this.logger.error(
                `트랜잭션 저장 실패 (ID: ${tx?.transactionId}): ${e.message}`,
              );
            }
          }),
        );

        // 배치 처리 시간 계산
        const batchEnd = Date.now();
        const batchTime = batchEnd - batchStart;

        if (batchTime < 1000 && i + this.BATCH_SIZE < transactions.length) {
          this.logger.log(`다음 배치 처리 전 ${1000 - batchTime}ms 대기...`);
          await this.sleep(1000 - batchTime);
        }

        this.logger.log(
          `[Batch Progress] ${i + batch.length}/${transactions.length} 처리 완료`,
        );
      }

      // 4. 히스토리 기록
      await this.historyService.record({
        startedAt: new Date(start).toISOString(),
        endedAt: new Date().toISOString(),
        total,
        success,
        fail,
      });
      this.logger.log(
        `데이터 수집 완료: 총 ${total}건 시도, 성공 ${success}건, 실패 ${fail}건`,
      );
    } catch (e) {
      this.logger.error(`배치 작업 전체 실패: ${e.message}`, e.stack);
      await this.historyService.record({
        startedAt: new Date(start).toISOString(),
        endedAt: new Date().toISOString(),
        total,
        success,
        fail,
        error: e.message,
      });
    }
  }
}
