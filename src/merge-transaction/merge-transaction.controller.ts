// src/merge-transaction/merge-transaction.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { MergeTransactionService } from './merge-transaction.service';

@Controller('merge-transactions')
export class MergeTransactionController {
  constructor(private readonly service: MergeTransactionService) {}

  @Get()
  async getByDateRange(
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    return this.service.findByDateRange(start, end);
  }
}
