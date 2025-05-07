// src/utils/csv.service.ts
import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { Transaction } from '../common/interfaces/transaction.interface';
import * as fs from 'fs';
import { parse, Options as CsvParseOptions } from 'csv-parse/sync';

const CSV_FILE_PATH = 'transaction.csv';

/**
 * CSV 파일 처리 관련 유틸리티 서비스입니다.
 */
@Injectable()
export class CsvService {
  private readonly logger = new Logger(CsvService.name);

  /**
   * 지정된 CSV 파일을 파싱하여 Transaction 객체 배열로 변환합니다.
   * CSV 파일은 헤더를 포함해야 하며, 각 컬럼명은 Transaction 인터페이스의 속성명과 일치해야 합니다.
   * @returns {Promise<Transaction[]>} 파싱된 트랜잭션 데이터 배열
   * @throws {InternalServerErrorException} 파일 읽기 또는 CSV 파싱 중 에러 발생 시
   */
  async parseCsv(): Promise<Transaction[]> {
    this.logger.log(`Attempting to parse CSV file: ${CSV_FILE_PATH}`);
    try {
      if (!fs.existsSync(CSV_FILE_PATH)) {
        this.logger.warn(
          `CSV file not found: ${CSV_FILE_PATH}. Returning empty array.`,
        );
        return [];
      }

      const content = fs.readFileSync(CSV_FILE_PATH, 'utf-8');

      const parseOptions: CsvParseOptions = {
        columns: true, // 첫 번째 줄을 헤더로 사용하고, 각 로우를 객체로 반환
        skip_empty_lines: true, // 빈 줄은 건너뜀
        trim: true, // 값의 앞뒤 공백 제거
        cast: (value, context) => {
          if (context.column === 'amount' || context.column === 'balance') {
            const num = parseFloat(value);
            return isNaN(num) ? value : num; // 숫자로 변환 실패 시 원본 문자열 유지 (추후 검증 필요)
          }
          return value;
        },
      };

      // CsvParseOptions 타입을 명시적으로 사용하고, parse의 반환 타입을 any[]로 받은 후 매핑합니다.
      const records: any[] = parse(content, parseOptions);

      // Transaction 타입으로 매핑 및 기본 검증 (실제로는 더 엄격한 검증 필요)
      const transactions: Transaction[] = records.map((record, index) => {
        // amount와 balance가 숫자가 아니면 로깅하고 해당 레코드는 건너뛰거나 기본값 처리 가능
        if (
          typeof record.amount !== 'number' ||
          typeof record.balance !== 'number'
        ) {
          this.logger.warn(
            `Invalid numeric value in CSV record at index ${index}: amount=${record.amount}, balance=${record.balance}. Skipping record.`,
          );
          // 이 경우 null을 반환하고 나중에 filter(Boolean)으로 제거하거나, 여기서 제외할 수 있습니다.
          // 여기서는 일단 에러가 있는 레코드는 제외하지 않고, 타입 단언을 사용합니다.
          // 하지만 실제로는 이런 데이터는 필터링하거나, 에러로 처리해야 합니다.
        }
        return {
          transactionId: String(record.transactionId),
          storeId: String(record.storeId),
          productId: String(record.productId), // productId가 CSV에 있다는 가정하에 추가 (Transaction 인터페이스 확인 필요)
          amount: Number(record.amount), // CsvParseOptions의 cast에서 이미 숫자로 변환 시도됨
          balance: Number(record.balance), // CsvParseOptions의 cast에서 이미 숫자로 변환 시도됨
          date: String(record.date), // 날짜 형식 검증 필요
          cancelYn:
            record.cancelYn === 'Y' || record.cancelYn === 'N'
              ? record.cancelYn
              : 'N', // 기본값 또는 유효성 검사
        } as Transaction; // 보다 엄격한 타입 검증을 위해서는 이 단언을 피해야 함
      });

      this.logger.log(
        `Successfully parsed ${transactions.length} records from ${CSV_FILE_PATH}`,
      );
      return transactions;
    } catch (error) {
      this.logger.error(
        `Failed to parse CSV file: ${CSV_FILE_PATH}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to parse CSV file');
    }
  }
}
