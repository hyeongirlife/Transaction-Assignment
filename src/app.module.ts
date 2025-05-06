// src/app.module.ts
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { BatchService } from './batch/batch.service';
import { MergeTransactionService } from './merge-transaction/merge-transaction.service';
import { TransactionService } from './transaction/transaction.service';
import { StoreTransactionService } from './store-transaction/store-transaction.service';
import { CsvService } from './utils/csv.service';
import { FileDbService } from './db/file-db.service';
import { BatchHistoryService } from './history/batch-history.service';
import { BatchHistoryController } from './history/batch-history.controller';
import { MergeTransactionController } from './merge-transaction/merge-transaction.controller';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [BatchHistoryController, MergeTransactionController],
  providers: [
    BatchService,
    MergeTransactionService,
    TransactionService,
    StoreTransactionService,
    CsvService,
    FileDbService,
    BatchHistoryService,
  ],
})
export class AppModule {}
