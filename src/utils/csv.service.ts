// src/utils/csv.service.ts
import { Injectable } from '@nestjs/common';
import { Transaction } from '../common/interfaces/transaction.interface';
import * as fs from 'fs';
import { parse } from 'csv-parse/sync';

@Injectable()
export class CsvService {
  async parseCsv(): Promise<Transaction[]> {
    const content = fs.readFileSync('transaction.csv', 'utf-8');
    return parse(content, {
      columns: true,
      skip_empty_lines: true,
    }) as Transaction[];
  }
}
