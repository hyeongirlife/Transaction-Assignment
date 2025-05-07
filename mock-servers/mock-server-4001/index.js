const express = require('express');
const app = express();
const port = 4001;

// 100개의 고정된 Transaction 데이터 생성
const transactions = Array.from({ length: 100 }, (_, i) => {
  const transactionId = `tx-${i + 1}`;
  const storeIdNumber = (i % 10) + 1; // store-1 부터 store-10 까지 순환
  const storeId = `store-${storeIdNumber}`;
  const date = new Date();
  date.setDate(date.getDate() - (i % 30)); // 최근 30일간의 데이터로 분산

  return {
    amount: (i + 1) * 100, // 100, 200, ..., 10000
    balance: (i + 1) * 1000 + 50000, // 50100, 50200, ..., 60000
    cancelYn: i % 2 === 0 ? 'N' : 'Y', // 짝수 인덱스는 N, 홀수는 Y
    date: date.toISOString().split('T')[0], // yyyy-MM-dd
    storeId: storeId,
    transactionId: transactionId,
  };
});

app.get('/transaction', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  // pageSize 파라미터를 읽어오되, 기본값 10, 최대 1000 (전체 조회용)
  const pageSize = parseInt(req.query.pageSize) || 10;

  console.log(
    `📥 4001 서버 요청: GET /transaction?page=${page}&pageSize=${pageSize}`,
  );

  let responseList;
  let totalPage;

  if (pageSize === 1000) {
    // pageSize가 1000이면 모든 데이터 반환 (기존 로직 유지)
    responseList = transactions;
    totalPage = 1;
  } else {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    responseList = transactions.slice(start, end);
    totalPage = Math.ceil(transactions.length / pageSize);
  }

  console.log(
    `📤 4001 서버 응답: ${responseList.length}개 데이터 반환 (총 ${totalPage}페이지)`,
  );

  res.json({
    list: responseList,
    pageInfo: { totalPage },
  });
});

app.listen(port, () => {
  console.log(`✅ 4001 서버 실행 중: http://localhost:${port}`);
});
