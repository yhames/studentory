# 1. API 및 프로젝트 기본 설정
HOST="0.0.0.0"
PORT=8000
PROJECT_NAME="Studentory 학원 관리 시스템"
API_V1_STR="/api/v1"

# 2. 데이터베이스 설정 (SQLModel / Alembic 호환)
# 로컬 개발용으로는 프로젝트 루트에 'studentory.db'라는 SQLite 파일이 자동으로 생성됩니다.
DATABASE_URL="sqlite:///./data/studentory.db"

# 3. JWT 인증 및 보안 설정
# 로컬 개발용 임시 키입니다. 운영 서버 배포 시에는 반드시 다른 비밀키로 변경해야 합니다.
SECRET_KEY="studentory-local-development-secret-key-change-me-in-production"
ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=10080

# 4. CORS 설정 (프론트엔드 주소 허용)
# 리액트(3000번)나 뷰 등 프론트엔드 로컬 서버와의 통신을 허용합니다. (쉼표 없이 JSON 배열 형태로 입력 가능)
CORS_ORIGINS=["http://localhost:3000","http://127.0.0.1:3000"]

# 5. Sentry (비워두면 비활성화)
SENTRY_DSN=""
SENTRY_ENVIRONMENT="development"
SENTRY_TRACES_SAMPLE_RATE=0.0
