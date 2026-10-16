// HomePage.tsx — 홈: 히어로 + 도메인 카드 그리드 + 자료실 미리보기 + 접근성 안내.

import { Link } from 'react-router-dom';
import { DOMAINS, type DomainMeta } from '../data/domains';
import { ARCHIVE_ITEMS } from '../data/archive';

function StatusBadge({ status }: { status: DomainMeta['status'] }) {
  if (status === 'live') {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 999, background: '#fef3c7', color: '#92400e' }}>
        <span style={{ width: 7, height: 7, borderRadius: 999, background: '#d97706', display: 'inline-block' }} />작동 중
      </span>
    );
  }
  if (status === 'soon') {
    return <span style={{ fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 999, background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0' }}>준비 중</span>;
  }
  return <span style={{ fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 999, background: '#fff', color: '#64748b', border: '1px dashed #cbd5e1' }}>도입 후보</span>;
}

function DomainCard({ domain }: { domain: DomainMeta }) {
  const inner = (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
        <StatusBadge status={domain.status} />
        {domain.nodeSummary && <span style={{ fontSize: 12, color: '#94a3b8' }}>{domain.nodeSummary}</span>}
      </div>
      <div style={{ fontSize: 20, fontWeight: 700 }}>{domain.name}</div>
      <p style={{ fontSize: 14, lineHeight: 1.5, color: '#475569', margin: 0 }}>{domain.shortDef}</p>
      <span style={{ fontSize: domain.status === 'live' ? 14 : 13, fontWeight: domain.status === 'live' ? 600 : 400, color: domain.status === 'live' ? '#b45309' : '#94a3b8', marginTop: 4 }}>
        {domain.status === 'live' ? '탐색하기 →' : domain.status === 'candidate' ? '로드맵 검토 중' : '곧 공개'}
      </span>
    </>
  );
  const baseStyle = { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 24, display: 'flex', flexDirection: 'column' as const, gap: 12, textDecoration: 'none', color: 'inherit' };
  if (domain.status === 'live') {
    return <Link to={`/domain/${domain.id}`} style={baseStyle}>{inner}</Link>;
  }
  return <div style={{ ...baseStyle, opacity: 0.72 }}>{inner}</div>;
}

export default function HomePage() {
  return (
    <>
      <section style={{ background: '#fff', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '56px 24px' }}>
          <div style={{ maxWidth: 760 }}>
            <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', color: '#b45309' }}>과학기술로 해결하는 사회문제 · 사회문제해결 R&amp;D</div>
            <h1 style={{ fontSize: 40, lineHeight: 1.2, fontWeight: 700, margin: '12px 0 0', letterSpacing: '-0.02em' }}>사회문제를 구조로 이해합니다</h1>
            <p style={{ fontSize: 17, lineHeight: 1.6, color: '#475569', margin: '16px 0 0' }}>
              원인과 영향이 어떻게 얽혀 있는지 그래프로 보고, 공공 R&amp;D 자료로 깊이 들어갑니다. 글자가 작고 복잡한 자료도 누구나 접근할 수 있게.
            </p>
          </div>
        </div>
      </section>

      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 24px 8px' }}>
        <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', color: '#64748b' }}>사회문제 탐색</div>
        <p style={{ color: '#64748b', fontSize: 14, margin: '6px 0 20px' }}>분야를 선택해 세부 구조로 들어가세요. 각 카드의 한 줄 정의는 상세 페이지에서 전체 정의로 이어집니다.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
          {DOMAINS.map((d) => <DomainCard key={d.id} domain={d} />)}
        </div>
      </section>

      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '36px 24px 8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12, gap: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', color: '#64748b' }}>자료실 · 최근 업데이트</div>
          <Link to="/archive" style={{ fontSize: 13, fontWeight: 600, color: '#b45309', textDecoration: 'none' }}>전체 보기 →</Link>
        </div>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '4px 0' }}>
          {ARCHIVE_ITEMS.slice(0, 3).map((item, i) => (
            <Link key={i} to="/archive" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, padding: '14px 20px', borderBottom: i < 2 ? '1px solid #f1f5f9' : 'none', textDecoration: 'none', color: 'inherit' }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 500, fontSize: 15 }}>{item.title}</div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{item.field} · 공공누리 {item.license}</div>
              </div>
              <span style={{ fontSize: 13, color: '#64748b', whiteSpace: 'nowrap' }}>{item.date}</span>
            </Link>
          ))}
        </div>
      </section>

      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 24px 48px' }}>
        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12, padding: '20px 24px', display: 'flex', gap: 16, alignItems: 'center' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#b45309" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flex: 'none' }}>
            <circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />
          </svg>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15 }}>그래프를 읽기 어렵나요?</div>
            <div style={{ fontSize: 14, color: '#78350f', marginTop: 2 }}>모든 인과 구조를 목록과 표로 제공하는 대체 뷰가 있습니다. 키보드만으로도 전부 탐색할 수 있어요.</div>
          </div>
        </div>
      </section>
    </>
  );
}
