import { Transaction } from './transaction.interface';
import { StoreTransaction } from './store-transaction.interface';

export interface MergeTransaction extends Transaction, StoreTransaction {}
