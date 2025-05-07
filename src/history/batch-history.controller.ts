import { Controller, Get } from '@nestjs/common';
import { BatchHistoryService, BatchHistory } from './batch-history.service';

/**
 * 배치 작업 이력을 조회하는 API 컨트롤러입니다.
 */
@Controller('history/batch-history')
export class BatchHistoryController {
  constructor(private readonly batchHistoryService: BatchHistoryService) {}

  /**
   * 모든 배치 작업 이력을 가져옵니다.
   * @returns {Promise<BatchHistory[]>} 배치 작업 이력 배열
   */
  @Get()
  async getAll(): Promise<BatchHistory[]> {
    return this.batchHistoryService.getAll();
  }
}
