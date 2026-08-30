# Loop Engineering Architecture

## 1. 문서 목적

이 문서는 Studentory에서 검증한 LLM 기반 개발 루프를 다른 저장소에 이식할 수 있도록 정리한 템플릿이다.

핵심 목표는 AI에게 많은 도구를 주는 것이 아니다. 다음 세 가지를 분리해 반복 가능하게 만드는 것이다.

1. 무엇을 구현해야 하는지 정하는 기준
2. 구현을 수행하는 재사용 가능한 절차
3. 구현자의 판단과 독립적으로 실패를 발견하고 병합을 막는 관찰 지점

이 문서의 경로와 명칭은 예시다. 다른 프로젝트에서는 기술 스택과 팀 규칙에 맞게 치환하되, 각 파일이 담당하는 책임은 유지한다.

## 2. Studentory 적용 상태

2026-08-30 기준 루프 아키텍처 설계와 검증은 완료되었다.

- 저장소 지침, 제품 기준, Roadmap, Goal, Loop Log가 연결되어 있다.
- 중복되지 않는 7개 저장소 전용 Skill이 역할별로 분리되어 있다.
- 로컬 검증, Playwright, GitHub Actions, CodeQL, Dependabot, 비밀 탐지가 구성되어 있다.
- `main` ruleset이 PR과 필수 검사를 강제한다.
- PR #12에서 Backend, Frontend, Browser E2E, Completion gate, CodeQL, GitGuardian 검사가 모두 통과했다.

단, PR #12가 아직 열려 있으므로 이 설계는 해당 브랜치에서는 완성되었지만 기본 브랜치 적용은 병합 후 완료된다. 제품 기능 루프는 Roadmap에 따라 계속 진행된다.

## 3. 핵심 설계 원칙

### 3.1 하나의 책임에는 하나의 기준만 둔다

- 제품 범위: 제품 스펙
- 구현 순서와 상태: Roadmap과 Issue
- 에이전트 행동 규칙: `AGENTS.md`
- 반복 가능한 작업 절차: Skill
- 실행 가능한 품질 기준: 검증 스크립트와 CI
- 병합 가능 여부: GitHub ruleset
- 반복 근거: Loop Log와 PR

같은 내용을 여러 Skill이나 문서에 복제하지 않는다. 기존 책임을 확장할 수 있으면 새 파일을 만들지 않는다.

### 3.2 저장소를 먼저 분석하고 나중에 수정한다

초기 세팅 또는 새 기능 시작 시 다음 항목을 읽기 전용으로 먼저 확인한다.

- 저장소 구조와 하위 `AGENTS.md`
- 패키지 및 잠금 파일
- 기존 lint, type-check, test, build, E2E 명령
- API와 데이터 계약
- 기존 CI와 브랜치 보호 규칙
- 현재 변경 사항과 사용자 소유 파일
- 이미 존재하는 Skill의 책임

이 분석이 끝나기 전에는 Skill, workflow, 의존성 또는 제품 코드를 추가하지 않는다. 이것이 `feature-loop-v2`, `review`, `final-review`, `verify`처럼 같은 책임의 Skill이 난립하는 것을 막는 첫 번째 장치다.

### 3.3 완료는 자기 선언이 아니라 외부 증거다

로컬 성공은 빠른 피드백일 뿐 최종 완료가 아니다. 병합 가능한 완료 상태는 다음 조건을 모두 만족해야 한다.

```text
요구사항 충족
  + 관련 로컬 검증 통과
  + 필요한 UI 검토 통과
  + PR 생성 및 Issue 연결
  + GitHub Actions 통과
  + CodeQL 및 보안 피드백 통과
  + ruleset의 필수 검사 충족
```

CI를 조회할 수 없으면 완료가 아니라 `CI 확인 대기`로 보고한다.

### 3.4 한 반복에는 한 병목만 다룬다

각 반복은 다음 순서로 동작한다.

```text
Observe → Select → Inspect → Change → Verify → Review → Record → Repeat
```

- Observe: Roadmap, Issue, 실패 로그, 현재 코드를 확인한다.
- Select: 가장 우선순위가 높은 미완료 항목 하나를 고른다.
- Inspect: 변경 전에 관련 구현과 계약을 읽는다.
- Change: 완료 조건을 만족하는 가장 작은 수직 변경을 만든다.
- Verify: 변경 범위에 맞는 로컬 검증을 실행한다.
- Review: 사용자 노출 UI 또는 고위험 변경을 별도 관점에서 검토한다.
- Record: Loop Log, Issue, PR에 증거와 남은 위험을 기록한다.
- Repeat: 완료되지 않았으면 다음 병목으로 이어간다.

## 4. 아키텍처 계층

| 계층 | 책임 | Studentory 구현 | 다른 프로젝트의 대체물 |
| --- | --- | --- | --- |
| 제품 기준 | 범위, 사용자, 규칙, 미확정 결정 | `PRODUCT_SPEC.md` | PRD, ADR, 도메인 스펙 |
| UI 기준 | 화면, 상태, 반응형, 접근성 | `docs/UI_SPEC.md` | 디자인 시스템, Figma 링크, UX 스펙 |
| 작업 상태 | 우선순위와 완료 조건 | `docs/ROADMAP.md`, GitHub Issues | Jira, Linear, GitHub Projects |
| 장기 목표 | 반복의 목적과 종료 조건 | `docs/FIRST_GOAL.md` | 프로젝트별 Goal 프롬프트 |
| 에이전트 정책 | 저장소 및 디렉터리별 행동 규칙 | `AGENTS.md`, 하위 `AGENTS.md` | 동일 구조 권장 |
| 작업 절차 | 역할별 재사용 워크플로 | `.agents/skills/*` | 조직 또는 저장소 Skill |
| 로컬 검증 | 결정론적인 빠른 피드백 | `scripts/verify.ps1` | Makefile, Taskfile, shell script |
| UI 검증 | 실제 브라우저 행동과 시각 상태 | Playwright, `review-ui` | Cypress, WebdriverIO, 수동 QA |
| 외부 관찰 | 독립적인 품질·보안 피드백 | Actions, CodeQL, Dependabot, GitGuardian | 사용하는 CI와 보안 도구 |
| 병합 강제 | 검사를 우회할 수 없는 최종 gate | `.github/rulesets/main.json` | GitLab protected branch 등 |
| 증거 | 반복 결과와 결정 기록 | `docs/LOOP_LOG.md`, Issue, PR | 실행 로그, 배포 기록 |
| 보안 정책 | 신고 방식과 지원 범위 | `SECURITY.md` | 조직 보안 정책 |

흐름은 다음과 같다.

```text
Product Spec / UI Spec
          ↓
Roadmap → GitHub Issue
          ↓
Goal + AGENTS.md + Skill
          ↓
Small vertical implementation
          ↓
Local verify → UI review
          ↓
Commit → Pull Request
          ↓
CI / E2E / CodeQL / Security observers
          ↓
Required Completion gate
          ↓
Merge → Issue close → Loop Log update
```

실패는 이전 단계로 되돌아간다. CI 실패는 실제 job log에서 원인을 찾고, 요구사항이 불명확하면 결정 Issue로 전환하며, 외부 권한이 없으면 성공을 추정하지 않고 대기로 남긴다.

## 5. Studentory 참고 파일

다른 저장소에 적용할 때 다음 파일을 역할별 예제로 참고한다.

### 정책과 제품 기준

- `AGENTS.md`: 루트 오케스트레이션, 계약, 보안, 테스트, 완료 기준
- `backend/AGENTS.md`: FastAPI 영역의 구체 규칙
- `frontend/AGENTS.md`: React 영역의 구체 규칙
- `PRODUCT_SPEC.md`: 제품 범위와 Open Questions
- `docs/UI_SPEC.md`: 사용자 경험과 화면 검증 기준

### 상태와 반복 기록

- `docs/ROADMAP.md`: 구현 순서, 상태, 완료 조건, Issue 연결
- `docs/FIRST_GOAL.md`: 장기 실행을 시작하는 `/goal` 프롬프트
- `docs/LOOP_LOG.md`: 반복별 관찰, 변경, 검증, 다음 병목

### 재사용 가능한 Skill

- `.agents/skills/github-issue/SKILL.md`: 작업 선택과 Issue 관리
- `.agents/skills/implement-feature-slice/SKILL.md`: 수직 기능 구현
- `.agents/skills/verify-cross-stack/SKILL.md`: 변경 범위별 정식 검증
- `.agents/skills/review-ui/SKILL.md`: 브라우저 기반 UI/UX 검토
- `.agents/skills/ci-failure-loop/SKILL.md`: 실제 CI 실패 로그 기반 복구
- `.agents/skills/git-commit/SKILL.md`: 명시적 staging과 근거 있는 커밋
- `.agents/skills/github-pr/SKILL.md`: PR, push, CI 확인

### 자동화와 독립 관찰 지점

- `scripts/verify.ps1`: 로컬 정식 검증 진입점
- `.github/workflows/ci.yml`: lint, type-check, test, build, Playwright, Completion gate
- `.github/workflows/codeql.yml`: 언어별 정적 보안 분석
- `.github/dependabot.yml`: 의존성 업데이트 관찰
- `.github/rulesets/main.json`: 기본 브랜치의 필수 검사와 PR 강제 규칙
- `.github/ISSUE_TEMPLATE/`: 작업 종류별 입력 계약
- `.github/pull_request_template.md`: 변경 및 검증 증거 계약
- `SECURITY.md`: Private Security Advisory 기반 신고 정책

## 6. 복사 가능한 기본 디렉터리 템플릿

```text
<project>/
├── AGENTS.md
├── README.md
├── PRODUCT_SPEC.md
├── SECURITY.md
├── LOOP_ARCHITECTURE.md
├── backend/
│   └── AGENTS.md                 # 백엔드가 있을 때만
├── frontend/
│   └── AGENTS.md                 # 프론트엔드가 있을 때만
├── docs/
│   ├── ROADMAP.md
│   ├── UI_SPEC.md                # UI가 있을 때만
│   ├── FIRST_GOAL.md
│   └── LOOP_LOG.md
├── scripts/
│   └── verify.<ps1|sh>
├── .agents/
│   └── skills/
│       ├── issue/SKILL.md
│       ├── implement/SKILL.md
│       ├── verify/SKILL.md
│       ├── review-ui/SKILL.md     # UI가 있을 때만
│       ├── ci-failure/SKILL.md
│       ├── commit/SKILL.md
│       └── pull-request/SKILL.md
└── .github/
    ├── ISSUE_TEMPLATE/
    ├── pull_request_template.md
    ├── workflows/
    │   ├── ci.yml
    │   └── codeql.yml
    ├── dependabot.yml
    └── rulesets/
        └── main.json
```

모든 파일이 필수는 아니다. UI가 없는 프로젝트에서 `review-ui`와 Playwright를 만들거나, 단일 패키지에서 cross-stack Skill을 만드는 것은 오히려 책임 중복이다.

## 7. 프로젝트별 치환 변수

템플릿을 복사한 뒤 다음 값을 프로젝트의 실제 값으로 바꾼다.

| 변수 | 의미 | 예시 |
| --- | --- | --- |
| `<PROJECT_NAME>` | 저장소 또는 제품 이름 | `studentory` |
| `<DEFAULT_BRANCH>` | 보호할 기본 브랜치 | `main` |
| `<PACKAGE_MANAGER>` | 패키지 도구 | `uv`, `pnpm` |
| `<BACKEND_CHECK>` | 백엔드 정식 명령 | lint + type-check + test |
| `<FRONTEND_CHECK>` | 프론트엔드 정식 명령 | lint + test + build |
| `<E2E_CHECK>` | 브라우저 검증 명령 | `pnpm e2e` |
| `<COMPLETION_CHECK>` | ruleset이 요구할 집계 job 이름 | `Completion gate` |
| `<CODEQL_LANGUAGES>` | 실제 저장소 언어 | Python, JS/TS |
| `<ROADMAP_PATH>` | 작업 상태의 단일 기준 | `docs/ROADMAP.md` |
| `<ISSUE_SYSTEM>` | 외부 작업 추적 시스템 | GitHub Issues |
| `<SECURITY_CHANNEL>` | 비공개 신고 채널 | Private Security Advisory |
| `<SUPPORTED_VERSIONS>` | 보안 지원 범위 | latest default branch |

필수 검사 이름은 workflow를 한 번 실행해 GitHub에 등록된 실제 check name을 확인한 뒤 ruleset에 넣는다. YAML의 추정 이름만으로 보호 규칙을 활성화하지 않는다.

## 8. 신규 프로젝트 세팅 절차

### 단계 0. 변경 없는 저장소 감사

먼저 분석 보고서만 만든다.

```text
1. 모든 AGENTS.md와 기존 자동화 문서를 읽는다.
2. 기술 스택, 패키지 관리자, 테스트 명령을 찾는다.
3. 현재 workflow와 브랜치 보호를 확인한다.
4. 기존 Skill을 책임별로 분류한다.
5. 중복, 빈 책임, 실패를 관찰할 수 없는 구간을 기록한다.
6. 이 단계에서는 파일을 수정하지 않는다.
```

감사 결과에는 최소한 다음 표가 있어야 한다.

| 책임 | 현재 기준 | 겹치는 구현 | 빈 구간 | 조치 |
| --- | --- | --- | --- | --- |
| 구현 | 기존 Skill 또는 없음 | 이름 목록 | 예/아니오 | 유지/통합/신규 |
| 검증 | 스크립트와 CI | 명령 목록 | 예/아니오 | 표준화 |
| UI 검토 | E2E 또는 수동 절차 | 도구 목록 | 예/아니오 | 선택 |
| CI 복구 | 로그 접근 절차 | Skill 목록 | 예/아니오 | 통합 |

### 단계 1. 기준 문서 확정

제품 스펙, UI 스펙, Roadmap, 미확정 결정의 위치를 정한다. Open Question은 결정되기 전까지 구현 규칙으로 사용하지 않는다.

Roadmap 항목에는 다음 필드를 권장한다.

- 안정적인 ID
- 상태: Pending, In progress, Blocked, Done
- 우선순위와 의존성
- 사용자 가치
- 구체적인 acceptance criteria
- 연결된 Issue 또는 결정 기록

### 단계 2. `AGENTS.md` 계층 구성

루트에는 전체 저장소에 적용되는 규칙만 둔다. 언어 또는 프레임워크별 규칙은 가장 가까운 하위 디렉터리로 옮긴다.

- 루트: 범위 판단, 계약, 보안, 공통 완료 기준
- 백엔드: 명령, 계층, 스키마, 테스트 규칙
- 프론트엔드: 상태 관리, 접근성, UI 테스트 규칙

부모 파일의 내용을 하위 파일에 반복하지 않는다. 각 `AGENTS.md`는 짧고 실행 가능한 규칙으로 유지한다.

### 단계 3. 정식 로컬 검증 진입점 생성

사람과 에이전트가 같은 명령을 사용하도록 하나의 검증 스크립트를 만든다. 가능한 구성은 다음과 같다.

```text
backend: format/lint → type-check → unit/integration test
frontend: lint → type-check/test → production build
browser: app startup → Playwright smoke/critical flow
```

빠른 부분 검증과 전체 검증을 구분하되, CI는 정식 명령을 호출해야 한다. 테스트를 통과시키기 위해 검사를 끄는 옵션은 두지 않는다.

### 단계 4. 최소 Skill 집합 구성

Skill은 도구 이름이 아니라 책임 단위로 만든다. 아래 질문에 모두 `예`일 때만 새 Skill을 추가한다.

1. 기존 Skill과 다른 시작 조건이 있는가?
2. 독립적인 입력과 산출물이 있는가?
3. 반복해서 사용할 절차인가?
4. 기존 Skill을 확장하면 책임이 흐려지는가?

권장 최소 책임은 작업 선택, 구현, 검증, UI 검토, CI 실패 복구, 커밋, PR이다. 작은 저장소에서는 구현·검증만으로 시작해도 된다.

각 Skill에는 다음을 명시한다.

- 사용해야 할 때와 사용하지 말아야 할 때
- 선행 입력과 권한
- 단계별 절차
- 검증 명령과 증거
- 정지 조건과 사용자에게 돌려줄 조건
- 다른 Skill과의 경계

### 단계 5. Issue와 PR을 실행 계약으로 만든다

Issue 템플릿은 문제, 범위, acceptance criteria, 검증 계획, 의존성을 수집한다. PR 템플릿은 연결 Issue, 변경 요약, 실행한 검증, UI 증거, 남은 위험을 요구한다.

권장 흐름은 다음과 같다.

```text
Roadmap item → Issue → focused branch → commit → PR → required checks → merge → close
```

PR 본문은 CI를 대신하지 않는다. 실행하지 않은 검증은 `미실행`과 이유를 적는다.

### 단계 6. GitHub Actions를 최종 gate로 만든다

CI는 독립 job으로 실패 원인을 구분하고, 마지막에 집계 job을 둔다.

```text
Backend quality ─┐
Frontend quality ├─→ Completion gate
Browser E2E ─────┘
```

집계 job은 선행 job 중 실패, 취소, 누락이 있으면 실패해야 한다. ruleset에는 개별 job 전체를 나열하는 대신 안정적인 집계 check와 별도 CodeQL check를 요구할 수 있다. 이렇게 하면 내부 job 구성이 바뀌어도 보호 규칙의 계약은 안정적으로 유지된다.

E2E가 지나치게 느리면 변경 경로에 따른 별도 workflow를 사용할 수 있지만, required check가 `skipped` 또는 미생성되어 병합이 영원히 대기하지 않는지 반드시 테스트한다.

### 단계 7. 독립 보안 관찰 지점을 추가한다

- CodeQL: 지원 언어의 정적 분석
- Dependabot: 의존성 업데이트와 알려진 취약점 피드백
- Secret scanning 또는 GitGuardian: 커밋된 비밀 탐지
- Sentry 등 런타임 관찰: 실제 배포가 있을 때 오류와 성능 회귀 탐지
- `SECURITY.md`: 비공개 신고 방법과 지원 범위

공개 소스라고 해서 자동으로 오픈 소스가 되는 것은 아니다. 라이선스, 에셋 출처, 브랜드 사용 권한은 프로젝트별로 별도 결정한다. 권리가 불명확하면 재배포 가능하다고 추정하지 않는다.

### 단계 8. ruleset을 마지막에 활성화한다

1. workflow를 기본 브랜치 또는 테스트 PR에서 한 번 실행한다.
2. 실제 check name과 성공 상태를 확인한다.
3. PR 필수, thread resolution, non-fast-forward 차단을 설정한다.
4. Completion gate와 CodeQL을 required checks로 지정한다.
5. 가능하면 bypass actor를 두지 않는다.
6. 설정 JSON을 저장소에 기록해 재현 가능하게 만든다.

ruleset 파일은 문서화된 기준이다. GitHub의 활성 설정도 API나 UI로 다시 읽어 실제 상태와 일치하는지 확인한다.

### 단계 9. 실패하는 테스트 PR로 gate를 검증한다

최소 한 번은 다음 시나리오를 의도적으로 확인한다.

- lint 실패가 Completion gate를 막는다.
- type-check 또는 test 실패가 병합을 막는다.
- build 실패가 병합을 막는다.
- Playwright 실패가 병합을 막는다.
- CodeQL required check가 없거나 실패하면 병합할 수 없다.
- 모든 검사가 통과하면 PR이 mergeable 상태가 된다.

테스트 후 의도적 실패 변경은 되돌리고 정상 PR의 성공 증거를 남긴다.

### 단계 10. 첫 Goal 실행

첫 Goal은 전체 제품 완성이 아니라 가장 작은 milestone을 대상으로 한다.

```text
/goal <ROADMAP_PATH>의 <MILESTONE_ID>를 완료하라.

규칙:
- 한 번에 가장 우선순위가 높은 미완료 항목 하나만 선택한다.
- 변경 전에 관련 코드와 계약을 읽는다.
- 최소 수직 단위로 구현한다.
- 관련 로컬 검증과 필요한 UI 검토를 실행한다.
- 반복 결과를 Loop Log에 기록한다.
- CI와 필수 검사가 확인되기 전에는 완료로 선언하지 않는다.
- 제품 결정이나 권한이 필요하면 Blocked로 기록하고 사용자에게 요청한다.
```

## 9. 완료 상태 모델

작업 상태를 다음처럼 명확히 구분한다.

| 상태 | 의미 |
| --- | --- |
| Pending | 시작하지 않았거나 선행 작업을 기다림 |
| In progress | 선택되어 구현 또는 검증 중 |
| Blocked | 제품 결정, 권한, 외부 상태가 필요함 |
| Local verified | 관련 로컬 검증만 통과함 |
| CI pending | push 후 외부 gate 결과를 기다림 |
| Done | acceptance criteria와 required checks가 모두 충족됨 |

`Local verified`와 `CI pending`은 Roadmap의 필수 상태일 필요는 없지만, 에이전트 보고에서는 구분해야 한다.

완료 판정 의사 코드는 다음과 같다.

```text
if acceptance_criteria_missing:
    status = In progress
elif user_decision_or_authority_required:
    status = Blocked
elif relevant_local_checks_failed:
    status = In progress
elif required_ui_review_failed:
    status = In progress
elif branch_not_pushed_or_pr_missing:
    status = Local verified
elif required_ci_not_observable_or_running:
    status = CI pending
elif any_required_check_failed_or_missing:
    status = In progress
else:
    status = Done
```

## 10. Loop Log 템플릿

```markdown
## Iteration <NNN> — <work-item-id>

- 관찰: 현재 실패, 상태, 사용자 가치
- 선택: 이번 반복에서 해결할 한 가지 병목
- 변경: 수정한 파일과 행동
- 로컬 검증: 명령과 결과
- UI 검토: 대상 화면, viewport, 접근성, 실패 상태
- 외부 검증: PR, Actions run, CodeQL 결과
- 결정: Done / In progress / Blocked
- 남은 위험: 알려진 한계와 미실행 검사
- 다음 항목: 다음 우선순위 한 가지
```

Loop Log는 모든 터미널 출력을 복사하는 장소가 아니다. 재현에 필요한 명령, 결과, 판단 근거만 남긴다.

## 11. UI가 중요한 프로젝트의 검증 계약

UI 검토는 정적 스크린샷 한 장으로 끝내지 않는다. 최소한 다음을 확인한다.

- 핵심 사용자 흐름의 실제 상호작용
- loading, empty, error, success 상태
- 작은 모바일, 일반 모바일, 데스크톱 viewport
- 키보드 탐색, focus 표시, label, semantic structure
- 네트워크 또는 API 실패 시 사용자 피드백
- 콘솔 오류와 실패한 요청
- 기준 UI와의 간격, 위계, 대비, 터치 영역

Playwright는 회귀를 자동 탐지하는 gate이고, `review-ui`는 사용성 문제를 찾는 별도 관점이다. 둘은 서로 대체하지 않는다. 시각 회귀가 중요하면 승인된 기준 이미지와 diff 임계값을 추가한다.

## 12. 운영 및 개선 방법

루프 자체도 측정하고 개선한다. 권장 지표는 다음과 같다.

- Issue 선택부터 merge까지 걸린 시간
- 첫 CI 실행 통과율
- 동일 원인 재실패 횟수
- flaky test 비율
- PR 이후 발견된 결함 수
- 사람의 결정 대기 시간
- gate 우회 횟수
- 사용되지 않거나 겹치는 Skill 수

개선 순서는 다음을 따른다.

1. 반복되는 실패를 Loop Log와 CI에서 관찰한다.
2. 실패를 탐지하지 못한 계층 또는 너무 늦게 탐지한 계층을 찾는다.
3. 가장 가까운 기존 기준, Skill, 검증 스크립트를 먼저 수정한다.
4. 독립된 새 책임일 때만 Skill 또는 workflow를 추가한다.
5. 실패 재현 테스트로 개선 효과를 검증한다.
6. check name, 명령, 경로가 바뀌면 ruleset과 문서를 함께 갱신한다.

분기별 또는 주요 스택 변경 후 다음을 감사한다.

- 문서의 명령이 실제로 실행되는가?
- Skill의 경계와 실제 작업이 일치하는가?
- CI가 로컬 정식 명령과 다른 검사를 수행하지 않는가?
- required check가 여전히 실제 check name과 일치하는가?
- Dependabot과 CodeQL 언어가 현재 의존성과 일치하는가?
- 보안 신고 경로와 지원 버전이 최신인가?
- 오래된 Goal, Roadmap 링크, 사용하지 않는 Skill이 남아 있지 않은가?

## 13. 이식 시 그대로 복사하지 말아야 할 것

- Studentory의 도메인명, Issue ID, milestone
- Windows 전용 PowerShell 명령
- Python 및 JavaScript/TypeScript라는 CodeQL 언어 선택
- pnpm, uv 같은 패키지 관리자
- `Completion gate`라는 정확한 검사 이름
- Playwright와 Sentry 사용 여부
- 라이선스 없음이라는 Studentory의 권리 정책
- 최신 `main`만 지원한다는 보안 지원 범위

반드시 대상 저장소를 감사한 뒤 실제 스택과 운영 모델에 맞춰 선택한다.

## 14. 흔한 실패 패턴

- 이름만 다른 verify/review/final-review Skill을 계속 추가한다.
- 에이전트가 실행하지 않은 검사를 성공으로 추정한다.
- 로컬 검증만으로 merge-ready라고 보고한다.
- ruleset을 먼저 만들고 실제 check name이 달라 PR이 영구 대기한다.
- CI에서만 존재하는 명령을 사용해 로컬 재현이 불가능하다.
- E2E가 happy path만 확인하고 오류·반응형·접근성을 놓친다.
- CodeQL을 실행하지만 required check로 강제하지 않는다.
- Dependabot 알림을 처리할 책임자와 Issue 흐름이 없다.
- 제품의 Open Question을 AI가 임의 결정한다.
- Loop Log를 상태의 단일 기준으로 사용해 Roadmap과 충돌시킨다.
- 공개 저장소를 자동으로 사용 허가된 코드로 취급한다.

## 15. 템플릿 적용 완료 체크리스트

### 기준

- [ ] 제품 스펙, UI 스펙, Roadmap의 책임이 분리되어 있다.
- [ ] 미확정 결정과 구현 가능한 요구사항이 구분되어 있다.
- [ ] 루트 및 필요한 하위 `AGENTS.md`가 실제 구조와 일치한다.

### 실행

- [ ] 사람과 에이전트가 공유하는 정식 검증 명령이 있다.
- [ ] Skill마다 고유한 trigger, 산출물, 정지 조건이 있다.
- [ ] Issue와 PR이 acceptance criteria와 검증 증거를 보존한다.
- [ ] UI가 있으면 브라우저 기반 동작·반응형·접근성 검토가 있다.

### 독립 관찰과 강제

- [ ] CI가 lint, type-check, test, build를 실제 스택에 맞게 실행한다.
- [ ] 필요한 경우 E2E가 Completion gate에 포함된다.
- [ ] CodeQL이 실제 언어에 맞게 실행된다.
- [ ] Dependabot과 비밀 탐지가 활성화되어 있다.
- [ ] ruleset이 PR, Completion gate, 보안 검사를 강제한다.
- [ ] 실패 PR과 성공 PR로 gate 동작을 확인했다.

### 운영

- [ ] Goal의 종료 조건이 외부 required checks까지 포함한다.
- [ ] Loop Log가 재현 가능한 검증 근거를 남긴다.
- [ ] CI 미확인 상태를 완료와 구분한다.
- [ ] 보안 신고, 지원 범위, 라이선스와 에셋 권리가 결정되어 있다.
- [ ] 중복 Skill과 오래된 경로를 정기적으로 제거한다.

## 16. Codex 적용 참고

Codex에서 `AGENTS.md`는 저장소에 지속되는 지침을, Skill은 반복 가능한 작업 절차를 담당한다. 루트 지침은 전체 저장소에 적용하고 더 가까운 하위 지침으로 영역별 규칙을 구체화한다. 공식 개념은 [OpenAI Codex customization 문서](https://developers.openai.com/codex/concepts/customization)를 참고한다.

CI, ruleset, CodeQL, Dependabot은 Codex 기능이 아니라 구현자의 판단과 독립된 피드백 계층이다. 이 분리가 Loop Engineering의 핵심이다.
