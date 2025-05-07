const fs = require('fs');

// 1000개 Transaction 데이터 생성
const transactions = Array.from({ length: 1000 }, (_, i) => ({
  amount: Math.floor(Math.random() * 100000),
  balance: Math.floor(Math.random() * 1000000),
  cancelYn: Math.random() > 0.5 ? 'Y' : 'N',
  date: new Date(Date.now() - Math.floor(Math.random() * 30) * 86400000)
    .toISOString()
    .split('T')[0], // yyyy-MM-dd
  storeId: `store-${Math.floor(Math.random() * 10) + 1}`,
  transactionId: `tx-${i + 1}`,
}));

// CSV 헤더
const header = 'amount,balance,cancelYn,date,storeId,transactionId\n';

// CSV 데이터
const csvData = transactions
  .map(
    (tx) =>
      `${tx.amount},${tx.balance},${tx.cancelYn},${tx.date},${tx.storeId},${tx.transactionId}`,
  )
  .join('\n');

// CSV 파일 생성
fs.writeFileSync('transaction.csv', header + csvData);
console.log('transaction.csv 파일이 생성되었습니다.');
