// src/db/file-db.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { JsonDB, Config } from 'node-json-db';

/**
 * 파일 기반 데이터베이스(`db.json`)와 상호작용하는 서비스입니다.
 * `node-json-db` 라이브러리를 사용하여 데이터를 관리합니다.
 */
@Injectable()
export class FileDbService {
  private readonly logger = new Logger(FileDbService.name);
  private db: JsonDB;

  constructor() {
    try {
      // saveOnPush=true (데이터 변경 시 즉시 저장), humanReadable=true (사람이 읽기 쉬운 JSON 형식)
      this.db = new JsonDB(new Config('db.json', true, true, '/'));
      this.initializeDb();
    } catch (error) {
      this.logger.error('Failed to initialize FileDbService', error.stack);
      // db.json 파일 접근 불가 시 애플리케이션이 정상 동작하기 어려우므로 에러를 다시 던집니다.
      throw error;
    }
  }

  /**
   * 데이터베이스의 주요 경로들이 존재하지 않으면 초기화합니다.
   */
  private async initializeDb(): Promise<void> {
    const pathsToInitialize: { path: string; defaultValue: any }[] = [
      { path: '/mergeTransactionsById', defaultValue: {} },
      { path: '/mergeTransactions', defaultValue: [] },
      { path: '/batchHistory', defaultValue: [] },
    ];

    for (const item of pathsToInitialize) {
      try {
        await this.db.push(item.path, item.defaultValue, true); // override=true ensures it overwrites
        this.logger.log(`Reset path: ${item.path} in db.json to default value`);
      } catch (error) {
        this.logger.error(
          `Failed to reset DB path: ${item.path} to default value`,
          error.stack,
        );
        // 특정 경로 초기화 실패 시 에러를 전파하거나, 추가적인 처리를 할 수 있습니다.
        // 여기서는 에러를 로깅만 하고 계속 진행합니다.
      }
    }
  }

  /**
   * 지정된 경로에서 데이터를 가져옵니다.
   * @template T 데이터의 타입
   * @param {string} path 데이터를 가져올 경로
   * @returns {Promise<T>} 해당 경로의 데이터
   * @throws {Error} 경로를 찾을 수 없거나 데이터를 가져오는 데 실패한 경우
   */
  async get<T>(path: string): Promise<T> {
    try {
      return await this.db.getData(path);
    } catch (error) {
      this.logger.error(`Failed to get data from path: ${path}`, error.stack);
      throw error; // 에러를 다시 던져 호출 측에서 처리하도록 함
    }
  }

  /**
   * 지정된 경로에 데이터를 설정(덮어쓰기 또는 생성)합니다.
   * @template T 데이터의 타입
   * @param {string} path 데이터를 설정할 경로
   * @param {T} data 저장할 데이터
   * @returns {Promise<void>}
   * @throws {Error} 데이터 설정에 실패한 경우
   */
  async set<T>(path: string, data: T): Promise<void> {
    try {
      // node-json-db의 push 메서드는 세 번째 인자(override)가 true일 때
      // 경로가 존재하지 않으면 생성하고, 존재하면 데이터를 덮어씁니다.
      await this.db.push(path, data, true);
    } catch (error) {
      this.logger.error(`Failed to set data at path: ${path}`, error.stack);
      throw error;
    }
  }

  /**
   * 지정된 경로가 데이터베이스에 존재하는지 확인합니다.
   * @param {string} path 확인할 경로
   * @returns {Promise<boolean>} 경로 존재 여부
   */
  async exists(path: string): Promise<boolean> {
    try {
      return await this.db.exists(path);
    } catch (error) {
      this.logger.error(
        `Failed to check existence of path: ${path}`,
        error.stack,
      );
      return false; // exists 확인 중 에러 발생 시, 안전하게 false 반환
    }
  }

  /**
   * 지정된 경로(배열)에 데이터를 추가합니다.
   * 경로의 마지막 부분이 배열 인덱스([])로 끝나야 합니다.
   * @template T 데이터의 타입
   * @param {string} path 데이터를 추가할 배열 경로 (예: '/users[]')
   * @param {T} data 추가할 데이터
   * @returns {Promise<void>}
   * @throws {Error} 데이터 추가에 실패한 경우
   */
  async push<T>(path: string, data: T): Promise<void> {
    try {
      // 배열에 push하는 경우 override는 false여야 기존 데이터를 유지하며 추가합니다.
      console.log('경로: ', path, '데이터: ', data);
      await this.db.push(path, data, false);
    } catch (error) {
      this.logger.error(`Failed to push data to path: ${path}`, error.stack);
      throw error;
    }
  }
}
