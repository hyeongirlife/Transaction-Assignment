const express = require('express');
const app = express();
app.use(express.json());
const port = 4002;

// 100개의 고정된 StoreTransaction 데이터 생성
const storeTransactions = Array.from({ length: 100 }, (_, i) => {
  const transactionId = `tx-${i + 1}`;
  const storeIdNumber = (i % 10) + 1; // mock-server-4001의 storeId 생성 로직과 일치
  const storeId = `store-${storeIdNumber}`;

  return {
    storeId: storeId,
    transactionId: transactionId,
    productId: `prod-${i + 1}`, // prod-1 부터 prod-100 까지
  };
});

app.post('/store-transaction/:storeId', (req, res) => {
  const { storeId: paramStoreId } = req.params; // 요청 파라미터 storeId
  const { page = 1, date, pageSize = 10 } = req.body;

  console.log(`📥 4002 서버 요청: POST /store-transaction/${paramStoreId}`);
  console.log(`📥 4002 서버 요청 바디:`, { page, date, pageSize });

  // 요청된 storeId로 필터링
  const filteredByStoreId = storeTransactions.filter(
    (st) => st.storeId === paramStoreId,
  );

  let responseList;
  let totalPage;

  if (pageSize === 1000) {
    // pageSize가 1000이면 필터링된 모든 데이터 반환
    responseList = filteredByStoreId;
    totalPage = 1;
  } else {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    responseList = filteredByStoreId.slice(start, end);
    totalPage = Math.ceil(filteredByStoreId.length / pageSize);
  }

  console.log(
    `📤 4002 서버 응답: ${responseList.length}개 데이터 반환 (총 ${totalPage}페이지)`,
  );

  res.json({
    list: responseList,
    pageInfo: { totalPage },
  });
});

app.listen(port, () => {
  console.log(`✅ 4002 서버 실행 중: http://localhost:${port}`);
});
