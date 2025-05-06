import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { Transaction } from '../common/interfaces/transaction.interface';

@Injectable()
export class TransactionService {
  private readonly logger = new Logger(TransactionService.name);

  async fetchAllFromMockServer(): Promise<Transaction[]> {
    let page = 1,
      totalPage = 1,
      result: Transaction[] = [];
    try {
      do {
        const { data } = await axios.get(
          `http://localhost:4001/transaction?page=${page}`,
        );
        result = result.concat(data.list);
        totalPage = data.pageInfo.totalPage;
        page++;
      } while (page <= totalPage);
    } catch (e) {
      this.logger.warn(
        `4001 서버에서 데이터를 가져오지 못했습니다: ${e.message}`,
      );
      // 서버가 없거나 데이터가 없으면 빈 배열 반환
      return [];
    }
    return result;
  }
}
