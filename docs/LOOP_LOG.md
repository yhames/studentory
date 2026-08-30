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
