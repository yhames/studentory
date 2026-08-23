import '../App.css'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router'

import { StudentDetailPage } from '../pages/StudentDetailPage'
import { StudentPage } from '../pages/StudentPage'
import { LessonPage } from '../pages/LessonPage'
import { AppLayout } from './AppLayout'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/students" replace />} />
          <Route path="/students" element={<StudentPage />} />
          <Route path="/students/:studentId" element={<StudentDetailPage />} />
          <Route path="/lessons" element={<LessonPage />} />
          <Route path="*" element={<Navigate to="/students" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
