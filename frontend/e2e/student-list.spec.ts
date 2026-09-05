import { expect, test } from '@playwright/test'

const STUDENTS_URL = /^http:\/\/(?:localhost|127\.0\.0\.1):8000\/students(?:\?.*)?$/
const SCHEDULES_URL = /^http:\/\/(?:localhost|127\.0\.0\.1):8000\/students\/1\/schedules(?:\?.*)?$/

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

test.beforeEach(async ({ page }) => {
  await page.route(STUDENTS_URL, async (route) => {
    await route.fulfill({ json: [student] })
  })
  await page.route(SCHEDULES_URL, async (route) => route.fulfill({ json: [] }))
})

test('학생 목록을 불러오고 검색 결과를 갱신한다', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: '학생 관리' })).toBeVisible()
  await expect(page.getByText('김민아')).toBeVisible()

  await page.getByLabel('검색').fill('없는 학생')
  await expect(page.getByText('조건에 맞는 학생이 없어요')).toBeVisible()
  await expect(page.getByRole('button', { name: '필터 초기화' })).toBeVisible()

  await page.getByRole('button', { name: '필터 초기화' }).click()
  const row = page.getByRole('button', { name: /김민아/ })
  await expect(row).toBeVisible()
  await row.press('Enter')
  await expect(page).toHaveURL(/\/students\/1$/)
})

test('전체 학생이 없는 상태를 필터 결과 없음과 구분한다', async ({ page }) => {
  await page.unroute(STUDENTS_URL)
  await page.route(STUDENTS_URL, async (route) => route.fulfill({ json: [] }))
  await page.goto('/')

  await expect(page.getByText('아직 등록된 학생이 없어요')).toBeVisible()
  await expect(page.getByText('조건에 맞는 학생이 없어요')).toHaveCount(0)
  await expect(page.getByRole('button', { name: '필터 초기화' })).toHaveCount(0)
})

test('API 오류는 내부 메시지를 숨기고 다시 시도할 수 있다', async ({ page }) => {
  let requestCount = 0
  await page.unroute(STUDENTS_URL)
  await page.route(STUDENTS_URL, async (route) => {
    requestCount += 1
    if (requestCount === 1) {
      await route.fulfill({ status: 500, json: { detail: 'database password leaked in stack trace' } })
      return
    }
    await route.fulfill({ json: [student] })
  })
  await page.goto('/')

  await expect(page.getByText('학생 기록을 불러오지 못했어요')).toBeVisible()
  await expect(page.getByText(/database password|stack trace/)).toHaveCount(0)
  await page.getByRole('button', { name: '다시 시도' }).click()
  await expect(page.getByRole('button', { name: /김민아/ })).toBeVisible()
})

test('학생 추가 모달이 포커스를 이동하고 닫을 때 복원한다', async ({ page }) => {
  await page.goto('/')

  const addButton = page.getByRole('button', { name: '학생 추가' })
  await addButton.click()

  const dialog = page.getByRole('dialog', { name: '학생 추가' })
  await expect(dialog).toBeVisible()
  await expect(dialog.getByLabel('이름')).toBeFocused()

  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
  await expect(addButton).toBeFocused()
})

test('모바일에서는 메뉴를 드로어로 열고 콘텐츠가 화면을 넘지 않는다', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')

  const menuButton = page.getByRole('button', { name: '메뉴 열기' })
  await expect(menuButton).toBeVisible()
  await expect(page.getByRole('navigation')).toBeHidden()

  await menuButton.click()
  await expect(page.getByRole('navigation')).toBeVisible()
  await expect(page.getByRole('link', { name: '학생 관리' })).toBeFocused()

  await page.keyboard.press('Escape')
  await expect(page.getByRole('navigation')).toBeHidden()
  await expect(menuButton).toBeFocused()
  await expect(page.getByText('김민아')).toBeVisible()

  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  )
  expect(hasHorizontalOverflow).toBe(false)
})
