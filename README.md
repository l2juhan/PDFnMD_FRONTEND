# PDFnMD Frontend

PDF를 GFM(GitHub Flavored Markdown)으로 변환하는 웹 서비스의 프론트엔드입니다.

## 개요

- **프레임워크**: Astro 5.x (Static Site Generation)
- **UI**: React 19.x (Islands Architecture)
- **스타일링**: Tailwind CSS 4.x
- **언어**: TypeScript (strict mode)
- **다국어**: 한국어, 영어

## 주요 기능

| 기능 | 설명 |
|------|------|
| PDF 업로드 | 단일 파일 업로드 (최대 20MB) |
| 변환 상태 표시 | 실시간 진행률 (폴링 2초 간격) |
| 클립보드 복사 | 변환된 GFM 텍스트 복사 |
| 다국어 지원 | 한국어/영어 전환 |

## 시작하기

### 요구사항

- Node.js 18+
- npm 9+

### 설치

```bash
npm install
```

### 개발 서버

```bash
npm run dev
```

http://localhost:4321 에서 확인

### 프로덕션 빌드

```bash
npm run build
npm run preview  # 빌드 결과 미리보기
```

## 프로젝트 구조

```
src/
├── pages/           # Astro 페이지
│   └── index.astro  # 메인 페이지
├── components/      # React 컴포넌트 (Islands)
│   ├── FileUploader.tsx
│   ├── ConversionStatus.tsx
│   ├── ResultViewer.tsx
│   └── LanguageSwitcher.tsx
├── layouts/         # 공통 레이아웃
│   └── Layout.astro
├── styles/          # 전역 스타일
│   └── global.css   # Tailwind 임포트
├── services/        # API 통신
│   └── api.ts
├── types/           # TypeScript 타입
├── constants/       # 상수 정의
├── i18n/            # 다국어 리소스
│   ├── ko.json
│   └── en.json
└── hooks/           # React 커스텀 훅
```

## 환경 변수

```env
# .env
PUBLIC_API_URL=http://localhost:8000/api
```

## 백엔드 API 연동

| 엔드포인트 | 메서드 | 설명 |
|-----------|--------|------|
| `/api/convert` | POST | PDF 업로드 및 변환 시작 |
| `/api/status/{task_id}` | GET | 변환 상태 조회 |
| `/api/content/{task_id}` | GET | GFM 콘텐츠 조회 |

## 아키텍처

```
┌─────────────────────────────────────────────────────────┐
│                    Astro (SSG)                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │              정적 HTML 생성                      │   │
│  └─────────────────────────────────────────────────┘   │
│                         │                               │
│  ┌─────────────────────────────────────────────────┐   │
│  │           React Islands (client:load)           │   │
│  │  ┌──────────────┐  ┌──────────────────────────┐ │   │
│  │  │ FileUploader │  │ ConversionStatus         │ │   │
│  │  │              │  │ (폴링 + 상태 표시)        │ │   │
│  │  └──────────────┘  └──────────────────────────┘ │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          │
                          │ HTTPS
                          ▼
                  ┌───────────────┐
                  │ FastAPI 백엔드 │
                  │ (localhost:8000)│
                  └───────────────┘
```

## 브라우저 지원

- Chrome 90+
- Firefox 90+
- Safari 14+
- Edge 90+

## 관련 문서

- [SRS.md](../SRS.md) - 소프트웨어 요구사항 명세
- [HLD.md](../HLD.md) - 고수준 설계 문서
- [backend-DDS.md](../backend-DDS.md) - 백엔드 상세 설계

## 라이선스

MIT
