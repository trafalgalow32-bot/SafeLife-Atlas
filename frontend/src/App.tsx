// App.tsx — 라우트 테이블 (셸 레이아웃 아래 4개 경로)

import { Routes, Route, Navigate } from 'react-router-dom';
import { ShellLayout } from './shell/ShellLayout';
import HomePage from './pages/HomePage';
import DomainDetailPage from './pages/DomainDetailPage';
import ArchivePage from './pages/ArchivePage';
import AboutPage from './pages/AboutPage';

export default function App() {
  return (
    <Routes>
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
