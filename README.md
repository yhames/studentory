# Studentory

Studentory는 선생님의 학생, 수업, 교재, 상담, 교육자료 업무를 한곳에서 관리하기 위한 웹 애플리케이션입니다. Notion 중심의 분산된 기록을 학생별 맥락과 일일 수업 흐름을 중심으로 통합하는 것이 목표입니다.

## 현재 범위

현재 저장소에는 다음 기능의 초기 구현이 있습니다.

- 학생 목록, 생성, 수정, 상세 조회
- 학생별 정기 수업 일정 관리
- 수업 목록, 생성, 수정, 완료, 취소
- FastAPI API와 React 클라이언트

전체 제품 범위와 미확정 규칙은 [PRODUCT_SPEC.md](PRODUCT_SPEC.md), 구현 순서와 완료 조건은 [docs/ROADMAP.md](docs/ROADMAP.md)를 기준으로 합니다. `PRODUCT_SPEC.md`의 Open Questions는 명시적으로 결정되기 전까지 구현 규칙으로 간주하지 않습니다.

UI 구현과 검토는 [docs/UI_SPEC.md](docs/UI_SPEC.md)의 시각 방향, 상태 매트릭스, 평가 루브릭을 기준으로 합니다.

## 기술 스택

- Backend: Python 3.12, FastAPI, SQLModel, pytest, Ruff, Pyright, uv
- Frontend: React 19, TypeScript, Vite, React Router, pnpm, Oxlint, Playwright
- Observability: Sentry SDK for FastAPI and React, disabled until DSNs are configured
- Local database: SQLite

## 로컬 실행

### Backend

```powershell
cd backend
Copy-Item .env.tpl .env
uv sync
uv run backend
```

기본 API 주소는 `http://localhost:8000`입니다. 로컬 데이터베이스는 `backend/data/studentory.db`에 생성됩니다.

### Frontend

새 터미널에서 실행합니다.

```powershell
cd frontend
pnpm install
pnpm dev
```

기본 화면 주소는 `http://localhost:5173`입니다. 다른 API 주소를 사용하려면 프론트엔드 환경에 `VITE_API_BASE_URL`을 설정합니다.

Sentry 설정은 [docs/CI_AND_SECURITY.md](docs/CI_AND_SECURITY.md)를 확인합니다. DSN이 비어 있으면 로컬과 CI에서 Sentry는 비활성화됩니다. 취약점은 공개 Issue 대신 [SECURITY.md](SECURITY.md)의 비공개 신고 절차를 사용합니다.

## 검증

저장소 루트에서 전체 검증을 실행합니다.

```powershell
powershell -ExecutionPolicy Bypass -File scripts/verify.ps1
```

로컬 검증은 빠른 피드백용입니다. 푸시된 브랜치와 Pull Request의 최종 완료 기준은 GitHub Actions의 `Completion gate`입니다. 저장소 보안 설정과 운영 방법은 [docs/CI_AND_SECURITY.md](docs/CI_AND_SECURITY.md)를 확인합니다.

개별 검증 명령은 다음과 같습니다.

```powershell
cd backend
uv run ruff check .
uv run pyright
uv run pytest

cd ../frontend
pnpm lint
pnpm typecheck
pnpm build
pnpm exec playwright install chromium
pnpm e2e
```

검증 스크립트는 기본적으로 설치된 의존성을 사용합니다. 의존성을 설치하거나 갱신하려면 `scripts/verify.ps1 -Install`을 사용합니다.

## LLM 기반 개발 워크플로

저장소 전용 Codex Skill은 `.agents/skills/`에 있습니다.

- `$implement-feature-slice`: 로드맵의 수직 기능 하나를 백엔드부터 UI까지 구현
- `$verify-cross-stack`: 변경 범위에 맞는 백엔드·프론트엔드 검증 실행
- `$review-ui`: 실제 브라우저에서 주요 UI 상태와 상호작용 검토
- `$ci-failure-loop`: 실제 GitHub Actions 또는 CodeQL 실패 로그를 기반으로 복구
- `$github-issue`: Roadmap과 제품 문서를 기반으로 GitHub Issue 추천·생성·수정·분류
- `$git-commit`: 의도한 파일만 명시적으로 스테이징하고 검증 근거와 함께 커밋
- `$github-pr`: Issue가 연결된 PR을 만들고 실제 CI와 CodeQL 상태까지 확인

장기 작업은 [docs/FIRST_GOAL.md](docs/FIRST_GOAL.md)의 `/goal` 프롬프트로 시작할 수 있습니다. 각 반복은 한 가지 병목만 수정하고, 검증 결과를 [docs/LOOP_LOG.md](docs/LOOP_LOG.md)에 남깁니다.

GitHub 작업은 `Roadmap → Issue → 구현 → 검증 → PR → Completion gate와 CodeQL → Issue 종료` 순서로 진행합니다. 운영 보강 작업과 완료 조건은 [docs/LOOP_ENGINEERING_CHECKLIST.md](docs/LOOP_ENGINEERING_CHECKLIST.md)를 기준으로 합니다.

## 저작권과 사용

이 저장소에는 오픈 소스 라이선스를 부여하지 않습니다. 별도의 서면 허가가 없는 한 저장소 콘텐츠를 복제, 수정, 배포하거나 파생물을 만드는 권한은 부여되지 않습니다. 모든 권리는 저작권자에게 있습니다.

공개 저장소의 열람과 GitHub 내 fork에는 GitHub Terms of Service가 적용됩니다. 저장소 공개는 그 범위를 넘어서는 추가 사용 허가를 의미하지 않습니다.

## 저장소 구조

```text
studentory/
├── backend/            FastAPI 애플리케이션과 테스트
├── frontend/           React 애플리케이션
├── .agents/skills/     저장소 전용 Codex Skill
├── docs/               로드맵, Goal, 반복 기록
├── scripts/            공통 검증 명령
├── AGENTS.md           저장소 작업 규칙
└── PRODUCT_SPEC.md     제품 요구사항과 미확정 질문
```
