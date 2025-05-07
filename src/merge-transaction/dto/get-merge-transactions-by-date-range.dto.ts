import { IsString, IsNotEmpty, Matches } from 'class-validator';

/**
 * 날짜 범위로 병합된 트랜잭션을 조회하기 위한 DTO입니다.
 */
export class GetMergeTransactionsByDateRangeDto {
  /**
   * 조회 시작 날짜 (YYYY-MM-DD 형식)
   * @example '2023-01-01'
   */
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: '시작 날짜는 YYYY-MM-DD 형식이어야 합니다.',
  })
  start: string;

  /**
   * 조회 종료 날짜 (YYYY-MM-DD 형식)
   * @example '2023-01-31'
   */
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: '종료 날짜는 YYYY-MM-DD 형식이어야 합니다.',
  })
  end: string;
}
