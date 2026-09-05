# Ralph Loop Log

장기 Goal의 반복 결과를 여기에 누적한다. 점수나 검증 결과는 실제 실행한 값만 기록한다.

## Current best

- Roadmap item: UIR-001
- Verification: 백엔드 표준 검사, 프론트엔드 lint·type-check·build와 Playwright 7개 통과, CI 확인 전
- UI review: 학생·수업 핵심 화면과 주간 시간표·모달을 Desktop, Compact, Mobile에서 96/100
- Remaining bottleneck: 사용자 시각 검토, PR과 필수 CI 검증

## Iterations

### 000 — Loop scaffold

- 대상: OPS-001, OPS-002, OPS-003
- 변경: 프로젝트 문서, 공통 검증 스크립트, 저장소 Skill 추가
- 검증: 공식 Skill validator 3종 및 `scripts/verify.ps1 -Scope all` 통과; Ruff, Pyright, pytest 22개, Oxlint, TypeScript/Vite build
- 참고: Pyright가 실제 소스를 검사하도록 `backend/pyproject.toml`의 include 경로를 수정함
- 다음: STU-001 기준선 검증

### 001 — OPS-005

- 가설: Roadmap 작업을 GitHub Issue, 집중된 Skill, PR, 필수 CI로 연결하면 로컬 판단과 독립된 완료 기준을 강제할 수 있다.
- 변경: Issue Forms와 라벨, Issue/commit/PR Skill, Roadmap 링크, PR 템플릿, main ruleset, 저작권 고지, root SECURITY 정책을 추가했다.
- 실행한 검증: Skill validator 4종, Issue Form YAML parser, `scripts/verify.ps1 -Scope all`, SECURITY policy resolver, PR #12 live checks
- 결과: Backend, Frontend, Playwright, Completion gate, Python·JavaScript/TypeScript CodeQL, GitGuardian 통과; pending check에서 ruleset이 merge를 차단하고 통과 후 해제되는 것을 확인했다.
- UI 증거: 애플리케이션 UI 변경 없음. 외부 Vite favicon을 자체 `S` SVG로 교체하고 frontend build를 검증했다.
- 회귀 또는 위험: 오픈 소스 LICENSE를 부여하지 않는다. 정확한 저작권자 표기와 의존성 라이선스 감사는 Issue #13에서 추적한다.
- 다음 병목: OPS-004 UI 기준 승인 후 STU-001 또는 STU-002 착수

### 002 — STU-001

- 가설: 학생 CRUD의 응답 shape, 오류 응답, 필수 필드와 프론트엔드 타입을 명시적으로 고정하면 이후 UI 작업의 계약 회귀를 조기에 발견할 수 있다.
- 변경: 학생·일정 API의 status code, response shape, 204 본문, 404·422 오류 계약 테스트를 보강하고 미래 출생연도를 거부했다. nullable 폼 상태와 non-null API payload/response 타입을 분리했다.
- 실행한 검증: `CI=true; scripts/verify.ps1 -Scope All`
- 결과: Ruff, Pyright, pytest 37개, Oxlint, TypeScript, Vite build 통과. 기존 `LessonPage.tsx`의 Oxlint 경고 1건은 실패가 아니며 이번 범위 밖이다.
- UI 증거: 학생 생성 기본·필수값 오류를 Desktop 1440×900, Compact 1024×768, Mobile 390×844에서 검토했다. 세 크기 모두 가로 넘침이 없고 Mobile 모달은 내부 세로 스크롤로 저장 영역에 접근할 수 있다. 빈 제출은 이름·나이·성별 3개 필수값을 차단하고 첫 오류 입력에 포커스를 둔다. 콘솔 오류는 없었다. 루브릭은 정보 계층 19/20, 친숙성과 탐색 13/15, 가독성과 밀도 15/15, 작업 흐름 18/20, 일관성 10/10, 반응형 10/10, 접근성 7/10으로 92/100이다. 서버 오류·성공 상태는 이번 계약 변경에서 UI 동작이 바뀌지 않아 재검토하지 않았다.
- 회귀 또는 위험: 모달을 열 때 최초 포커스가 이름 입력 또는 제목으로 이동하지 않고 기존 `추가` 버튼에 남는다. OPS-004 승인 또는 폼 UX 작업에서 focus trap·복원과 함께 개선해야 한다. 현재 구현은 학생당 정기 일정 하나만 허용하지만 제품 스펙은 다중 일정을 막지 않아야 한다고 명시한다. MVP 다중 일정 지원 여부는 Issue #10의 결정 전까지 변경하지 않는다. PR과 required CI는 아직 실행 전이다.
- 다음 병목: 변경 검토 후 PR을 만들고 Completion gate와 CodeQL을 확인한다.

### 003 — UIR-001

- 가설: Keepers Note에서 검증된 정보 계층과 탐색 패턴을 제품 고유 자산 없이 적용하면 학생·수업 업무를 더 빠르게 파악하면서도 Studentory만의 차분한 기준선을 만들 수 있다.
- 변경: 고정 사이드바와 모바일 드로어, 파스텔 요약 카드, 일관된 패널·폼·버튼·상태 메시지, 모바일 학생 카드, 수업 보기 전환을 공통 토큰 기반으로 재구성했다. 모달 최초 포커스·포커스 순환·Escape 닫기·포커스 복원을 추가했다. 날짜 보기는 날짜별 전체 폭 4열 행으로 바꾸고 Desktop/Compact 핵심 정보를 한 줄로 정렬했다. 목록은 상태 확인과 준비·출결 빠른 변경에 집중하고 전체 행을 수업 상세 진입점으로 만들었다. 저장·변경 취소와 취소·복구·완료·수동 수업 삭제 lifecycle을 모달의 좌우 action group으로 분리했다.
- 실행한 검증: `scripts/verify.ps1 -Scope backend`, 프로젝트 로컬 실행 파일을 사용한 Oxlint·TypeScript·Vite build, Playwright Chromium 6개. 실제 브라우저에서 Desktop 1440×900, Compact 1024×768, Mobile 390×844를 검토했다.
- 결과: Ruff, Pyright, pytest 37개, Oxlint, TypeScript, Vite build가 통과했고 기존 `LessonPage.tsx`의 비차단 Oxlint 경고 1건만 유지된다. Playwright는 행 마우스·Enter·Space 진입, 빠른 action 분리, 미저장 변경 폐기, 저장, 예정→취소→복구→완료, 수동 수업 삭제, 모바일 overflow와 기존 학생 흐름을 포함해 6개가 통과했다. 전역 pnpm과 기존 node_modules의 store 불일치로 표준 전체 스크립트의 프론트엔드 구간 대신 동일한 로컬 실행 파일을 직접 실행했다.
- UI 증거: 정보 계층 20/20, 친숙성과 탐색 14/15, 가독성과 밀도 15/15, 작업 흐름 20/20, 일관성 10/10, 반응형 10/10, 접근성 7/10으로 96/100이다. 날짜 보기의 실제 수업 행은 Desktop 1440×900과 Compact 1024×768에서 54px 한 줄, Mobile 390×844에서 정보→상태→행동 순서로 재배치되는 카드로 확인했다. 세 크기 모두 가로 넘침·잘림·겹침이 없고 닫힌 드로어는 접근성 트리와 탭 순서에서 제외된다. 수업 화면 콘솔 오류·경고는 없었다.
- 회귀 또는 위험: 공개 페이지의 구조와 분위기만 참고했으며 브랜드 이미지·SVG·문구를 복제하지 않았다. 실제 로컬 API 데이터로 수업 목록과 모달을 확인했고 destructive 삭제는 격리된 E2E mock에서 검증했다. README의 백엔드 명령은 현재 실제 앱 대신 `Hello from backend!`만 출력하며, 전역 pnpm store 설정도 기존 설치와 불일치한다. 두 개발환경 문제는 이번 UI 범위에서 수정하지 않았다. 최종 시각 기준은 사용자 승인 전이다.
- 다음 병목: 전체 저장소 검증과 사용자 시각 검토 후 PR을 만들고 required CI를 확인한다.

### 004 — UIR-001 주간 시간표

- 가설: 요일을 열로, 오후 1시부터 11시까지 10분 간격을 행으로 고정하고 상태 변경을 상세 모달에 모으면 빈 시간과 수업 상태를 한눈에 비교하면서 우발적인 변경을 줄일 수 있다.
- 변경: 날짜 보기를 월요일부터 금요일까지의 주간 시간표로 교체했다. 시간축은 해당 주 평일 수업의 가장 빠른 시각부터 가장 늦은 시각까지 10분 단위로 동적 생성하며 빈 주에는 13:00~23:00 기본 범위를 제공한다. 수업 카드는 성별, 이름, 왼쪽 정렬된 단계·나이 뱃지와 상태를 표시하고 행 머리글과 중복되는 카드 시각은 제거했다. 완료 카드는 초록 강조선, 연한 완료 배경과 `✓ 수업 완료` 뱃지로 색상 외에도 상태를 구분한다. 같은 슬롯의 복수 수업과 10분 단위가 아닌 시각도 보존한다. 완료 수업을 예정 상태로 되돌리는 백엔드 API와 모달 action을 추가하고 취소·복구·완료·미완료·준비·출결 처리를 모두 모달로 제한했다. Mobile은 평일 5일 전환 후 선택한 하루만 표시한다.
- 실행한 검증: `scripts/verify.ps1 -Scope backend`, 프로젝트 로컬 실행 파일을 사용한 Oxlint·TypeScript·Vite build, Playwright Chromium 7개. 실제 API 데이터로 Desktop 1440×900, Compact 1024×768, Mobile 390×844를 브라우저에서 검토했다.
- 결과: Ruff, Pyright, pytest 37개, TypeScript, Vite build가 통과했다. Oxlint는 기존 `LessonPage.tsx`의 비차단 `react(set-state-in-effect)` 경고 1건만 유지한다. Playwright 7개가 동적 시간축의 양 끝, 빈 주의 기본 범위, 비정규 시각, 같은 슬롯 복수 수업, 완료 카드의 시각·텍스트 표식, 모달 전용 lifecycle, 완료→미완료 복구, 수동 수업 삭제, 모바일 요일 전환과 overflow를 검증했다.
- UI 증거: 실제 데이터에서 가장 빠른 15:00부터 가장 늦은 17:30까지 16개 행만 생성됐다. Desktop, Compact, Mobile 모두 같은 시간 범위를 사용하고 페이지 가로 overflow가 없다. Compact의 시간표 가로 이동은 내부에만 제한된다. Mobile은 데스크톱 표를 숨기고 평일 5개 요일 버튼과 단일 요일 표를 표시한다. 세 viewport에서 카드 시각 요소가 제거됐고 단계·나이 뱃지의 왼쪽 기준선이 부모와 일치했다. 390px viewport에서 페이지와 카드가 잘리지 않았으며 모달을 닫으면 원래 카드로 포커스가 복원된다.
- 회귀 또는 위험: 전역 pnpm과 기존 `node_modules` store가 달라 표준 전체 스크립트의 프론트엔드 구간을 실행하지 못했으며, 같은 로컬 실행 파일로 lint·type-check·build·Playwright를 각각 검증했다. 실제 데이터의 파괴적 변경은 수행하지 않고 API 테스트와 격리된 E2E mock으로 검증했다. PR과 required CI는 아직 실행 전이다.
- 다음 병목: 사용자 시각 승인 후 PR을 만들고 GitHub Completion gate와 CodeQL을 확인한다.

### 005 — STU-002

- 가설: 학생 목록의 로딩·전체 빈 목록·필터 결과 없음·API 오류를 독립된 상태와 복구 행동으로 표현하면 교사가 데이터 부재와 일시적 장애를 혼동하지 않고 다음 행동을 선택할 수 있다.
- 변경: 목록 오류를 raw 서버 상세가 노출되지 않는 전용 상태로 바꾸고 `다시 시도`를 추가했다. 필터 결과 없음에는 `필터 초기화`를 제공하며 기존 행의 Enter·Space 상세 이동을 회귀 테스트로 고정했다.
- 실행한 검증: 프로젝트 로컬 Oxlint, TypeScript, Vite build, Playwright Chromium 9개.
- 결과: TypeScript와 Vite build, Playwright 9개가 통과했다. Oxlint는 기존 `LessonPage.tsx`의 비차단 `react(set-state-in-effect)` 경고 1건만 유지한다. success, empty, filtered-empty, API error와 재시도, raw 오류 차단, 키보드 상세 이동을 자동 검증했다.
- UI 증거: 실제 API 데이터 4건과 일시적 오류 후 재시도 상태를 브라우저에서 확인했다. Desktop 1440×900, Compact 1024×768, Mobile 390×844 모두 페이지 가로 overflow가 없고 목록이 정상 표시됐다. 행에 Enter를 입력해 `/students/2` 상세로 이동하는 것을 확인했다. 전체 빈 목록과 필터 결과 없음은 격리된 Playwright에서 검증했다. 기존 UIR-001 루브릭 기준 96/100을 유지하며, 콘솔 오류는 발생시키지 않는다.
- 회귀 또는 위험: 사용자가 UI 기준을 승인해 OPS-004 Issue #5를 닫았다. 전역 pnpm store 설정은 기존 `node_modules`와 불일치하지만 독립된 GitHub Actions에서는 영향을 받지 않았다.
- 다음 병목: PR #20의 Backend, Frontend, Browser E2E, Completion gate, Python·JavaScript/TypeScript CodeQL과 GitGuardian이 모두 통과해 STU-002를 Done으로 변경했다. 사용자 머지 후 STU-003을 시작한다.

### 006 — STU-003

- 가설: 브라우저 기본 검증을 backend 계약과 맞추고 제출 중 모든 닫기 경로를 잠그며 서버 실패를 복구 가능한 상태로 유지하면 입력 손실과 중복 저장을 방지할 수 있다.
- 변경: 공백 이름을 frontend에서 차단하고 나이 입력 범위를 backend의 1900년 이후 출생연도 계약과 일치시켰다. 제출 중 저장·취소·닫기·Escape·backdrop 닫기를 차단하고 `저장 중...` 상태를 표시한다. 생성·수정 실패 메시지에서 서버 내부 상세를 숨기며 입력값을 유지한다.
- 실행한 검증: 프로젝트 로컬 Oxlint, TypeScript, Vite build, Playwright Chromium 12개. 실제 브라우저에서 생성 모달을 Desktop 1440×900, Compact 1024×768, Mobile 390×844로 검토했다.
- 결과: TypeScript와 Vite build, Playwright 12개가 통과했다. Oxlint는 기존 `LessonPage.tsx`의 비차단 `react(set-state-in-effect)` 경고 1건만 유지한다. 생성 검증·실패·재시도, 제출 중 중복 제출과 닫기 차단, 수정 실패 후 값 유지와 성공 반영을 검증했다.
- UI 증거: 세 viewport 모두 페이지 가로 overflow와 모달 잘림이 없고 이름 입력에 초기 포커스가 이동한다. Mobile 모달은 375px 안에 맞으며 나이 입력은 0~126세 범위로 현재 backend의 1900년 이후 출생연도 계약과 일치한다. 기존 승인 루브릭 기준 96/100을 유지한다.
- 회귀 또는 위험: 학생 생성 후 정기 일정 저장이 실패하는 교차 요청의 원자성은 기존 API 구조상 보장되지 않는다. 이번 Issue의 재시도 검증은 학생 생성 요청 자체가 실패한 경우를 다루며, 복합 생성의 transaction API는 별도 계약 결정이 필요하다.
- 다음 병목: PR #21의 Backend, Frontend, Browser E2E, Completion Gate, Python·JavaScript/TypeScript CodeQL과 GitGuardian이 모두 통과해 STU-003를 Done으로 변경했다. 사용자 머지 후 STU-004를 시작한다.

### 007 — STU-004

- 가설: 학생 기본 정보와 정기 일정의 요청·수정 흐름을 분리하면 일정 오류가 상세 전체를 가리지 않고 부분 성공도 방지할 수 있다.
- 변경: 학생 404와 일반 조회 실패를 구분하고, 정기 일정의 loading·empty·error·success 상태와 생성·수정·삭제 모달 흐름을 추가했다. 기본 정보 수정은 일정 저장과 분리했으며 삭제 확인에는 학생명·요일·시간을 표시한다.
- 실행한 검증: backend 전체 37개, 학생 API 20개, 로컬 Oxlint·TypeScript·Vite build, Playwright Chromium 15개. 실제 브라우저에서 Desktop 1440×900, Compact 1024×768, Mobile 390×844를 검토했다.
- 결과: backend와 로컬 frontend 검증, Playwright가 통과했다. canonical frontend 스크립트는 기존 pnpm store 불일치와 registry 접근 실패로 install 단계에서 중단됐으나 동일 로컬 바이너리 검증은 통과했다.
- UI 증거: 세 viewport에 가로 overflow가 없고 Mobile 패널은 349px, 일정 모달은 375px 안에 맞았다. 모달 첫 입력 포커스와 콘솔 오류 없음도 확인했다. 승인된 UI 루브릭 기준 96/100을 유지한다.
- 회귀 또는 위험: backend는 현재 학생당 활성 정기 일정 하나만 허용하므로 UI도 첫 일정 하나를 관리한다. 다중 활성 일정 지원은 별도 제품 결정이 필요하다.
- 다음 병목: PR #22의 Backend, Frontend, Browser E2E, Completion Gate, Python·JavaScript/TypeScript CodeQL과 GitGuardian이 모두 통과해 STU-004를 Done으로 변경했다. 사용자 머지 후 다음 Roadmap 항목을 선택한다.

## 기록 템플릿

```md
### NNN — ROADMAP-ID

- 가설:
- 변경:
- 실행한 검증:
- 결과:
- UI 증거:
- 회귀 또는 위험:
- 다음 병목:
```
