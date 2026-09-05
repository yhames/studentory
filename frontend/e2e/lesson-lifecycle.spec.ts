import { expect, test, type Page } from '@playwright/test'

const student = {
  id: 1,
  name: '김민아',
  birth_year: new Date().getFullYear() - 9,
  gender: 'FEMALE',
  stage: 'STAGE_1',
  status: 'ACTIVE',
  special_notes: null,
  request_notes: null,
}

interface MockLesson {
  id: number
  student_id: number
  schedule_id: number | null
  lesson_date: string
  lesson_time: string
  lesson_status: 'SCHEDULED' | 'COMPLETED' | 'CANCELED'
  preparation_status: 'NOT_PREPARED' | 'PREPARED'
  attendance_status: null | 'PRESENT' | 'ABSENT'
  curriculum_progress: string | null
  special_notes: string | null
  attitude_notes: string | null
}

test('시간표 카드에서 모달 전용 기록과 수업 lifecycle을 처리한다', async ({ page }) => {
  const state = await mockLessonApi(page, [scheduledLesson()])
  await page.goto('/lessons')

  const timetable = page.locator('.desktop-timetable')
  await expect(timetable.getByRole('columnheader', { name: /월요일/ })).toBeVisible()
  await expect(timetable.getByRole('columnheader', { name: /금요일/ })).toBeVisible()
  await expect(timetable.getByRole('columnheader', { name: /토요일/ })).toHaveCount(0)
  await expect(timetable.getByRole('columnheader', { name: /일요일/ })).toHaveCount(0)
  await expect(timetable.getByRole('rowheader', { name: '16:00', exact: true })).toBeVisible()
  await expect(timetable.getByRole('rowheader')).toHaveCount(1)

  const card = page.getByRole('button', { name: /김민아 월요일 .* 16:00 수업 상세 열기/ })
  await expect(card).toContainText('여')
  await expect(card).toContainText('1단계')
  await expect(card).toContainText('약 9세')
  await expect(card).toContainText('수업 예정')
  await expect(page.getByRole('button', { name: '출석', exact: true })).toHaveCount(0)

  const dialog = page.getByRole('dialog', { name: '김민아 수업 상세' })
  await card.click()
  await expect(dialog).toBeVisible()
  await expect(dialog.getByRole('button', { name: '수업 완료 처리' })).toBeDisabled()
  await expect(dialog.getByText('출석 또는 결석을 입력하면 수업을 완료할 수 있어요.')).toBeVisible()
  await dialog.getByLabel('단계').fill('저장하지 않을 값')
  await dialog.getByRole('button', { name: '변경 취소' }).click()
  await card.press('Enter')
  await expect(dialog.getByLabel('단계')).toHaveValue('3')

  await dialog.getByLabel('단계').fill('Escape로 폐기할 값')
  await page.keyboard.press('Escape')
  await expect(card).toBeFocused()
  await card.press('Space')
  await expect(dialog.getByLabel('단계')).toHaveValue('3')

  await dialog.getByLabel('준비').selectOption('PREPARED')
  await dialog.getByLabel('출결').selectOption('PRESENT')
  await expect(dialog.getByRole('button', { name: '수업 완료 처리' })).toBeEnabled()
  await dialog.getByLabel('단계').fill('3-2')
  await dialog.getByRole('button', { name: '저장' }).click()
  await expect(card).toContainText('준비 완료')
  await expect(card).toContainText('출석')

  await card.click()
  await dialog.getByRole('button', { name: '수업 완료 처리' }).click()
  await expect(dialog).toBeHidden()
  await expect(card).toContainText('✓ 수업 완료')
  await expect(card).toHaveCSS('border-left-width', '4px')
  await expect(card).toHaveCSS('border-left-style', 'solid')
  await expect(card).toHaveCSS('background-image', /linear-gradient/)

  await card.click()
  page.once('dialog', (confirmation) => confirmation.accept())
  await dialog.getByRole('button', { name: '미완료로 되돌리기' }).click()
  await expect(card).toContainText('수업 예정')
  expect(state.lessons[0].attendance_status).toBe('PRESENT')
  expect(state.lessons[0].curriculum_progress).toBe('3-2')

  await card.click()
  page.once('dialog', (confirmation) => confirmation.accept())
  await dialog.getByRole('button', { name: '수업 취소' }).click()
  await expect(card).toContainText('수업 취소')

  await card.click()
  await dialog.getByRole('button', { name: '수업 복구' }).click()
  await expect(card).toContainText('수업 예정')
})

test('가장 빠른 수업부터 가장 늦은 수업까지 동적 시간축을 만들고 같은 슬롯의 복수 수업을 보존한다', async ({ page }) => {
  const monday = currentMonday()
  await mockLessonApi(page, [
    { ...scheduledLesson(), id: 1, lesson_time: '17:07:00' },
    { ...scheduledLesson(), id: 2, lesson_time: '17:09:00' },
    { ...scheduledLesson(), id: 3, lesson_time: '12:57:00' },
    { ...scheduledLesson(), id: 4, lesson_time: '23:10:00' },
  ])
  await page.goto('/lessons')

  const slot = page.locator(`[data-slot="${monday}-17:00"]`)
  await expect(slot.getByRole('button')).toHaveCount(2)
  await expect(slot.locator('.lesson-card-time')).toHaveCount(0)
  await expect(page.locator('.desktop-timetable').getByRole('rowheader').first()).toHaveText('12:50')
  await expect(page.locator('.desktop-timetable').getByRole('rowheader').last()).toHaveText('23:10')
})

test('수동 수업은 모달의 가장 왼쪽 삭제 action으로 제거한다', async ({ page }) => {
  await mockLessonApi(page, [{ ...scheduledLesson(), schedule_id: null }])
  await page.goto('/lessons')

  await page.getByRole('button', { name: /김민아 월요일 .* 16:00 수업 상세 열기/ }).click()
  const dialog = page.getByRole('dialog', { name: '김민아 수업 상세' })
  const lifecycleButtons = dialog.locator('.lesson-lifecycle-actions button')
  await expect(lifecycleButtons.first()).toHaveText('삭제')

  page.once('dialog', (confirmation) => confirmation.accept())
  await lifecycleButtons.first().click()
  await expect(page.getByText(/선택한 주의 수업이 없습니다/)).toBeVisible()
  const emptyTimetable = page.locator('.desktop-timetable')
  await expect(emptyTimetable).toBeVisible()
  await expect(emptyTimetable.getByRole('rowheader', { name: '13:00', exact: true })).toBeVisible()
  await expect(emptyTimetable.getByRole('rowheader', { name: '23:00', exact: true })).toBeVisible()
})

test('모바일은 요일별 시간표를 전환하고 페이지 가로 넘침이 없다', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await mockLessonApi(page, [{ ...scheduledLesson(), lesson_time: '16:07:00', curriculum_progress: '긴 단계 정보도 자연스럽게 줄바꿈' }])
  await page.goto('/lessons')

  const daySwitch = page.getByRole('group', { name: '표시할 요일' })
  await expect(daySwitch.getByRole('button')).toHaveCount(5)
  await daySwitch.getByRole('button').first().click()
  await expect(page.getByRole('button', { name: /김민아 월요일 .* 16:07 수업 상세 열기/ })).toBeVisible()
  await expect(page.locator('.mobile-timetable-scroll').getByRole('rowheader', { name: '16:00', exact: true })).toBeVisible()
  await expect(page.locator('.mobile-timetable-scroll').getByRole('rowheader')).toHaveCount(1)
  expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false)
})

test('현재 주의 오늘을 텍스트로 표시하고 키보드로 수업 상세를 연다', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-09-02T09:00:00'))
  await mockLessonApi(page, [{ ...scheduledLesson(), lesson_date: '2026-09-02' }])
  await page.goto('/lessons')

  const today = page.locator('.desktop-timetable').getByRole('columnheader', { name: /수요일.*오늘/ })
  await expect(today).toBeVisible()
  await expect(today.getByText('오늘')).toBeVisible()

  const card = page.getByRole('button', { name: /김민아 수요일 .* 16:00 수업 상세 열기/ })
  await card.focus()
  await card.press('Enter')
  await expect(page.getByRole('dialog', { name: '김민아 수업 상세' })).toBeVisible()
})

test('수업 조회 오류는 빈 주간과 구분하고 다시 시도할 수 있다', async ({ page }) => {
  let listAttempts = 0
  await page.route(/^http:\/\/(?:localhost|127\.0\.0\.1):8000\/students(?:\?.*)?$/, (route) => route.fulfill({ json: [student] }))
  await page.route(/^http:\/\/(?:localhost|127\.0\.0\.1):8000\/lessons(?:\/.*)?(?:\?.*)?$/, async (route) => {
    const url = new URL(route.request().url())
    if (url.pathname === '/lessons/generate') return route.fulfill({ json: { created_count: 0 } })
    if (route.request().method() === 'GET' && url.pathname === '/lessons') {
      listAttempts += 1
      return listAttempts === 1
        ? route.fulfill({ status: 503, json: { detail: 'internal service detail' } })
        : route.fulfill({ json: [] })
    }
    return route.abort()
  })

  await page.goto('/lessons')
  await expect(page.getByText('수업을 불러오지 못했어요')).toBeVisible()
  await expect(page.getByText('선택한 주의 수업이 없습니다.')).toHaveCount(0)
  await expect(page.getByText('internal service detail')).toHaveCount(0)

  await page.getByRole('button', { name: '다시 시도' }).click()
  await expect(page.getByText('선택한 주의 수업이 없습니다.')).toBeVisible()
  expect(listAttempts).toBeGreaterThan(1)
})

test('Desktop Compact Mobile에서 오늘 수업 화면이 페이지 너비를 넘지 않는다', async ({ page }) => {
  const consoleErrors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text())
  })
  await page.clock.setFixedTime(new Date('2026-09-02T09:00:00'))
  await mockLessonApi(page, [{ ...scheduledLesson(), lesson_date: '2026-09-02' }])

  for (const viewport of [
    { width: 1440, height: 900, mode: 'desktop' },
    { width: 1024, height: 768, mode: 'desktop' },
    { width: 390, height: 844, mode: 'mobile' },
  ] as const) {
    await page.setViewportSize(viewport)
    await page.goto('/lessons')
    const timetable = page.locator(viewport.mode === 'desktop' ? '.desktop-timetable' : '.mobile-timetable')
    await expect(timetable).toBeVisible()
    await expect(timetable.getByText('오늘').first()).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true)
  }
  expect(consoleErrors).toEqual([])
})

test('주간 이동은 선택한 7일 범위로 수업을 생성하고 조회한다', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-09-02T09:00:00'))
  const state = await mockLessonApi(page, [])
  await page.goto('/lessons')

  await expect.poll(() => state.generatedRanges).toContainEqual({ date_from: '2026-08-31', date_to: '2026-09-06' })
  await expect.poll(() => state.listRanges).toContainEqual({ date_from: '2026-08-31', date_to: '2026-09-06' })

  await page.getByRole('button', { name: '다음 주' }).click()
  await expect.poll(() => state.generatedRanges).toContainEqual({ date_from: '2026-09-07', date_to: '2026-09-13' })
  await expect.poll(() => state.listRanges).toContainEqual({ date_from: '2026-09-07', date_to: '2026-09-13' })
})

test('기록 저장 실패 시 입력과 모달을 유지하고 내부 오류를 숨긴다', async ({ page }) => {
  const state = await mockLessonApi(page, [scheduledLesson()])
  state.failNextPatch = true
  await page.goto('/lessons')

  await page.getByRole('button', { name: /김민아 월요일 .* 16:00 수업 상세 열기/ }).click()
  const dialog = page.getByRole('dialog', { name: '김민아 수업 상세' })
  await dialog.getByLabel('특이사항').fill('다음 시간에 다시 확인')
  await dialog.getByRole('button', { name: '저장', exact: true }).click()

  await expect(dialog).toBeVisible()
  await expect(dialog.getByLabel('특이사항')).toHaveValue('다음 시간에 다시 확인')
  await expect(dialog.getByText('수업 기록을 저장하지 못했어요. 입력 내용을 유지했으니 다시 시도해 주세요.')).toBeVisible()
  await expect(dialog.getByText('internal service detail')).toHaveCount(0)
})

test('기록 저장 후 완료만 실패하면 저장 결과를 유지해 완료를 재시도한다', async ({ page }) => {
  const state = await mockLessonApi(page, [scheduledLesson()])
  state.failNextComplete = true
  await page.goto('/lessons')

  const card = page.getByRole('button', { name: /김민아 월요일 .* 16:00 수업 상세 열기/ })
  await card.click()
  const dialog = page.getByRole('dialog', { name: '김민아 수업 상세' })
  await dialog.getByLabel('출결').selectOption('ABSENT')
  await dialog.getByLabel('수업태도').fill('집중 지원 필요')
  await dialog.getByRole('button', { name: '수업 완료 처리' }).click()

  await expect(dialog).toBeVisible()
  await expect(dialog.getByText('기록은 저장했지만 완료 처리하지 못했어요. 다시 완료를 눌러 주세요.')).toBeVisible()
  expect(state.lessons[0]).toMatchObject({ attendance_status: 'ABSENT', attitude_notes: '집중 지원 필요', lesson_status: 'SCHEDULED' })

  await dialog.getByRole('button', { name: '수업 완료 처리' }).click()
  await expect(dialog).toBeHidden()
  await expect(card).toContainText('✓ 수업 완료')
  expect(state.lessons[0]).toMatchObject({ attendance_status: 'ABSENT', attitude_notes: '집중 지원 필요', lesson_status: 'COMPLETED' })
})

test('수업 기록 모달은 Desktop Compact Mobile에서 완료 조건과 조작을 보존한다', async ({ page }) => {
  const consoleErrors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text())
  })
  await page.clock.setFixedTime(new Date('2026-09-02T09:00:00'))
  await mockLessonApi(page, [{ ...scheduledLesson(), lesson_date: '2026-09-02' }])

  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 1024, height: 768 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport)
    await page.goto('/lessons')
    await page.getByRole('button', { name: /김민아 수요일 .* 16:00 수업 상세 열기/ }).click()
    const dialog = page.getByRole('dialog', { name: '김민아 수업 상세' })
    await expect(dialog.getByText('출석 또는 결석을 입력하면 수업을 완료할 수 있어요.')).toBeVisible()
    await expect(dialog.getByRole('button', { name: '수업 완료 처리' })).toBeDisabled()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true)
    await dialog.getByRole('button', { name: '변경 취소' }).click()
  }
  expect(consoleErrors).toEqual([])
})

async function mockLessonApi(page: Page, initialLessons: MockLesson[]) {
  const state = {
    lessons: initialLessons,
    generatedRanges: [] as Array<{ date_from: string, date_to: string }>,
    listRanges: [] as Array<{ date_from: string, date_to: string }>,
    failNextPatch: false,
    failNextComplete: false,
  }
  await page.route(/^http:\/\/(?:localhost|127\.0\.0\.1):8000\/students(?:\?.*)?$/, (route) => route.fulfill({ json: [student] }))
  await page.route(/^http:\/\/(?:localhost|127\.0\.0\.1):8000\/lessons(?:\/.*)?(?:\?.*)?$/, async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    const id = Number(url.pathname.split('/')[2])

    if (url.pathname === '/lessons/generate') {
      state.generatedRanges.push(request.postDataJSON() as { date_from: string, date_to: string })
      await route.fulfill({ json: { created_count: 0 } })
      return
    }
    if (request.method() === 'GET' && url.pathname === '/lessons') {
      state.listRanges.push({ date_from: url.searchParams.get('date_from') ?? '', date_to: url.searchParams.get('date_to') ?? '' })
      await route.fulfill({ json: state.lessons })
      return
    }
    if (request.method() === 'PATCH') {
      if (state.failNextPatch) {
        state.failNextPatch = false
        await route.fulfill({ status: 503, json: { detail: 'internal service detail' } })
        return
      }
      state.lessons = state.lessons.map((lesson) => lesson.id === id ? { ...lesson, ...request.postDataJSON() } : lesson)
      await route.fulfill({ json: state.lessons.find((lesson) => lesson.id === id) })
      return
    }
    if (url.pathname.endsWith('/cancel')) {
      updateStatus(state, id, 'CANCELED')
    } else if (url.pathname.endsWith('/restore') || url.pathname.endsWith('/reopen')) {
      updateStatus(state, id, 'SCHEDULED')
    } else if (url.pathname.endsWith('/complete')) {
      if (state.failNextComplete) {
        state.failNextComplete = false
        await route.fulfill({ status: 503, json: { detail: 'internal service detail' } })
        return
      }
      updateStatus(state, id, 'COMPLETED')
    } else if (request.method() === 'DELETE') {
      state.lessons = state.lessons.filter((lesson) => lesson.id !== id)
      await route.fulfill({ status: 204, body: '' })
      return
    } else {
      await route.abort()
      return
    }
    await route.fulfill({ json: state.lessons.find((lesson) => lesson.id === id) })
  })
  return state
}

function updateStatus(state: { lessons: MockLesson[] }, id: number, lesson_status: MockLesson['lesson_status']) {
  state.lessons = state.lessons.map((lesson) => lesson.id === id ? { ...lesson, lesson_status } : lesson)
}

function scheduledLesson(): MockLesson {
  return {
    id: 1,
    student_id: 1,
    schedule_id: 1,
    lesson_date: currentMonday(),
    lesson_time: '16:00:00',
    lesson_status: 'SCHEDULED',
    preparation_status: 'NOT_PREPARED',
    attendance_status: null,
    curriculum_progress: '3',
    special_notes: null,
    attitude_notes: null,
  }
}

function currentMonday(): string {
  const date = new Date()
  date.setDate(date.getDate() - (date.getDay() === 0 ? 6 : date.getDay() - 1))
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-')
}
