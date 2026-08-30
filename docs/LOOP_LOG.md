# Ralph Loop Log

장기 Goal의 반복 결과를 여기에 누적한다. 점수나 검증 결과는 실제 실행한 값만 기록한다.

## Current best

- Roadmap item: 없음
- Verification: 전체 검사 통과
- UI review: 실행 전
- Remaining bottleneck: M1 기준선 측정

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
