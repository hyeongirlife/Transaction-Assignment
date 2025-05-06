// src/merge-transaction/merge-transaction.service.ts
import { Injectable } from '@nestjs/common';
import { FileDbService } from '../db/file-db.service';
import { MergeTransaction } from '../common/interfaces/merge-transaction.interface';

@Injectable()
export class MergeTransactionService {
  constructor(private readonly db: FileDbService) {}

  private getIdPath(id: string) {
    return `/mergeTransactionsById/${id}`;
  }

  async isDuplicate(transactionId: string): Promise<boolean> {
    return this.db.exists(this.getIdPath(transactionId));
  }

  async save(tx: MergeTransaction): Promise<void> {
    if (await this.isDuplicate(tx.transactionId)) return;
    await this.db.push('/mergeTransactions[]', tx);
    await this.db.set(this.getIdPath(tx.transactionId), tx);
  }

  async findByDateRange(
    start: string,
    end: string,
  ): Promise<MergeTransaction[]> {
    const all = await this.db.get<MergeTransaction[]>('/mergeTransactions');
    return all.filter((tx) => tx.date >= start && tx.date <= end);
  }
}
