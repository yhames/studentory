# Studentory Roadmap

## 사용 규칙

- 한 번의 구현 루프에서는 한 항목만 선택한다.
- 항목을 시작하기 전에 수용 조건을 확인하고 필요하면 구체화한다.
- `PRODUCT_SPEC.md`의 Open Questions를 임의로 결정하지 않는다.
- 기능 상태는 `Pending`, `In progress`, `Blocked`, `Done` 중 하나로 기록한다.
- 모든 수용 조건과 관련 검증이 통과한 뒤에만 `Done`으로 변경한다.
- 완료 항목에는 검증 근거와 관련 커밋 또는 PR을 기록한다.

## M0 — 개발 루프 기반

| ID | 상태 | 작업 | 완료 조건 |
| --- | --- | --- | --- |
| OPS-001 | Done | 프로젝트 진입 문서 정리 | 실행, 검증, 문서, Skill 사용법이 루트 README에 명시됨 |
| OPS-002 | Done | 공통 검증 스크립트 추가 | 백엔드 정적 검사·테스트와 프론트엔드 lint·build를 한 명령으로 실행 가능 |
| OPS-003 | Done | 저장소 Skill 구성 | 수직 기능 구현, 교차 스택 검증, UI 검토 Skill이 유효한 형식으로 존재 |
| OPS-004 | Pending | UI 기준 승인 | `docs/UI_SPEC.md`의 사용자 검토 항목이 확정되고 승인 상태로 변경됨 |

OPS-004 관련 Issue: [#5](https://github.com/yhames/studentory/issues/5)

## M1 — 학생 관리 MVP

### STU-001 학생 API 계약 기준선

상태: Pending

관련 Issue: [#6](https://github.com/yhames/studentory/issues/6)

수용 조건:

- 학생 목록, 생성, 상세, 수정, 삭제의 요청·응답 스키마와 상태 코드가 테스트로 고정된다.
- 유효하지 않은 입력과 존재하지 않는 학생의 오류 응답이 테스트로 고정된다.
- 프론트엔드 타입과 API 클라이언트가 백엔드 계약과 일치한다.
- 관련 백엔드 검사와 프론트엔드 빌드가 통과한다.

### STU-002 학생 목록 상태 완성

상태: Pending

관련 Issue: [#7](https://github.com/yhames/studentory/issues/7)

수용 조건:

- 로딩, 빈 목록, 성공, 오류 상태가 구분되어 표시된다.
- 목록에서 학생 상세 화면으로 키보드로 이동할 수 있다.
- API 실패가 사용자에게 의미 있는 메시지로 표시된다.
- 관련 UI 검토와 프론트엔드 검증이 통과한다.

### STU-003 학생 생성·수정 흐름 완성

상태: Pending

관련 Issue: [#8](https://github.com/yhames/studentory/issues/8)

수용 조건:

- 필수 입력과 허용 값이 백엔드에서 검증된다.
- 프론트엔드는 동일한 규칙으로 빠른 피드백을 제공한다.
- 저장 중 중복 제출이 방지된다.
- 실패 시 입력 내용이 유지되고 오류가 표시된다.
- 성공 시 목록 또는 상세 화면에 최신 데이터가 반영된다.
- API 테스트와 UI 검토가 통과한다.

### STU-004 학생 상세·정기 일정 흐름 완성

상태: Pending

관련 Issue: [#9](https://github.com/yhames/studentory/issues/9)

수용 조건:

- 학생 기본 정보와 정기 수업 일정이 명확히 구분된다.
- 일정 생성, 수정, 삭제의 성공과 오류 상태가 처리된다.
- 존재하지 않는 학생 또는 일정에 대한 API 계약이 테스트된다.
- API 테스트와 UI 검토가 통과한다.

## M2 — 수업 관리 MVP

아래 의사결정 게이트를 통과하기 전에는 미확정 규칙을 구현하지 않는다.

### DEC-LESSON-001 수업 생명주기 결정

상태: Blocked

관련 Issue: [#10](https://github.com/yhames/studentory/issues/10)

결정 필요:

- 수업 완료 조건
- 일정으로부터 수업을 생성하는 시점과 기간
- 일정 변경, 취소, 보강의 표현 방식
- 여러 정기 일정 허용 여부

### LES-001 수업 API 계약 기준선

상태: Blocked — `DEC-LESSON-001` 필요

### LES-002 오늘의 수업 화면

상태: Blocked — `DEC-LESSON-001` 필요

### LES-003 수업 기록과 완료 흐름

상태: Blocked — `DEC-LESSON-001` 필요

## 후속 마일스톤

- M3: 시나리오와 커리큘럼 진행
- M4: 교재 관리
- M5: 학부모 상담
- M6: 교사 자료와 할 일
- M7: 일일 대시보드

각 마일스톤은 관련 Open Questions가 결정된 후 동일한 형식의 수직 기능으로 분해한다.
