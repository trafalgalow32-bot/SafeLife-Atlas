// App.tsx — 라우트 테이블 (셸 레이아웃 아래 공개 4경로 + 셸 밖 관리자 경로)

import { Routes, Route, Navigate } from 'react-router-dom';
import { ShellLayout } from './shell/ShellLayout';
import HomePage from './pages/HomePage';
import DomainDetailPage from './pages/DomainDetailPage';
import ArchivePage from './pages/ArchivePage';
import AboutPage from './pages/AboutPage';
import AdminPage from './pages/AdminPage';

export default function App() {
  return (
    <Routes>
      {/* 관리자 화면: 공개 셸(네비·푸터) 밖의 독립 라우트 — slice 3 */}
      <Route path="/admin" element={<AdminPage />} />
      <Route element={<ShellLayout />}>
        <Route index element={<HomePage />} />
        <Route path="domain/:domainId" element={<DomainDetailPage />} />
        <Route path="archive" element={<ArchivePage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
