// src/merge-transaction/merge-transaction.service.ts
import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { FileDbService } from '../db/file-db.service';
import { MergeTransaction } from '../common/interfaces/merge-transaction.interface';
import { Mutex } from 'async-mutex';

const MERGE_TRANSACTIONS_PATH = '/mergeTransactions';
const MERGE_TRANSACTIONS_BY_ID_BASE_PATH = '/mergeTransactionsById';

/**
 * 병합된 트랜잭션 데이터의 CRUD 연산을 담당하는 서비스입니다.
 */
@Injectable()
export class MergeTransactionService {
  private readonly logger = new Logger(MergeTransactionService.name);
  private readonly mutex = new Mutex();

  constructor(private readonly db: FileDbService) {}

  /**
   * 트랜잭션 ID를 기반으로 데이터베이스 경로를 생성합니다.
   * @param {string} id 트랜잭션 ID
   * @returns {string} 생성된 데이터베이스 경로
   */
  private getIdPath(id: string): string {
    return `${MERGE_TRANSACTIONS_BY_ID_BASE_PATH}/${id}`;
  }

  /**
   * 주어진 트랜잭션 ID가 이미 데이터베이스에 존재하는지 확인합니다.
   * 이 메서드는 뮤텍스에 의해 보호되는 컨텍스트 외부에서 호출될 수 있으나,
   * save 메서드 내에서는 뮤텍스 잠금 하에 호출됩니다.
   * @param {string} transactionId 확인할 트랜잭션 ID
   * @returns {Promise<boolean>} 중복 여부 (true이면 중복)
   */
  async isDuplicate(transactionId: string): Promise<boolean> {
    try {
      return await this.db.exists(this.getIdPath(transactionId));
    } catch (error) {
      this.logger.error(
        `Failed to check duplication for ID: ${transactionId}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Failed to check transaction duplication',
      );
    }
  }

  /**
   * 새로운 병합 트랜잭션을 데이터베이스에 저장합니다.
   * 뮤텍스를 사용하여 동시 접근으로부터 임계 영역을 보호합니다.
   * 이미 존재하는 ID인 경우 저장하지 않습니다.
   * @param {MergeTransaction} tx 저장할 트랜잭션 데이터
   * @returns {Promise<void>}
   * @throws {InternalServerErrorException} 저장 과정에서 에러 발생 시
   */
  async save(tx: MergeTransaction): Promise<void> {
    await this.mutex.runExclusive(async () => {
      this.logger.log(
        `[Mutex Acquired] Attempting to save transaction ID: ${tx.transactionId}`,
      );
      if (await this.db.exists(this.getIdPath(tx.transactionId))) {
        this.logger.warn(
          `Transaction ID ${tx.transactionId} already exists (checked under lock). Skipping save.`,
        );
        return;
      }

      try {
        await this.db.push<MergeTransaction>(
          `${MERGE_TRANSACTIONS_PATH}[]`,
          tx,
        );

        await this.db.set<MergeTransaction>(
          this.getIdPath(tx.transactionId),
          tx,
        );
        this.logger.log(
          `Successfully saved transaction ID: ${tx.transactionId} (under lock)`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to save transaction ID: ${tx.transactionId} (under lock)`,
          error.stack,
        );
        throw new InternalServerErrorException('Failed to save transaction');
      }
    });
    this.logger.log(
      `[Mutex Released] Finished save attempt for transaction ID: ${tx.transactionId}`,
    );
  }

  /**
   * 지정된 날짜 범위 내의 모든 병합 트랜잭션을 조회합니다.
   * @param {string} start 조회 시작 날짜 (YYYY-MM-DD)
   * @param {string} end 조회 종료 날짜 (YYYY-MM-DD)
   * @returns {Promise<MergeTransaction[]>} 조건에 맞는 트랜잭션 목록
   * @throws {InternalServerErrorException} 조회 과정에서 에러 발생 시
   */
  async findByDateRange(
    start: string,
    end: string,
  ): Promise<MergeTransaction[]> {
    try {
      const allTransactions = await this.db.get<MergeTransaction[]>(
        MERGE_TRANSACTIONS_PATH,
      );
      if (!allTransactions) {
        return [];
      }
      const filtered = allTransactions.filter(
        (txFilter) => txFilter.date >= start && txFilter.date <= end,
      );
      return filtered;
    } catch (error) {
      this.logger.error(
        `Failed to find transactions by date range (${start} - ${end})`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Failed to find transactions by date range',
      );
    }
  }
}
