# PDFnMD Frontend

PDF → Markdown 변환 웹 서비스의 프론트엔드입니다.

## 기능

- **PDF → Markdown**: PDF 파일을 Markdown으로 변환
- **다중 파일 업로드**: 최대 20개 파일 동시 처리
- **다국어 지원**: 한국어 / 영어

## 기술 스택

| 분류 | 기술 |
|------|------|
| Framework | React 19 + TypeScript |
| Build | Vite 7 + SWC |
| Styling | Tailwind CSS v4 |
| HTTP Client | Axios |
| i18n | react-i18next |

## 시작하기

### 요구 사항

- Node.js 18+
- npm 9+

### 설치

```bash
npm install
```

### 환경 변수

`.env.example`을 `.env`로 복사하고 수정하세요:

```env
VITE_API_URL=http://localhost:8000/api
```

### 개발 서버 실행

```bash
npm run dev
```

개발 서버가 http://localhost:5174 에서 실행됩니다.

### 빌드

```bash
npm run build
```

빌드 결과물은 `dist/` 폴더에 생성됩니다.

## 프로젝트 구조

```
src/
├── constants/      # 상수 (제한값, 설정)
├── hooks/          # 커스텀 훅
│   ├── useConversion.ts    # 변환 상태 관리
│   ├── useFileUpload.ts    # 파일 업로드/검증
│   ├── usePolling.ts       # 상태 폴링
│   └── useDownload.ts      # 다운로드 처리
├── i18n/           # 다국어 (ko, en)
├── services/       # API 클라이언트
└── types/          # TypeScript 타입
```

## 제한 사항

| 항목 | 제한 |
|------|------|
| 최대 파일 수 | 20개 |
| 파일당 최대 크기 | 20MB |
| 총 최대 크기 | 100MB |
| 파일 보관 기간 | 24시간 |

## 스크립트

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | 개발 서버 실행 |
| `npm run build` | 프로덕션 빌드 |
| `npm run lint` | ESLint 검사 |
| `npm run preview` | 빌드 결과 미리보기 |

## 라이선스

Private
