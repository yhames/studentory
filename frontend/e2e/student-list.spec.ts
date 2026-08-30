import { expect, test } from '@playwright/test'

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
  await page.route('http://localhost:8000/students', async (route) => {
    await route.fulfill({ json: [student] })
  })
  await page.route(
    'http://localhost:8000/students/1/schedules',
    async (route) => {
      await route.fulfill({ json: [] })
    },
  )
})

test('학생 목록을 불러오고 검색 결과를 갱신한다', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: '학생 관리' })).toBeVisible()
  await expect(page.getByText('김민아')).toBeVisible()

  await page.getByLabel('검색').fill('없는 학생')
  await expect(page.getByText('조건에 맞는 학생이 없습니다.')).toBeVisible()
})
