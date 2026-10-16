// ShellLayout.tsx — 플랫폼 공통 셸 (상단 네비 + 푸터 + Outlet)

import { NavLink, Outlet, Link } from 'react-router-dom';

const navItems = [
  { to: '/', label: '홈', end: true },
  { to: '/domain/voice-phishing', label: '사회문제 탐색', end: false },
  { to: '/archive', label: '자료실', end: false },
  { to: '/about', label: '소개', end: false },
];

export function ShellLayout() {
  return (
    <div
      style={{
        minHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: '#f8fafc',
        fontFamily: "system-ui, 'Segoe UI', Roboto, sans-serif",
        color: '#0f172a',
      }}
    >
      <header style={{ background: '#0f172a', color: '#fff' }}>
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding: '0 24px',
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 24,
            flexWrap: 'wrap',
          }}
        >
          <Link to="/" style={{ textDecoration: 'none', color: '#fff', display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
            <strong style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.01em' }}>SafeLife-Atlas</strong>
            <span style={{ fontSize: 11, color: '#94a3b8' }}>사회문제 세부구조 탐색 플랫폼</span>
          </Link>
          <nav aria-label="주요 메뉴" style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                style={({ isActive }) => ({
                  padding: '8px 12px',
                  fontSize: 14,
                  borderRadius: 6,
                  fontWeight: isActive ? 600 : 500,
                  textDecoration: 'none',
                  color: isActive ? '#fff' : '#cbd5e1',
                  boxShadow: isActive ? 'inset 0 -2px 0 #f59e0b' : 'none',
                })}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      <footer style={{ background: '#0f172a', color: '#94a3b8', fontSize: 12 }}>
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding: '20px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          <span>SafeLife-Atlas · 포트폴리오 프로젝트</span>
          <span>데이터: KISTEP 사회문제해결 R&amp;D · 공공누리</span>
        </div>
      </footer>
    </div>
  );
}
