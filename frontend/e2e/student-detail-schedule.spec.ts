import { expect, test, type Page } from '@playwright/test'

const student = { id: 1, name: '김민아', birth_year: 2017, gender: 'FEMALE', stage: 'STAGE_1', status: 'ACTIVE', special_notes: null, request_notes: null }
const schedule = { id: 7, student_id: 1, day_of_week: 'MONDAY', lesson_time: '15:00:00', effective_start_date: '2026-01-01' }
const api = (path: string) => new RegExp(`^http://(?:localhost|127[.]0[.]0[.]1):8000${path}$`)

test('존재하지 않는 학생과 일정 조회 실패를 구분한다', async ({ page }) => {
  await page.route(api('/students/999'), (route) => route.fulfill({ status: 404, json: { detail: 'Student not found' } }))
  await page.goto('/students/999')
  await expect(page.getByRole('heading', { name: '학생을 찾을 수 없어요.' })).toBeVisible()

  await page.route(api('/students/1'), (route) => route.fulfill({ json: student }))
  await page.route(api('/students/1/schedules'), (route) => route.fulfill({ status: 500, json: { detail: 'internal stack trace' } }))
  await page.goto('/students/1')
  await expect(page.getByRole('heading', { name: '김민아' })).toBeVisible()
  await expect(page.getByText('정기 일정을 불러오지 못했어요.')).toBeVisible()
  await expect(page.getByText(/stack trace/)).toHaveCount(0)
})

test('빈 일정에서 실패 후 입력을 유지해 생성한다', async ({ page }) => {
  let failed = false
  await mockDetail(page, [])
  await page.route(api('/students/1/schedules'), async (route) => {
    if (route.request().method() === 'GET') return route.fulfill({ json: [] })
    if (!failed) { failed = true; return route.fulfill({ status: 422, json: { detail: 'conflict details' } }) }
    return route.fulfill({
      status: 201,
      json: { ...schedule, ...route.request().postDataJSON(), lesson_time: '16:30:00' },
    })
  })
  await page.goto('/students/1')
  await expect(page.getByText('등록된 정기 일정이 없어요.')).toBeVisible()
  await page.getByRole('button', { name: '일정 추가' }).click()
  const dialog = page.getByRole('dialog', { name: '정기 일정 추가' })
  await dialog.getByLabel('수업시간').fill('16:30')
  await dialog.getByRole('button', { name: '추가', exact: true }).click()
  await expect(dialog.getByText('정기 일정을 저장하지 못했어요. 입력 내용을 확인하고 다시 시도해 주세요.')).toBeVisible()
  await expect(dialog.getByLabel('수업시간')).toHaveValue('16:30')
  await dialog.getByRole('button', { name: '추가', exact: true }).click()
  await expect(dialog).toBeHidden()
  await expect(page.getByText('16:30')).toBeVisible()
})

test('정기 일정을 수정하고 대상을 명시해 삭제한다', async ({ page }) => {
  await mockDetail(page, [schedule])
  await page.route(api('/students/1/schedules/7'), async (route) => {
    if (route.request().method() === 'PATCH') return route.fulfill({ json: { ...schedule, lesson_time: '16:30:00' } })
    return route.fulfill({ status: 204, body: '' })
  })
  await page.goto('/students/1')
  await page.getByRole('button', { name: '일정 수정' }).click()
  const dialog = page.getByRole('dialog', { name: '정기 일정 수정' })
  await dialog.getByLabel('수업시간').fill('16:30')
  await dialog.getByRole('button', { name: '수정', exact: true }).click()
  await expect(page.getByText('16:30')).toBeVisible()

  page.once('dialog', async (confirmation) => {
    expect(confirmation.message()).toContain('김민아 학생의 월요일 16:30 정기 일정')
    await confirmation.accept()
  })
  await page.getByRole('button', { name: '일정 삭제' }).click()
  await expect(page.getByText('등록된 정기 일정이 없어요.')).toBeVisible()
})

async function mockDetail(page: Page, schedules: typeof schedule[]) {
  await page.route(api('/students/1'), (route) => route.fulfill({ json: student }))
  await page.route(api('/students/1/schedules'), (route) => route.fulfill({ json: schedules }))
}
