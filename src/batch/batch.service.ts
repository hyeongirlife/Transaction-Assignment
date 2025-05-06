// src/batch/batch.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { MergeTransactionService } from '../merge-transaction/merge-transaction.service';
import { TransactionService } from '../transaction/transaction.service';
import { StoreTransactionService } from '../store-transaction/store-transaction.service';
import { CsvService } from '../utils/csv.service';
import { BatchHistoryService } from '../history/batch-history.service';

@Injectable()
export class BatchService {
  private readonly logger = new Logger(BatchService.name);

  constructor(
    private readonly mergeTxService: MergeTransactionService,
    private readonly txService: TransactionService,
    private readonly storeTxService: StoreTransactionService,
    private readonly csvService: CsvService,
    private readonly historyService: BatchHistoryService,
  ) {}

  @Cron('*/10 * * * * *')
  async collectData() {
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

      // 2. StoreTransaction 데이터 수집 (Mock2)
      const storeTxs = await this.storeTxService.fetchAll(transactions);

      // 3. Merge 및 저장
      for (const tx of transactions) {
        const storeTx = storeTxs.find(
          (st) => st.transactionId === tx.transactionId,
        );
        if (!storeTx) continue;
        const mergeTx = { ...tx, ...storeTx };
        total++;
        try {
          await this.mergeTxService.save(mergeTx);
          success++;
        } catch (e) {
          fail++;
          this.logger.error(`Save failed: ${e.message}`);
        }
      }
      // 4. 히스토리 기록
      await this.historyService.record({
        startedAt: new Date(start).toISOString(),
        endedAt: new Date().toISOString(),
        total,
        success,
        fail,
      });
    } catch (e) {
      this.logger.error(`Batch failed: ${e.message}`);
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
