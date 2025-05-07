import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

/**
 * 애플리케이션의 메인 컨트롤러입니다.
 */
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * "Hello World!" 메시지를 반환합니다.
   * @returns {string} "Hello World!" 문자열
   */
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
