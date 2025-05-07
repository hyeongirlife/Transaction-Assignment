// src/app.module.ts
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { BatchHistoryController } from './history/batch-history.controller';
import { BatchHistoryService } from './history/batch-history.service';
import { BatchService } from './batch/batch.service';
import { CsvService } from './utils/csv.service';
import { FileDbService } from './db/file-db.service';
import { MergeTransactionController } from './merge-transaction/merge-transaction.controller';
import { MergeTransactionService } from './merge-transaction/merge-transaction.service';
import { StoreTransactionService } from './store-transaction/store-transaction.service';
import { TransactionService } from './transaction/transaction.service';

/**
 * 애플리케이션의 루트 모듈입니다.
 * 모든 주요 구성 요소와 모듈을 통합합니다.
 */
@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [BatchHistoryController, MergeTransactionController],
  providers: [
    BatchHistoryService,
    BatchService,
    CsvService,
    FileDbService,
    MergeTransactionService,
    StoreTransactionService,
    TransactionService,
  ],
})
export class AppModule {}
