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
      let page = 1,
        totalPage = 1;
      try {
        do {
          const { data } = await axios.post(
            `http://localhost:4002/store-transaction/${tx.storeId}`,
            { page, date: tx.date },
          );
          result.push(...data.list);
          totalPage = data.pageInfo.totalPage;
          page++;
        } while (page <= totalPage);
      } catch (e) {
        this.logger.warn(
          `4002 서버에서 storeId=${tx.storeId}, date=${tx.date} 데이터 가져오기 실패: ${e.message}`,
        );
        // 이 storeId/date 조합은 skip
        continue;
      }
    }
    return result;
  }
}
