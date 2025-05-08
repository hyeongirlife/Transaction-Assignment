
# Transaction-Assignment

## 설명 (Description)

이 서비스는 주기적으로 거래 데이터를 수집하고, 보강하여 저장하도록 설계된 NestJS 애플리케이션입니다. 매 분마다 배치 프로세스를 실행하여 다음을 수행합니다:

1. 모의 서버 (`mock-servers/mock1`) 및 로컬 CSV 파일 (`transaction.csv`)에서 초기 거래 데이터를 가져옵니다.
2. 다른 모의 서버 (`mock-servers/mock2`)에서 관련 "상점 거래" 세부 정보를 가져옵니다.
3. 각 거래에 대해 이 두 데이터 소스를 병합합니다.
4. 최종 병합된 거래 데이터를 JSON 기반 파일 데이터베이스 (`db.json`)에 저장합니다.
5. 각 배치 실행 결과(성공, 실패, 소요 시간)를 기록합니다.

또한 이 서비스는 병합된 거래 및 배치 기록을 조회할 수 있는 API 엔드포인트를 제공합니다.

## 주요 기능 (Features)

- 예약된 데이터 수집 및 처리 (매 분).
- 여러 소스(REST API (모의), CSV 파일)로부터 데이터 수집.
- 다양한 소스의 정보를 결합하여 데이터 보강.
- 파일 기반 JSON 데이터베이스를 사용한 처리된 데이터의 영구 저장.
- 배치 작업 기록 로깅.
- 외부 종속성에 대한 Dockerized 모의 서버 포함으로 개발 및 테스트 용이성 증대.
- 처리된 데이터 및 배치 기록 접근을 위한 API 엔드포인트 제공.

## 사전 요구 사항 (Prerequisites)

- Node.js (v18+ 권장)
- Yarn
- Docker (모의 서버 실행용)

## 설치 (Installation)

1. 저장소 복제:
   ```bash
   # git clone <repository-url>
   cd toss-nodejs-assignment
   ```
2. 의존성 설치:
   ```bash
   yarn install
   ```

## 애플리케이션 실행 (Running the Application)

### 1. 모의 서버 시작 (Start Mock Servers)

애플리케이션은 거래 및 상점 데이터를 가져오기 위해 모의 서버에 의존합니다. 주 애플리케이션을 시작하기 전에 이 서버들이 실행 중이어야 합니다.

```bash
yarn run mock-server:start
```

이 명령어는 `mock-servers/docker-compose.yml`에 정의된 모의 서버를 빌드하고 실행하기 위해 Docker Compose를 사용합니다.

- 모의 서버 1 (거래 데이터 소스): `http://localhost:8081`
- 모의 서버 2 (상점 거래 데이터 소스): `http://localhost:8082`

### 2. 주 애플리케이션 시작 (Start the Main Application)

모의 서버가 실행되면 NestJS 애플리케이션을 시작할 수 있습니다:

- **개발 모드 (핫 리로딩 지원):**

  ```bash
  yarn run start:dev
  ```

  애플리케이션은 `http://localhost:3000`에서 사용할 수 있습니다.
- **프로덕션 모드:**

  ```bash
  yarn run build
  yarn run start:prod
  ```

## 테스트 실행 (Running Tests)

- **유닛 테스트:**

  ```bash
  yarn run test
  ```
- **End-to-End (E2E) 테스트:**
  E2E 테스트를 실행하기 전에 모의 서버가 실행 중인지 확인하십시오 (`yarn run mock-server:start`).

  ```bash
  yarn run test:e2e
  ```
- **테스트 커버리지:**

  ```bash
  yarn run test:cov
  ```

## API 엔드포인트 (API Endpoints)

애플리케이션은 다음 REST API 엔드포인트를 제공합니다:

- **`GET /merge-transactions`**: 병합된 거래 데이터를 조회합니다.

  - **쿼리 매개변수**:
    - `start` (문자열, ISO 8601 날짜 형식, 예: `2023-01-01T00:00:00.000Z`): 날짜 범위의 시작.
    - `end` (문자열, ISO 8601 날짜 형식, 예: `2023-01-31T23:59:59.999Z`): 날짜 범위의 끝.
  - **예시**: `curl "http://localhost:3000/merge-transactions?start=2024-01-01T00:00:00.000Z&end=2024-12-31T23:59:59.999Z"`
  - **성공 응답 (200 OK)**: 병합된 거래 객체의 배열.
- **`GET /history/batch-history`**: 모든 배치 처리 작업의 기록을 조회합니다.

  - **예시**: `curl http://localhost:3000/history/batch-history`
  - **성공 응답 (200 OK)**: 각 배치 실행(시작 시간, 종료 시간, 총 항목 수, 성공, 실패, 오류)을 상세히 기록한 배치 기록 객체의 배열.

## 프로젝트 구조 개요 (Project Structure Overview)

- `src/`: 애플리케이션 소스 코드를 포함합니다.
  - `main.ts`: 애플리케이션 진입점.
  - `app.module.ts`: 루트 모듈, 다른 모든 모듈을 통합합니다.
  - `batch/`: 예약된 배치 처리 로직 (`BatchService`).
  - `transaction/`: 모의 서버 1에서 초기 거래 데이터를 가져오는 서비스 (`TransactionService`).
  - `store-transaction/`: 모의 서버 2에서 상점 거래 데이터를 가져오는 서비스 (`StoreTransactionService`).
  - `merge-transaction/`: 거래를 병합하고 저장하며, API 엔드포인트를 제공하는 서비스 및 컨트롤러 (`MergeTransactionService`, `MergeTransactionController`).
  - `db/`: JSON 파일 데이터베이스와 상호 작용하는 서비스 (`FileDbService`).
  - `history/`: 배치 작업 기록을 관리하고 노출하는 서비스 및 컨트롤러 (`BatchHistoryService`, `BatchHistoryController`).
  - `utils/`: 유틸리티 서비스, 예: CSV 파싱 (`CsvService`).
  - `common/`: 공유 인터페이스, DTO 등.
- `mock-servers/`: 모의 API 서비스를 위한 Docker 설정 및 데이터를 포함합니다.
  - `mock1/`: 주요 거래 데이터를 위한 모의 서버.
  - `mock2/`: 상점 거래 데이터를 위한 모의 서버.
  - `docker-compose.yml`: 모의 서버를 실행하기 위한 Docker Compose 파일.
- `transaction.csv`: 배치 프로세스에서 데이터 소스로 사용되는 샘플 CSV 파일.
- `db.json`: 병합된 거래 및 배치 기록을 저장하는 데 사용되는 JSON 파일 데이터베이스 (자동 생성됨).

## 주요 기술 (Key Technologies)

- [NestJS](https://nestjs.com/): 효율적이고 신뢰할 수 있으며 확장 가능한 서버 측 애플리케이션을 구축하기 위한 진보적인 Node.js 프레임워크입니다.
- [TypeScript](https://www.typescriptlang.org/): 타입이 추가된 JavaScript의 상위 집합입니다.
- [Docker](https://www.docker.com/): 모의 서버를 컨테이너화하고 실행하기 위해 사용됩니다.
- [node-json-db](https://www.npmjs.com/package/node-json-db): 간단한 JSON 파일 기반 데이터베이스입니다.
- [csv-parse](https://csv.js.org/parse/): CSV 파일을 파싱하기 위해 사용됩니다.
- [@nestjs/schedule](https://docs.nestjs.com/techniques/task-scheduling): 크론 작업 및 예약된 작업을 위해 사용됩니다.
- [Jest](https://jestjs.io/): JavaScript 테스트 프레임워크입니다.

## 라이선스 (License)

UNLICENSED
