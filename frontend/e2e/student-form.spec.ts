import { expect, test, type Locator, type Page } from '@playwright/test'

const student = {
  id: 1,
  name: '김민아',
  birth_year: 2017,
  gender: 'FEMALE',
  stage: 'STAGE_1',
  status: 'ACTIVE',
  special_notes: null,
  request_notes: null,
}

const schedule = {
  id: 1,
  student_id: 1,
  day_of_week: 'MONDAY',
  lesson_time: '15:00:00',
  effective_start_date: '2026-01-01',
}

const apiUrl = (path: string) => new RegExp(`^http:\\/\\/(?:localhost|127\\.0\\.0\\.1):8000${path}$`)

test('생성 입력을 빠르게 검증하고 서버 실패 후 값을 유지해 재시도한다', async ({ page }) => {
  let failCreate = true
  await mockStudentReads(page, [])
  await page.route(apiUrl('/students'), async (route) => {
    if (route.request().method() !== 'POST') return route.fallback()
    if (failCreate) {
      failCreate = false
      await route.fulfill({ status: 500, json: { detail: 'database stack trace' } })
      return
    }
    await route.fulfill({ status: 201, json: student })
  })
  await page.route(apiUrl('/students/1/schedules'), async (route) => route.fulfill({ status: 201, json: schedule }))
  await page.goto('/students')
  await page.getByRole('button', { name: '학생 추가' }).click()

  const dialog = page.getByRole('dialog', { name: '학생 추가' })
  await dialog.getByLabel('이름').fill('   ')
  await dialog.getByRole('button', { name: '저장', exact: true }).click()
  await expect(dialog.getByLabel('이름')).toBeFocused()

  await dialog.getByLabel('이름').fill('김민아')
  await dialog.getByLabel('나이').fill('9')
  await dialog.getByLabel('성별').selectOption('FEMALE')
  await dialog.getByRole('button', { name: '저장', exact: true }).click()
  await expect(dialog.getByText('학생을 저장하지 못했어요. 입력 내용을 확인하고 다시 시도해 주세요.')).toBeVisible()
  await expect(dialog.getByText(/database|stack trace/)).toHaveCount(0)
  await expect(dialog.getByLabel('이름')).toHaveValue('김민아')
  await expect(dialog.getByLabel('나이')).toHaveValue('9')

  await dialog.getByRole('button', { name: '저장', exact: true }).click()
  await expect(dialog).toBeHidden()
  await expect(page.getByRole('button', { name: /김민아/ })).toBeVisible()
})

test('생성 저장 중에는 중복 제출과 모든 닫기 경로를 막는다', async ({ page }) => {
  let finishCreate: (() => void) | undefined
  const pendingCreate = new Promise<void>((resolve) => { finishCreate = resolve })
  await mockStudentReads(page, [])
  await page.route(apiUrl('/students'), async (route) => {
    if (route.request().method() !== 'POST') return route.fallback()
    await pendingCreate
    await route.fulfill({ status: 201, json: student })
  })
  await page.route(apiUrl('/students/1/schedules'), async (route) => route.fulfill({ status: 201, json: schedule }))
  await page.goto('/students')
  await page.getByRole('button', { name: '학생 추가' }).click()

  const dialog = page.getByRole('dialog', { name: '학생 추가' })
  await fillRequiredStudentFields(dialog)
  await dialog.getByRole('button', { name: '저장', exact: true }).click()
  await expect(dialog.getByRole('button', { name: '저장 중...' })).toBeDisabled()
  await expect(dialog.getByRole('button', { name: '닫기' })).toBeDisabled()
  await expect(dialog.getByRole('button', { name: '취소' })).toBeDisabled()
  await page.keyboard.press('Escape')
  await expect(dialog).toBeVisible()

  finishCreate?.()
  await expect(dialog).toBeHidden()
})

test('수정 실패 후 입력값을 유지하고 성공 결과를 상세 화면에 반영한다', async ({ page }) => {
  let currentStudent = student
  let failUpdate = true
  await mockStudentReads(page, [student])
  await page.route(apiUrl('/students/1'), async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({ json: currentStudent })
      return
    }
    if (failUpdate) {
      failUpdate = false
      await route.fulfill({ status: 500, json: { detail: 'internal hostname and stack trace' } })
      return
    }
    currentStudent = { ...currentStudent, ...route.request().postDataJSON() }
    await route.fulfill({ json: currentStudent })
  })
  await page.route(apiUrl('/students/1/schedules'), async (route) => route.fulfill({ json: [schedule] }))
  await page.route(apiUrl('/students/1/schedules/1'), async (route) => route.fulfill({ json: schedule }))
  await page.goto('/students/1')
  await page.getByRole('button', { name: '정보 수정' }).click()

  const dialog = page.getByRole('dialog', { name: '학생 정보 수정' })
  await dialog.getByLabel('이름').fill('김민아 수정')
  await dialog.getByRole('button', { name: '수정', exact: true }).click()
  await expect(dialog.getByText('학생 정보를 수정하지 못했어요. 입력 내용을 확인하고 다시 시도해 주세요.')).toBeVisible()
  await expect(dialog.getByText(/hostname|stack trace/)).toHaveCount(0)
  await expect(dialog.getByLabel('이름')).toHaveValue('김민아 수정')

  await dialog.getByRole('button', { name: '수정', exact: true }).click()
  await expect(dialog).toBeHidden()
  await expect(page.getByRole('heading', { name: '김민아 수정' })).toBeVisible()
})

async function mockStudentReads(page: Page, students: typeof student[]) {
  await page.route(apiUrl('/students'), async (route) => {
    if (route.request().method() === 'GET') await route.fulfill({ json: students })
    else await route.fallback()
  })
}

async function fillRequiredStudentFields(dialog: Locator) {
  await dialog.getByLabel('이름').fill('김민아')
  await dialog.getByLabel('나이').fill('9')
  await dialog.getByLabel('성별').selectOption('FEMALE')
}
