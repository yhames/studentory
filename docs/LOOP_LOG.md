# Ralph Loop Log

장기 Goal의 반복 결과를 여기에 누적한다. 점수나 검증 결과는 실제 실행한 값만 기록한다.

## Current best

- Roadmap item: STU-001
- Verification: 로컬 전체 검사 통과, CI 확인 전
- UI review: 학생 생성 기본·필수값 오류 상태 92/100, 후속 포커스 개선 필요
- Remaining bottleneck: PR과 필수 CI 검증

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
