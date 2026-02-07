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

http://localhost:5174 에서 확인

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
├── components/      # Astro/React 컴포넌트
│   ├── Converter/            # 파일 변환 (React Island)
│   │   ├── index.tsx         # 메인 컴포넌트
│   │   ├── FileUploader.tsx  # 파일 선택/드래그 앤 드롭
│   │   ├── SelectedFile.tsx  # 선택된 파일 표시
│   │   ├── ActionButton.tsx  # 상태별 버튼 + 프로그레스
│   │   └── types.ts          # 타입 정의
│   ├── AdBanner.astro        # 광고 배너 플레이스홀더
│   ├── Header.astro          # 네비게이션
│   ├── Hero.astro            # 히어로 섹션
│   ├── DemoSection.astro     # 데모 GIF 영역
│   ├── HowToUse.astro        # 사용 방법 3단계
│   ├── Features.astro        # 특징 그리드
│   ├── FAQ.astro             # FAQ 아코디언
│   ├── Footer.astro          # 푸터
│   └── icons/NotionIcon.astro
├── layouts/         # 공통 레이아웃
│   └── Layout.astro # Google Fonts + SEO
├── styles/          # 전역 스타일
│   └── global.css   # Tailwind 테마 + 유틸리티
├── api/             # API 통신 (axios)
│   ├── index.ts     # axios 인스턴스 + 인터셉터
│   ├── convert.ts   # POST /convert
│   ├── status.ts    # GET /status/{task_id}
│   ├── content.ts   # GET /content/{task_id}
│   └── exports.ts   # 통합 export
├── types/           # TypeScript 타입
│   ├── api.ts       # API 요청/응답 타입
│   └── index.ts
├── i18n/            # 다국어 리소스 (i18next)
│   ├── index.ts     # i18next 설정
│   ├── ko.json      # 한국어
│   └── en.json      # 영어
└── hooks/           # React 커스텀 훅
    ├── useConversion.ts  # 변환 로직 (상태 머신 + API)
    └── usePolling.ts     # 폴링 유틸리티
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
│  ┌─────────────────────────────────────────────────┐    │
│  │              정적 HTML 생성                     │    │
│  └─────────────────────────────────────────────────┘    │
│                         │                               │
│  ┌─────────────────────────────────────────────────┐    │
│  │           React Islands (client:load)           │    │
│  │  ┌──────────────────────────────────────────┐   │    │
│  │  │               Converter                  │   │    │
│  │  │  FileUploader + ActionButton + 상태머신  │   │    │
│  │  └──────────────────────────────────────────┘   │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
                          │
                          │ HTTPS
                          ▼
                  ┌───────────────────┐
                  │  FastAPI 백엔드   │
                  │ (localhost:8000)  │
                  └───────────────────┘
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
