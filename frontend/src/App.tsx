import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css'
import WritingSession from './pages/WritingSession'

function App() {

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/projects/new" replace />} />
      <Route path="/projects/:projectId/paragraphs" element={<WritingSession />} />
      {/* Route for creating/viewing empty state? For now, redirect to a generic page or handle in WritingSession */}
      <Route path="/projects" element={<WritingSession />} />
    </Routes>
  )
}

export default App
