import { Controller, Get } from '@nestjs/common';
import { BatchHistoryService, BatchHistory } from './batch-history.service';

@Controller('history/batch-history')
export class BatchHistoryController {
  constructor(private readonly batchHistoryService: BatchHistoryService) {}

  @Get()
  async getAll(): Promise<BatchHistory[]> {
    return this.batchHistoryService.getAll();
  }
}
