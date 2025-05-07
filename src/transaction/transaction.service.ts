// src/transaction/transaction.service.ts
import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { Transaction } from '../common/interfaces/transaction.interface';

@Injectable()
export class TransactionService {
  private readonly logger = new Logger(TransactionService.name);

  async fetchAllFromMockServer(): Promise<Transaction[]> {
    try {
      // 한 번에 모든 데이터 요청 (page=1, pageSize=1000)
      const { data } = await axios.get(
        `http://localhost:4001/transaction?page=1&pageSize=1000`,
      );
      return data.list;
    } catch (e) {
      this.logger.warn(
        `🔴 4001 서버에서 데이터를 가져오지 못했습니다: ${e.message}`,
      );
      // 서버가 없거나 데이터가 없으면 빈 배열 반환
      return [];
    }
  }
}
