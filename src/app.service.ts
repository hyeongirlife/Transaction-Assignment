import { Injectable } from '@nestjs/common';

/**
 * 애플리케이션의 메인 서비스입니다.
 */
@Injectable()
export class AppService {
  /**
   * "Hello World!" 메시지를 반환합니다.
   * @returns {string} "Hello World!" 문자열
   */
  getHello(): string {
    return 'Hello World!';
  }
}
