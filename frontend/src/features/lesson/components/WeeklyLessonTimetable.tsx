import { useState } from 'react'

import type { Lesson } from '../../../types/lessons'
import type { Student, StudentGender, StudentStage } from '../../../types/students'

const DAYS = ['월요일', '화요일', '수요일', '목요일', '금요일']
const DEFAULT_START_MINUTES = 13 * 60
const DEFAULT_LAST_SLOT_MINUTES = 23 * 60

interface Props {
  weekStart: Date
  lessons: Lesson[]
  studentsById: Map<number, Student>
  onOpenLesson: (lesson: Lesson) => void
}

export function WeeklyLessonTimetable({ weekStart, lessons, studentsById, onOpenLesson }: Props) {
  const dates = DAYS.map((label, index) => ({ label, date: dateString(addDays(weekStart, index)) }))
  const displayedDates = new Set(dates.map(({ date }) => date))
  const displayedLessons = lessons.filter((lesson) => displayedDates.has(lesson.lesson_date))
  const [selectedDay, setSelectedDay] = useState(() => selectedDayIndex(dates))
  const slots = createTimeSlots(displayedLessons)
  const lessonsByCell = groupLessonsByCell(displayedLessons)
  const outsideLessons = displayedLessons.filter((lesson) => !slotForLesson(lesson))

  return <>
    {lessons.length === 0 ? <p className="lesson-empty timetable-empty">선택한 주의 수업이 없습니다. 빈 시간을 확인하거나 수업을 추가할 수 있어요.</p> : null}
    <div className="weekly-timetable desktop-timetable" tabIndex={0} aria-label="주간 수업 시간표, 가로로 스크롤할 수 있습니다">
      <table>
        <thead><tr><th className="timetable-corner" scope="col">시간</th>{dates.map(({ label, date }) => <th scope="col" key={date}><span>{label}</span><small>{date.slice(5)}</small></th>)}</tr></thead>
        <tbody>{slots.map((slot) => <tr key={slot}>
          <th scope="row">{slot}</th>
          {dates.map(({ label, date }) => <TimetableCell key={`${date}-${slot}`} label={label} date={date} slot={slot} lessons={lessonsByCell.get(`${date}|${slot}`) ?? []} studentsById={studentsById} onOpenLesson={onOpenLesson} />)}
        </tr>)}</tbody>
      </table>
    </div>

    <div className="mobile-timetable">
      <div className="timetable-day-switch" role="group" aria-label="표시할 요일">
        {dates.map(({ label, date }, index) => <button type="button" key={date} className={selectedDay === index ? 'active' : ''} aria-pressed={selectedDay === index} onClick={() => setSelectedDay(index)}><span>{label.slice(0, 1)}</span><small>{date.slice(8)}</small></button>)}
      </div>
      <div className="mobile-day-heading"><strong>{dates[selectedDay].label}</strong><span>{dates[selectedDay].date.slice(5)}</span></div>
      <div className="weekly-timetable mobile-timetable-scroll" tabIndex={0} aria-label={`${dates[selectedDay].label} 수업 시간표`}>
        <table><tbody>{slots.map((slot) => <tr key={slot}>
          <th scope="row">{slot}</th>
          <TimetableCell label={dates[selectedDay].label} date={dates[selectedDay].date} slot={slot} lessons={lessonsByCell.get(`${dates[selectedDay].date}|${slot}`) ?? []} studentsById={studentsById} onOpenLesson={onOpenLesson} />
        </tr>)}</tbody></table>
      </div>
    </div>

    {outsideLessons.length > 0 ? <section className="outside-lessons" aria-labelledby="outside-lessons-title">
      <div><span className="section-kicker">시간표 밖</span><h3 id="outside-lessons-title">표시 범위 밖 수업</h3></div>
      <div className="outside-lesson-list">{outsideLessons.map((lesson) => <LessonTimetableCard key={lesson.id} lesson={lesson} student={studentsById.get(lesson.student_id)} dayLabel={DAYS[dateIndex(dates, lesson.lesson_date)] ?? '선택 주'} onOpen={() => onOpenLesson(lesson)} />)}</div>
    </section> : null}
  </>
}

interface CellProps {
  label: string
  date: string
  slot: string
  lessons: Lesson[]
  studentsById: Map<number, Student>
  onOpenLesson: (lesson: Lesson) => void
}

function TimetableCell({ label, date, slot, lessons, studentsById, onOpenLesson }: CellProps) {
  return <td className={lessons.length ? 'has-lessons' : ''} data-slot={`${date}-${slot}`}>
    {lessons.map((lesson) => <LessonTimetableCard key={lesson.id} lesson={lesson} student={studentsById.get(lesson.student_id)} dayLabel={label} onOpen={() => onOpenLesson(lesson)} />)}
  </td>
}

interface CardProps {
  lesson: Lesson
  student?: Student
  dayLabel: string
  onOpen: () => void
}

function LessonTimetableCard({ lesson, student, dayLabel, onOpen }: CardProps) {
  const name = student?.name ?? `학생 #${lesson.student_id}`
  const time = lesson.lesson_time.slice(0, 5)
  return <button type="button" className={`lesson-timetable-card lesson-${lesson.lesson_status.toLowerCase()}`} aria-label={`${name} ${dayLabel} ${lesson.lesson_date.slice(5)} ${time} 수업 상세 열기`} onClick={onOpen}>
    <span className="lesson-card-identity">
      <span className={`gender-mark gender-${student?.gender?.toLowerCase() ?? 'unknown'}`}>{genderLabel(student?.gender)}</span>
      <strong>{name}</strong>
      <span className="student-mini-badges"><span>{stageLabel(student?.stage)}</span><span>{ageLabel(student?.birth_year)}</span></span>
    </span>
    <span className="lesson-card-statuses">
      <span>{lessonStatusLabel(lesson)}</span>
      <span>{lesson.preparation_status === 'PREPARED' ? '준비 완료' : '준비 필요'}</span>
      <span>{attendanceLabel(lesson)}</span>
    </span>
  </button>
}

function createTimeSlots(lessons: Lesson[]): string[] {
  const lessonMinutes = lessons.map(lessonMinutesValue).filter((minutes): minutes is number => minutes !== null)
  const start = lessonMinutes.length ? Math.floor(Math.min(...lessonMinutes) / 10) * 10 : DEFAULT_START_MINUTES
  const end = lessonMinutes.length ? Math.floor(Math.max(...lessonMinutes) / 10) * 10 : DEFAULT_LAST_SLOT_MINUTES
  const slots: string[] = []
  for (let minutes = start; minutes <= end; minutes += 10) slots.push(formatMinutes(minutes))
  return slots
}

function groupLessonsByCell(lessons: Lesson[]): Map<string, Lesson[]> {
  const grouped = new Map<string, Lesson[]>()
  lessons.forEach((lesson) => {
    const slot = slotForLesson(lesson)
    if (!slot) return
    const key = `${lesson.lesson_date}|${slot}`
    grouped.set(key, [...(grouped.get(key) ?? []), lesson])
  })
  return grouped
}

function slotForLesson(lesson: Lesson): string | null {
  const total = lessonMinutesValue(lesson)
  return total === null ? null : formatMinutes(Math.floor(total / 10) * 10)
}

function lessonMinutesValue(lesson: Lesson): number | null {
  const [hours, minutes] = lesson.lesson_time.split(':').map(Number)
  const total = hours * 60 + minutes
  if (!Number.isFinite(total) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null
  return total
}

function formatMinutes(minutes: number): string {
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`
}

function lessonStatusLabel(lesson: Lesson): string {
  if (lesson.lesson_status === 'COMPLETED') return '✓ 수업 완료'
  if (lesson.lesson_status === 'CANCELED') return '수업 취소'
  return '수업 예정'
}

function attendanceLabel(lesson: Lesson): string {
  if (lesson.attendance_status === 'PRESENT') return '출석'
  if (lesson.attendance_status === 'ABSENT') return '결석'
  return '출결 미입력'
}

function genderLabel(gender?: StudentGender): string {
  if (gender === 'MALE') return '남'
  if (gender === 'FEMALE') return '여'
  return '성별 미입력'
}

function stageLabel(stage?: StudentStage): string {
  return stage ? `${Number(stage.slice(-1))}단계` : '단계 미입력'
}

function ageLabel(birthYear?: number): string {
  return birthYear ? `약 ${new Date().getFullYear() - birthYear}세` : '나이 미입력'
}

function selectedDayIndex(dates: Array<{ date: string }>): number {
  const today = dateString(new Date())
  const index = dates.findIndex(({ date }) => date === today)
  return index >= 0 ? index : 0
}

function dateIndex(dates: Array<{ date: string }>, value: string): number {
  return dates.findIndex(({ date }) => date === value)
}

function dateString(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}
