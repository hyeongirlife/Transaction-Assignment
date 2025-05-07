import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

const DEFAULT_PORT = 3000;

/**
 * NestJS 애플리케이션을 초기화하고 시작합니다.
 */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  await app.listen(DEFAULT_PORT);
  console.log(`🚀 Application is running on: http://localhost:${DEFAULT_PORT}`);
}

bootstrap();
