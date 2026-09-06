export enum TransactionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  DECLINED = 'DECLINED',
  ERROR = 'ERROR',
}

export const PAYABLE_STATUSES: ReadonlyArray<TransactionStatus> = [
  TransactionStatus.PENDING,
  TransactionStatus.ERROR,
];

export const FINAL_STATUSES: ReadonlyArray<TransactionStatus> = [
  TransactionStatus.APPROVED,
  TransactionStatus.DECLINED,
];
