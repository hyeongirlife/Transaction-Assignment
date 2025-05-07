// src/history/batch-history.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { FileDbService } from '../db/file-db.service';

const BATCH_HISTORY_PATH = '/batchHistory';
const BATCH_HISTORY_ARRAY_PATH = '/batchHistory[]';

/**
 * 배치 작업 이력의 데이터 구조를 정의합니다.
 */
export interface BatchHistory {
  /** 배치 시작 시간 (ISO 8601 형식) */
  startedAt: string;
  /** 배치 종료 시간 (ISO 8601 형식) */
  endedAt: string;
  /** 총 처리 시도 건수 */
  total: number;
  /** 성공 건수 */
  success: number;
  /** 실패 건수 */
  fail: number;
  /** 에러 발생 시 에러 메시지 */
  error?: string;
}

/**
 * 배치 작업 이력을 관리하는 서비스입니다.
 */
@Injectable()
export class BatchHistoryService {
  private readonly logger = new Logger(BatchHistoryService.name);

  constructor(private readonly db: FileDbService) {}

  /**
   * 새로운 배치 작업 이력을 기록합니다.
   * @param {BatchHistory} history 기록할 배치 이력 객체
   * @returns {Promise<void>}
   */
  async record(history: BatchHistory): Promise<void> {
    try {
      await this.db.push<BatchHistory>(BATCH_HISTORY_ARRAY_PATH, history);
    } catch (error) {
      this.logger.error('Failed to record batch history', error.stack);
      // 배치 히스토리 기록 실패는 심각한 문제로 간주하지 않을 수 있으므로,
      // 에러를 다시 던지지 않고 로깅만 할 수 있습니다.
      // 또는 특정 타입의 에러를 발생시켜 BatchService에서 처리하도록 할 수 있습니다.
    }
  }

  /**
   * 모든 배치 작업 이력을 가져옵니다.
   * @returns {Promise<BatchHistory[]>} 배치 작업 이력 배열
   */
  async getAll(): Promise<BatchHistory[]> {
    try {
      return await this.db.get<BatchHistory[]>(BATCH_HISTORY_PATH);
    } catch (error) {
      this.logger.error('Failed to get all batch history', error.stack);
      // 히스토리 조회 실패 시 빈 배열을 반환하거나 에러를 던질 수 있습니다.
      // 여기서는 빈 배열을 반환하여 API 호출이 실패하지 않도록 합니다.
      return [];
    }
  }
}
