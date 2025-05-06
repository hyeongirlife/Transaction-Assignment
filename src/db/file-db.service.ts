// src/db/file-db.service.ts
import { Injectable } from '@nestjs/common';
import { JsonDB, Config } from 'node-json-db';

@Injectable()
export class FileDbService {
  private db: JsonDB;

  constructor() {
    this.db = new JsonDB(new Config('db.json', true, true, '/'));
  }

  async get<T>(path: string): Promise<T> {
    return this.db.getData(path);
  }

  async set<T>(path: string, data: T): Promise<void> {
    this.db.push(path, data, true);
  }

  async exists(path: string): Promise<boolean> {
    try {
      this.db.getData(path);
      return true;
    } catch {
      return false;
    }
  }

  async push<T>(path: string, data: T): Promise<void> {
    this.db.push(path, data, false);
  }
}
