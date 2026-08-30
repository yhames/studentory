# Loop Engineering 보강 체크리스트

이 문서는 Studentory의 GitHub Issue 기반 개발 루프를 완성하기 위한 실행 목록이다.
참고 저장소의 구성을 그대로 복제하지 않고, 현재 Skill과 겹치지 않는 책임만 추가한다.

## 운영 원칙

- [ ] 신규 Skill을 추가하기 전에 기존 Skill의 책임을 확장할 수 있는지 확인한다.
- [ ] `feature-loop-v2`, `review`, `final-review`, `verify-v2`처럼 유사한 Skill을 만들지 않는다.
- [ ] 한 번의 구현 루프에서는 하나의 Roadmap 항목 또는 하나의 GitHub Issue만 처리한다.
- [ ] GitHub Issue는 구현할 요구사항과 수용 조건의 실행 단위로 사용한다.
- [ ] `docs/ROADMAP.md`는 제품 구현 순서와 상태의 기준으로 유지한다.
- [ ] 로컬 검증은 빠른 피드백으로 사용하고 GitHub Actions를 최종 완료 기준으로 사용한다.
- [ ] 외부 상태를 변경하는 Issue 생성, PR 생성, merge, release는 사용자의 요청 범위 안에서만 수행한다.

## 현재 완료된 기반

- [x] `$implement-feature-slice`가 Roadmap 항목 하나의 수직 구현을 담당한다.
- [x] `$verify-cross-stack`이 백엔드와 프론트엔드의 표준 검증을 담당한다.
- [x] `$review-ui`가 실제 브라우저 기반 UI/UX 검토를 담당한다.
- [x] `$ci-failure-loop`가 실제 GitHub Actions 로그 기반 복구를 담당한다.
- [x] CI가 backend, frontend, Playwright, `Completion gate`를 실행한다.
- [x] CodeQL이 Python과 JavaScript/TypeScript를 분석한다.
- [x] Dependabot version updates와 security updates가 활성화되어 있다.
- [x] Secret scanning과 push protection이 활성화되어 있다.
- [x] Sentry SDK가 DSN 기반 opt-in 방식으로 연결되어 있다.

## 1. GitHub Issue 운영 기반

### Issue Forms

- [x] `.github/ISSUE_TEMPLATE/config.yml`을 추가한다.
- [x] Feature Issue Form을 추가한다.
  - [x] Roadmap ID를 입력받는다.
  - [x] 사용자 결과와 문제를 구분해 작성한다.
  - [x] 수용 조건을 체크리스트로 작성한다.
  - [x] backend, frontend, cross-stack 영향을 표시한다.
  - [x] 검증 방법과 UI 증거 필요 여부를 작성한다.
- [x] Bug Issue Form을 추가한다.
  - [x] 재현 절차, 기대 결과, 실제 결과를 입력받는다.
  - [x] 환경과 브라우저 정보를 입력받는다.
  - [x] 로그와 스크린샷에서 개인정보와 secret을 제거하도록 안내한다.
- [x] Decision Issue Form을 추가한다.
  - [x] 결정할 질문과 배경을 작성한다.
  - [x] 선택지와 각각의 trade-off를 작성한다.
  - [x] 결정으로 해제되는 Blocked 항목을 연결한다.
  - [x] 최종 결정과 결정 일자를 기록한다.
- [x] 보안 취약점은 공개 Issue로 신고하지 않도록 안내한다.
- [x] 빈 Issue 허용 여부와 문의 채널을 결정한다.

### 라벨

- [x] 기존 라벨을 조회하고 의미가 겹치는 라벨은 재사용한다.
- [x] 유형 라벨을 구성한다.
  - [x] `type:feature`
  - [x] `type:bug`
  - [x] `type:decision`
- [x] 영역 라벨을 구성한다.
  - [x] `area:backend`
  - [x] `area:frontend`
  - [x] `area:cross-stack`
  - [x] `area:ops`
- [x] 상태 라벨은 GitHub 기본 상태와 겹치지 않는 최소 항목만 둔다.
  - [x] `status:blocked`
- [x] 우선순위 라벨을 구성한다.
  - [x] `priority:p0`
  - [x] `priority:p1`
  - [x] `priority:p2`
- [x] 각 라벨의 설명과 색상을 일관되게 지정한다.

### Roadmap과 Issue 동기화

- [x] Issue 제목을 `<ROADMAP-ID>: <작업명>` 형식으로 통일한다.
- [x] Issue 본문에 관련 스펙과 Roadmap 링크를 포함한다.
- [x] `docs/ROADMAP.md`의 항목에 관련 Issue 번호를 기록한다.
- [ ] Issue를 시작할 때 Roadmap 상태를 `In progress`로 변경한다.
- [ ] 제품 결정이 필요하면 Feature를 진행하지 않고 Decision Issue에 연결한다.
- [ ] 모든 수용 조건과 필수 CI가 통과한 뒤에만 Roadmap을 `Done`으로 변경한다.
- [ ] PR 본문에서 `Closes #<issue-number>`로 구현 Issue를 연결한다.
- [ ] 문서와 GitHub 상태가 불일치하면 실제 코드와 CI 증거를 확인한 뒤 동기화한다.

## 2. Skill 보강

### `$github-issue` 신규 Skill

- [x] `.agents/skills/github-issue/SKILL.md`를 추가한다.
- [x] Issue 생성 전 제목, Roadmap ID, 핵심 키워드로 중복을 검색한다.
- [x] `Recommend`, `Create`, `Update`, `Triage` 동작을 구분한다.
- [x] 단순 검토 요청은 GitHub 상태를 변경하지 않는다.
- [x] Issue 생성 요청은 Form과 동일한 필수 정보를 검증한다.
- [x] Feature, Bug, Decision 유형을 구분한다.
- [x] 검증 가능한 수용 조건이 없으면 생성 전에 보완한다.
- [x] 근거 없이 담당자, 우선순위, 마일스톤을 추측하지 않는다.
- [x] 생성 또는 수정 후 Issue를 다시 읽어 제목, 본문, 라벨, 담당자를 검증한다.
- [x] 생성된 Issue URL과 남은 blocker를 보고한다.

### `$implement-feature-slice` 기존 Skill 확장

- [x] 입력으로 Roadmap ID 또는 GitHub Issue 번호를 받을 수 있게 확장한다.
- [x] Issue 번호가 주어지면 live Issue와 연결된 Roadmap 항목을 먼저 읽는다.
- [x] Issue와 Product Spec이 충돌하면 구현하지 않고 충돌을 보고한다.
- [x] Issue의 수용 조건을 구현 범위로 고정한다.
- [x] 브랜치 이름에 Roadmap ID 또는 Issue 번호를 포함한다.
- [x] 완료 시 검증 결과, CI URL, PR URL을 `docs/LOOP_LOG.md`에 기록한다.
- [x] Issue 종료는 merge 또는 사용자가 정한 완료 이벤트에 맡긴다.

### `$github-pr` 신규 Skill

- [x] `.agents/skills/github-pr/SKILL.md`를 추가한다.
- [x] 현재 브랜치, upstream, base, commit, 전체 diff를 확인한다.
- [x] base 브랜치에서 직접 PR을 만들지 않는다.
- [x] 관련 Issue와 Roadmap ID를 확인한다.
- [x] PR 생성 전에 관련 로컬 검증을 실행한다.
- [x] UI 변경이면 `$review-ui` 결과와 Playwright 증거를 요구한다.
- [x] 변경 유형에 맞는 PR 템플릿을 적용한다.
- [x] 실행하지 않은 검증을 통과로 표시하지 않는다.
- [x] 현재 브랜치를 명시적으로 push한 뒤 PR을 생성한다.
- [x] 기존 열린 PR이 있으면 중복 생성하지 않는다.
- [x] 생성 후 제목, base/head, Draft 여부, URL을 다시 확인한다.
- [x] `Completion gate`와 CodeQL의 실제 결과를 확인한다.
- [x] merge는 별도 요청 없이 수행하지 않는다.

### `$git-commit` 신규 Skill

- [x] `.agents/skills/git-commit/SKILL.md`를 추가한다.
- [x] status와 전체 diff를 확인한다.
- [x] 사용자 변경과 현재 작업 변경을 구분한다.
- [x] `git add .` 대신 대상 경로를 명시한다.
- [x] 저장소의 커밋 메시지 형식을 문서화한다.
- [x] 변경 이유와 핵심 내용을 커밋 본문에 기록한다.
- [x] amend, 강제 push, 파괴적 reset은 명시적인 요청 없이 수행하지 않는다.
- [x] 커밋 후 status와 commit 정보를 다시 확인한다.

### Skill 검증 및 문서화

- [x] 신규·수정 Skill의 frontmatter와 trigger 범위를 검증한다.
- [x] 각 Skill이 기존 Skill과 책임이 겹치지 않는지 검토한다.
- [x] 루트 `README.md`의 Skill 목록과 사용 흐름을 갱신한다.
- [x] `AGENTS.md`에 중복 규칙을 추가하지 않는다.
- [ ] Skill 추가 후 Codex가 저장소 Skill을 탐색하는지 확인한다.

## 3. Pull Request 운영 기반

- [x] `.github/pull_request_template.md`를 추가한다.
- [x] PR Summary에 사용자 또는 개발자 결과를 작성한다.
- [x] Related Issue에 `Closes #<number>`를 작성한다.
- [x] 변경 내용과 API/data contract 영향을 작성한다.
- [x] 실제 실행한 검증 명령과 결과를 작성한다.
- [x] UI 변경 시 데스크톱·모바일 스크린샷 또는 녹화를 첨부한다.
- [x] 미실행 검증과 알려진 위험을 명시한다.
- [x] secret, 로컬 DB, 빌드 산출물이 포함되지 않았는지 확인한다.
- [ ] 필요할 경우 Feature와 Bugfix 템플릿을 분리하되 중복 문구를 최소화한다.

## 4. GitHub 최종 Gate 강제

- [x] `main` 대상 repository ruleset을 생성한다.
- [x] Pull Request를 통해서만 `main`에 반영되도록 설정한다.
- [x] 필수 status check 이름을 실제 Actions job 이름에서 확인한다.
- [x] `Completion gate`를 필수 check로 지정한다.
- [x] CodeQL의 Python 분석을 필수 check로 지정한다.
- [x] CodeQL의 JavaScript/TypeScript 분석을 필수 check로 지정한다.
- [x] 브랜치가 최신 base를 반영해야 merge 가능하도록 설정한다.
- [x] force push와 branch deletion을 차단한다.
- [x] 관리자 우회를 허용하지 않도록 설정한다.
- [x] ruleset 적용 후 테스트 PR에서 pending check가 merge를 막는지 확인한다.
- [x] 테스트 PR에서 CI와 CodeQL 통과 후 merge 가능 상태가 되는지 확인한다.
- [x] ruleset 이름과 운영 방법을 `docs/CI_AND_SECURITY.md`에 기록한다.

## 5. 보안 및 공급망 운영

- [x] `.github/dependabot.yml`이 backend와 frontend 의존성을 감시한다.
- [x] Dependabot alerts와 security updates가 활성화되어 있다.
- [x] Secret scanning이 활성화되어 있다.
- [x] Push protection이 활성화되어 있다.
- [x] CodeQL workflow가 Python과 JavaScript/TypeScript를 분석한다.
- [ ] Dependabot PR에 CI가 실행되는지 확인한다.
- [ ] Dependabot PR의 자동 merge 사용 여부를 결정한다.
- [ ] 자동 merge를 사용한다면 patch 수준과 필수 check 범위를 제한한다.
- [ ] CodeQL alert 처리 절차를 `$ci-failure-loop`와 문서에 연결한다.
- [ ] Secret scanning alert 발생 시 revoke, rotate, history 점검 절차를 문서화한다.
- [ ] Sentry event에 개인정보가 포함되지 않는지 운영 전 점검한다.
- [ ] `.env.example` 또는 `.env.tpl`에 실제 secret이 없는지 주기적으로 확인한다.

## 6. LICENSE 및 공개 저장소 권리 점검

라이선스는 코드 공개 여부와 별개의 사용 허가다. 결론을 임의로 선택하지 않는다.

### 권리와 출처 확인

- [ ] 저장소의 코드, 문서, 이미지, 아이콘, 폰트, fixture 출처를 목록화한다.
- [ ] 외부에서 가져온 코드와 에셋의 원 라이선스를 확인한다.
- [ ] 재배포가 금지되거나 출처 표시가 필요한 항목을 식별한다.
- [x] 알려진 제거 대상 조직명(`교원`, `교원그룹`, `kyowon`)이 현재 tree와 Git history에 남아 있지 않은지 확인한다.
- [ ] 실제 학생·보호자·교사 개인정보나 이를 복원할 수 있는 fixture가 없는지 확인한다.
- [ ] Git history에도 제거 대상 이름, 개인정보, secret이 남아 있는지 별도로 점검한다.
- [ ] 의존성 라이선스와 애플리케이션 배포 방식의 충돌 여부를 확인한다.
- [ ] 저작권자가 본인인지, 공동 저작권자의 동의가 필요한지 확인한다.

### 라이선스 결정

- [ ] 외부 사용과 수정·재배포를 허용할지 결정한다.
- [ ] 특허 조항이 필요한지 결정한다.
- [ ] 소스 공개 의무가 있는 copyleft 라이선스를 원하는지 결정한다.
- [ ] 상업적 사용 허용 여부를 결정한다.
- [ ] 기여를 받을 계획과 Contributor License Agreement 필요 여부를 결정한다.
- [ ] 아래 선택지 중 프로젝트 의도에 맞는 방식을 검토한다.
  - [ ] MIT: 짧고 허용적이며 저작권·면책 고지를 요구한다.
  - [ ] Apache-2.0: 허용적이며 명시적인 특허 조항을 포함한다.
  - [ ] GPL 계열: 파생물 배포 시 소스 공개 의무가 발생할 수 있다.
  - [ ] 비공개 권리 유지: `LICENSE`를 추가하지 않고 사용 허가를 부여하지 않는다.
  - [ ] 별도 상용 라이선스: 법률 검토 후 프로젝트 전용 조건을 사용한다.
- [ ] 불확실하거나 제3자 권리가 섞여 있으면 법률 전문가에게 검토를 요청한다.
- [ ] 선택한 라이선스 전문을 루트 `LICENSE`에 정확히 추가한다.
- [ ] 필요한 저작권자 이름과 연도를 확인한다.
- [ ] `README.md`에 라이선스 요약과 `LICENSE` 링크를 추가한다.
- [ ] 라이선스가 코드에만 적용되고 별도 에셋에는 적용되지 않는다면 범위를 명시한다.
- [ ] GitHub가 선택한 라이선스를 정상 감지하는지 확인한다.

### 공개 저장소 문서

- [ ] `SECURITY.md`에 지원 버전과 비공개 취약점 신고 방법을 작성한다.
- [ ] `CONTRIBUTING.md` 추가 여부를 결정한다.
- [ ] 외부 기여를 받는다면 개발 환경, 검증, Issue/PR 규칙을 작성한다.
- [ ] 행동강령이 필요한 규모인지 결정한다.
- [ ] 저장소 설명과 README가 현재 제품의 실제 소유·용도와 일치하는지 확인한다.

## 7. 초기 Issue 생성 목록

Issue는 템플릿과 라벨을 먼저 적용한 뒤 생성한다.

- [x] `OPS-006: 공개 저장소 LICENSE와 에셋 적용 범위 결정` — [#13](https://github.com/yhames/studentory/issues/13)
  - [x] 유형: Decision
  - [x] 영역: ops
- [x] `OPS-007: 공개 저장소 SECURITY 정책 범위 결정` — [#14](https://github.com/yhames/studentory/issues/14)
  - [x] 유형: Decision
  - [x] 영역: ops
- [x] `OPS-005: GitHub Issue 기반 Loop Engineering 확장` — [#11](https://github.com/yhames/studentory/issues/11)
  - [x] 유형: Feature
  - [x] 영역: ops
- [x] `OPS-004: UI 기준 승인` — [#5](https://github.com/yhames/studentory/issues/5)
  - [ ] 유형: Decision 또는 Feature 중 실제 승인 절차에 맞게 선택한다.
  - [ ] `docs/UI_SPEC.md`의 미승인 항목을 수용 조건으로 연결한다.
- [x] `STU-001: 학생 API 계약 기준선` — [#6](https://github.com/yhames/studentory/issues/6)
  - [ ] 유형: Feature
  - [ ] 영역: cross-stack
- [x] `STU-002: 학생 목록 상태 완성` — [#7](https://github.com/yhames/studentory/issues/7)
  - [ ] 유형: Feature
  - [ ] 영역: frontend
  - [ ] UI review와 Playwright 증거를 요구한다.
- [x] `STU-003: 학생 생성·수정 흐름 완성` — [#8](https://github.com/yhames/studentory/issues/8)
  - [ ] 유형: Feature
  - [ ] 영역: cross-stack
- [x] `STU-004: 학생 상세·정기 일정 흐름 완성` — [#9](https://github.com/yhames/studentory/issues/9)
  - [ ] 유형: Feature
  - [ ] 영역: cross-stack
- [x] `DEC-LESSON-001: 수업 생명주기 결정` — [#10](https://github.com/yhames/studentory/issues/10)
  - [ ] 유형: Decision
  - [ ] LES-001, LES-002, LES-003을 blocker 관계로 기록한다.
- [x] 각 Issue 생성 전 현재 구현 상태를 다시 조사한다.
- [x] 이미 충족된 수용 조건은 Issue에 미완료로 복사하지 않는다.
- [x] 생성 후 Roadmap에 실제 Issue 번호와 URL을 반영한다.

## 8. 권장 구현 순서

- [x] 1단계: Issue Forms, 라벨, `$github-issue`를 함께 구현한다.
- [x] 2단계: 기존 `$implement-feature-slice`를 Issue 입력 방식으로 확장한다.
- [x] 3단계: PR 템플릿과 `$github-pr`을 구현한다.
- [x] 4단계: `$git-commit`을 추가하고 커밋 규칙을 문서화한다.
- [x] 5단계: repository ruleset을 적용하고 테스트 PR로 검증한다.
- [ ] 6단계: 권리·에셋 감사를 완료한 뒤 LICENSE를 결정한다.
- [ ] 7단계: 초기 Roadmap Issue를 생성하고 문서와 연결한다.
- [ ] 8단계: 첫 Issue를 전체 루프로 수행해 운영상 중복과 누락을 수정한다.

## 9. 전체 루프 완료 조건

- [ ] Roadmap 항목 또는 Decision에서 중복 없는 Issue를 만들 수 있다.
- [ ] Issue 하나를 입력으로 구현 범위와 수용 조건을 고정할 수 있다.
- [ ] 구현 후 표준 로컬 검증과 UI 검토를 실행할 수 있다.
- [ ] 의도한 파일만 커밋하고 별도 브랜치에 push할 수 있다.
- [ ] 연결 Issue와 검증 증거를 포함한 PR을 만들 수 있다.
- [ ] 실패한 `Completion gate` 또는 CodeQL이 merge를 실제로 차단한다.
- [ ] 통과한 PR만 merge 가능한 상태가 된다.
- [ ] merge 후 Issue와 Roadmap 상태가 일치한다.
- [ ] 공개 저장소의 코드·에셋 사용 조건이 LICENSE와 문서에 명확히 표시된다.
- [ ] 위 과정을 첫 실제 Feature Issue에서 재현하고 `docs/LOOP_LOG.md`에 증거를 남긴다.
