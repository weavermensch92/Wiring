# 배포 규칙 (Deploy)

## 인프라

| 서비스 | 플랫폼 | 역할 |
|--------|--------|------|
| Frontend (Next.js) | **Vercel** | 정적 + SSR |
| 백엔드 | 미정 | 현재 미구현 |
| DB | 미정 | 현재 미구현 |

## Vercel 배포

- **배포 트리거**: GitHub `main` 브랜치 push 시 자동 배포
- **빌드 명령**: `pnpm build`
- **루트 디렉토리**: `Wiring/`

## Git 브랜치 규칙

- **모든 커밋은 `main` 브랜치에 직접** 푸시
- feature 브랜치 생성 금지
- 작업 전 `git pull origin main` 확인

## GitHub 레포

- `https://github.com/weavermensch92/Wiring.git`
- `main` 브랜치가 항상 최신

## 개발 서버

```bash
cd Wiring
pnpm dev
# → http://localhost:3000
```

## 빌드 확인

```bash
cd Wiring
npx next build
```

## AGENTS.md 핵심

```
# This is NOT the Next.js you know
This version has breaking changes — APIs, conventions, and file structure
may all differ from your training data.
Read the relevant guide in node_modules/next/dist/docs/ before writing any code.
```

## 기술 스택 요약

```
Frontend: Next.js 16.2.2 + TypeScript + Tailwind CSS v4 + shadcn/ui
State:    Zustand (클라이언트 전용, 더미 데이터)
Build:    pnpm + Turbopack
Deploy:   Vercel (main 브랜치 자동 배포)
```

## 환경변수

현재 없음 (더미 데이터 전용). 백엔드 연동 시 추가 예정:

| 변수 | 설명 |
|------|------|
| `NEXT_PUBLIC_API_URL` | 백엔드 API URL |
| `NEXTAUTH_SECRET` | 인증 비밀키 (인증 연동 시) |
