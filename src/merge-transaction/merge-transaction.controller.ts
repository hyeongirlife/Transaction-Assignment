// src/merge-transaction/merge-transaction.controller.ts
import {
  Controller,
  Get,
  Query,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { MergeTransactionService } from './merge-transaction.service';
import { GetMergeTransactionsByDateRangeDto } from './dto/get-merge-transactions-by-date-range.dto';
import { MergeTransaction } from '../common/interfaces/merge-transaction.interface';

/**
 * 병합된 트랜잭션 데이터를 조회하는 API 컨트롤러입니다.
 */
@Controller('merge-transactions')
export class MergeTransactionController {
  constructor(private readonly service: MergeTransactionService) {}

  /**
   * 지정된 날짜 범위 내의 병합된 트랜잭션 목록을 조회합니다.
   * @param {GetMergeTransactionsByDateRangeDto} queryParams 조회할 날짜 범위 (start, end)
   * @returns {Promise<MergeTransaction[]>} 조건에 맞는 트랜잭션 목록
   */
  @Get()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async getByDateRange(
    @Query() queryParams: GetMergeTransactionsByDateRangeDto,
  ): Promise<MergeTransaction[]> {
    return this.service.findByDateRange(queryParams.start, queryParams.end);
  }
}
