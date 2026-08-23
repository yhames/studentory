import type { FormEvent } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { cancelLesson, completeLesson, createLesson, deleteLesson, generateLessons, getLessons, updateLesson } from '../api/lessons'
import { getStudents } from '../api/students'
import { LessonCreateModal } from '../features/lesson/components/LessonCreateModal'
import { LessonRecordModal } from '../features/lesson/components/LessonRecordModal'
import { getErrorMessage } from '../features/student/utils'
import type { Lesson, LessonCreatePayload, LessonUpdatePayload, PreparationStatus } from '../types/lessons'
import type { Student } from '../types/students'

const DAYS = ['월', '화', '수', '목', '금', '토', '일']
const STATUS = { SCHEDULED: '예정', COMPLETED: '완료', CANCELED: '취소' } as const

function dateString(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}
function monday(date: Date) {
  const result = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  result.setDate(result.getDate() - (result.getDay() === 0 ? 6 : result.getDay() - 1))
  return result
}
function addDays(date: Date, days: number) {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}
function emptyToNull(value: string | null | undefined) {
  const result = value?.trim() ?? ''
  return result === '' ? null : result
}

export function LessonPage() {
  const [weekStart, setWeekStart] = useState(() => monday(new Date()))
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [view, setView] = useState<'DATE' | 'STUDENT'>('DATE')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<Lesson | null>(null)
  const [recordForm, setRecordForm] = useState<LessonUpdatePayload>({})
  const [createOpen, setCreateOpen] = useState(false)
  const [createForm, setCreateForm] = useState<LessonCreatePayload>({ student_id: 0, lesson_date: dateString(new Date()), lesson_time: '15:00' })
  const [modalError, setModalError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const dateFrom = dateString(weekStart)
  const dateTo = dateString(addDays(weekStart, 6))
  const studentsById = useMemo(() => new Map(students.map((student) => [student.id, student])), [students])

  const loadWeek = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      await generateLessons({ date_from: dateFrom, date_to: dateTo })
      const [lessonResult, studentResult] = await Promise.all([getLessons({ date_from: dateFrom, date_to: dateTo }), getStudents()])
      setLessons(lessonResult)
      setStudents(studentResult)
    } catch (err) { setError(getErrorMessage(err)) } finally { setLoading(false) }
  }, [dateFrom, dateTo])

  useEffect(() => { void loadWeek() }, [loadWeek])

  function openRecord(lesson: Lesson) {
    setSelected(lesson)
    setRecordForm({ lesson_date: lesson.lesson_date, lesson_time: lesson.lesson_time, preparation_status: lesson.preparation_status, attendance_status: lesson.attendance_status, curriculum_progress: lesson.curriculum_progress ?? '', special_notes: lesson.special_notes ?? '', attitude_notes: lesson.attitude_notes ?? '' })
    setModalError(null)
  }

  async function replaceLesson(request: Promise<Lesson>) {
    setSubmitting(true)
    setModalError(null)
    try {
      const result = await request
      setLessons((current) => current.map((lesson) => lesson.id === result.id ? result : lesson))
      setSelected(result)
      return true
    } catch (err) { setModalError(getErrorMessage(err)); return false } finally { setSubmitting(false) }
  }

  async function saveRecord(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selected) return
    const payload = recordPayload(selected, recordForm)
    if (await replaceLesson(updateLesson(selected.id, payload))) setSelected(null)
  }

  async function completeSelected() {
    if (!selected) return
    setSubmitting(true)
    setModalError(null)
    try {
      const saved = await updateLesson(selected.id, {
        ...recordPayload(selected, recordForm),
      })
      const completed = await completeLesson(saved.id)
      setLessons((current) => current.map((lesson) => lesson.id === completed.id ? completed : lesson))
      setSelected(null)
    } catch (err) { setModalError(getErrorMessage(err)) } finally { setSubmitting(false) }
  }

  async function quickPreparation(lesson: Lesson) {
    const preparation_status: PreparationStatus = lesson.preparation_status === 'PREPARED' ? 'NOT_PREPARED' : 'PREPARED'
    setError(null)
    try {
      const updated = await updateLesson(lesson.id, { preparation_status })
      setLessons((current) => current.map((item) => item.id === updated.id ? updated : item))
    } catch (err) { setError(getErrorMessage(err)) }
  }

  async function createManual(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true); setModalError(null)
    try {
      const created = await createLesson(createForm)
      if (created.lesson_date >= dateFrom && created.lesson_date <= dateTo) setLessons((current) => [...current, created])
      setCreateOpen(false)
    } catch (err) { setModalError(getErrorMessage(err)) } finally { setSubmitting(false) }
  }

  async function removeManual() {
    if (!selected || !window.confirm('이 수동 수업을 삭제할까요?')) return
    setSubmitting(true); setModalError(null)
    try {
      await deleteLesson(selected.id)
      setLessons((current) => current.filter((lesson) => lesson.id !== selected.id))
      setSelected(null)
    } catch (err) { setModalError(getErrorMessage(err)) } finally { setSubmitting(false) }
  }

  function lessonRow(lesson: Lesson) {
    return <article className={`lesson-row lesson-${lesson.lesson_status.toLowerCase()}`} key={lesson.id}>
      <button className="lesson-row-main" type="button" onClick={() => openRecord(lesson)}>
        <strong>{studentsById.get(lesson.student_id)?.name ?? `학생 #${lesson.student_id}`}</strong><span>{lesson.lesson_date.slice(5)} {lesson.lesson_time.slice(0, 5)}</span><span>{lesson.curriculum_progress || '단계 미입력'}</span><span className="badge lesson-status-badge">{STATUS[lesson.lesson_status]}</span><span>{lesson.attendance_status === 'PRESENT' ? '출석' : lesson.attendance_status === 'ABSENT' ? '결석' : '출결 미입력'}</span>
      </button>
      <button className={lesson.preparation_status === 'PREPARED' ? 'lesson-prepared' : ''} type="button" disabled={lesson.lesson_status !== 'SCHEDULED'} onClick={() => void quickPreparation(lesson)}>{lesson.preparation_status === 'PREPARED' ? '준비 완료' : '미준비'}</button>
    </article>
  }

  return <>
    <header className="page-header lesson-header"><div><span className="eyebrow">Lesson Status</span><h1>수업 현황</h1><p>{dateFrom} ~ {dateTo}</p></div><div className="button-group"><button onClick={() => setWeekStart(addDays(weekStart, -7))}>이전 주</button><button onClick={() => setWeekStart(monday(new Date()))}>이번 주</button><button onClick={() => setWeekStart(addDays(weekStart, 7))}>다음 주</button></div></header>
    {error ? <p className="error-banner">{error}</p> : null}
    <section className="page-panel"><div className="section-heading lesson-toolbar"><div className="view-switch" role="group" aria-label="보기 방식"><button className={view === 'DATE' ? 'active' : ''} onClick={() => setView('DATE')}>날짜 보기</button><button className={view === 'STUDENT' ? 'active' : ''} onClick={() => setView('STUDENT')}>학생별 보기</button></div><div className="button-group"><button disabled={loading} onClick={() => void loadWeek()}>새로고침</button><button className="primary-button" onClick={() => { setCreateForm({ student_id: 0, lesson_date: dateFrom, lesson_time: '15:00' }); setModalError(null); setCreateOpen(true) }}>수동 수업 추가</button></div></div>
      {loading ? <p className="lesson-empty">수업을 불러오는 중입니다.</p> : lessons.length === 0 ? <p className="lesson-empty">선택한 주의 수업이 없습니다.</p> : view === 'DATE' ? <div className="lesson-week-grid">{DAYS.map((label, index) => { const date = dateString(addDays(weekStart, index)); const items = lessons.filter((lesson) => lesson.lesson_date === date); return <section className="lesson-group" key={date}><h2>{label}요일 <small>{date.slice(5)}</small></h2><div className="lesson-group-items">{items.length ? items.map(lessonRow) : <p className="muted">수업 없음</p>}</div></section> })}</div> : <div className="lesson-student-groups">{students.filter((student) => lessons.some((lesson) => lesson.student_id === student.id)).map((student) => <section className="lesson-group" key={student.id}><h2>{student.name}</h2><div className="lesson-group-items">{lessons.filter((lesson) => lesson.student_id === student.id).map(lessonRow)}</div></section>)}</div>}
    </section>
    {createOpen ? <LessonCreateModal value={createForm} students={students} error={modalError} submitting={submitting} onChange={setCreateForm} onSubmit={createManual} onClose={() => { if (!submitting) setCreateOpen(false) }} /> : null}
    {selected ? <LessonRecordModal lesson={selected} studentName={studentsById.get(selected.student_id)?.name ?? `학생 #${selected.student_id}`} value={recordForm} error={modalError} submitting={submitting} onChange={setRecordForm} onSubmit={saveRecord} onComplete={() => void completeSelected()} onCancelLesson={() => void replaceLesson(cancelLesson(selected.id)).then((ok) => { if (ok) setSelected(null) })} onDelete={() => void removeManual()} onClose={() => { if (!submitting) setSelected(null) }} /> : null}
  </>
}

function recordPayload(lesson: Lesson, value: LessonUpdatePayload): LessonUpdatePayload {
  const { lesson_date, lesson_time, ...record } = value
  const payload: LessonUpdatePayload = {
    ...record,
    curriculum_progress: emptyToNull(value.curriculum_progress),
    special_notes: emptyToNull(value.special_notes),
    attitude_notes: emptyToNull(value.attitude_notes),
  }
  if (lesson.schedule_id === null && lesson.lesson_status === 'SCHEDULED') {
    payload.lesson_date = lesson_date
    payload.lesson_time = lesson_time
  }
  return payload
}
