import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import ChatDetailPage from './pages/ChatDetailPage';
import DocumentsPage from './pages/DocumentPage';
import ChatPage from './pages/ChatPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<ChatPage />} />
          <Route path="chat/:chatId" element={<ChatDetailPage />} />
          <Route path="documents" element={<DocumentsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
