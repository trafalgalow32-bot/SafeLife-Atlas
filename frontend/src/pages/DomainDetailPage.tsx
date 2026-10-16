// DomainDetailPage.tsx — 도메인 상세: 사회문제 정의 블록 + 탐색기.

import { useParams, Link } from 'react-router-dom';
import { getDomain } from '../data/domains';
import { Explorer } from '../components/Explorer';

export default function DomainDetailPage() {
  const { domainId } = useParams<{ domainId: string }>();
  const domain = domainId ? getDomain(domainId) : undefined;

  if (!domain) {
    return (
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 24px' }}>
        <p style={{ color: '#475569' }}>요청하신 사회문제를 찾을 수 없습니다.</p>
        <Link to="/" style={{ color: '#b45309', fontWeight: 600, textDecoration: 'none' }}>← 홈으로</Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 24px 48px' }}>
      <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 16 }}>
        <Link to="/" style={{ color: '#94a3b8', textDecoration: 'none' }}>홈</Link> / 사회문제 탐색 / <span style={{ color: '#475569' }}>{domain.name}</span>
      </div>

      <section style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 32 }}>
        <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', color: '#64748b' }}>사회문제 정의</div>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: '14px 0 0' }}>{domain.name}</h1>
        <p style={{ fontSize: 16, lineHeight: 1.7, color: '#334155', margin: '12px 0 0', maxWidth: 780 }}>{domain.definition}</p>

        {domain.metrics && domain.metrics.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginTop: 24 }}>
            {domain.metrics.map((m) => (
              <div key={m.label} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 14 }}>
                <div style={{ fontSize: 12, color: '#64748b' }}>{m.label}</div>
                <div style={{ fontSize: 22, fontWeight: 700, marginTop: 4 }}>{m.value}</div>
              </div>
            ))}
          </div>
        )}

        {domain.sourceNote && <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 16 }}>{domain.sourceNote}</div>}
      </section>

      {domain.status === 'live' ? (
        <div style={{ marginTop: 24 }}>
          <Explorer domainId={domain.id} />
          <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 12, lineHeight: 1.6 }}>
            인과 엣지(화살표)는 보고서의 원인·영향 분류 체계에 근거한 분석자 추론 레이어입니다.
          </div>
        </div>
      ) : (
        <div style={{ marginTop: 24, background: '#fff', border: '1px dashed #cbd5e1', borderRadius: 12, padding: '48px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#475569' }}>이 사회문제의 구조 탐색기는 준비 중입니다.</div>
          <div style={{ fontSize: 14, color: '#94a3b8', marginTop: 6 }}>현재는 보이스피싱 도메인이 공개되어 있습니다.</div>
          <Link to="/domain/voice-phishing" style={{ display: 'inline-block', marginTop: 16, color: '#b45309', fontWeight: 600, textDecoration: 'none' }}>보이스피싱 탐색기 보기 →</Link>
        </div>
      )}
    </div>
  );
}
