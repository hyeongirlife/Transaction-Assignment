// src/history/batch-history.service.ts
import { Injectable } from '@nestjs/common';
import { FileDbService } from '../db/file-db.service';

export interface BatchHistory {
  startedAt: string;
  endedAt: string;
  total: number;
  success: number;
  fail: number;
  error?: string;
}

@Injectable()
export class BatchHistoryService {
  constructor(private readonly db: FileDbService) {}

  async record(history: BatchHistory) {
    await this.db.push('/batchHistory[]', history);
  }

  async getAll(): Promise<BatchHistory[]> {
    return this.db.get('/batchHistory');
  }
}
