// src/store-transaction/store-transaction.service.ts
import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { StoreTransaction } from '../common/interfaces/store-transaction.interface';
import { Transaction } from '../common/interfaces/transaction.interface';

@Injectable()
export class StoreTransactionService {
  private readonly logger = new Logger(StoreTransactionService.name);

  async fetchAll(transactions: Transaction[]): Promise<StoreTransaction[]> {
    const result: StoreTransaction[] = [];
    for (const tx of transactions) {
      try {
        // 한 번에 모든 데이터 요청 (page=1, pageSize=1000)
        const { data } = await axios.post(
          `http://localhost:4002/store-transaction/${tx.storeId}`,
          { page: 1, date: tx.date, pageSize: 1000 }, // pageSize 추가
        );
        result.push(...data.list);
      } catch (e) {
        this.logger.warn(
          `🔴 4002 서버에서 storeId=${tx.storeId}, date=${tx.date} 데이터 가져오기 실패: ${e.message}`,
        );
        // 이 storeId/date 조합은 skip
        continue;
      }
    }
    return result;
  }
}
