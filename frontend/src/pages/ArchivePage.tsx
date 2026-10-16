// ArchivePage.tsx — 자료실: 과학기술 x 사회문제 공공자료 목록.

import { ARCHIVE_FIELDS, ARCHIVE_ITEMS } from '../data/archive';

export default function ArchivePage() {
  return (
    <>
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px 0' }}>
        <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', color: '#64748b' }}>자료실</div>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: '8px 0 0' }}>과학기술 × 사회문제 공공자료</h1>
        <p style={{ color: '#475569', fontSize: 15, margin: '10px 0 0', maxWidth: 720 }}>
          사회문제해결 R&amp;D와 연관된 정부·공공기관 자료집을 모았습니다. 모든 자료는 공공누리 라이선스 범위 안에서 출처를 밝혀 제공합니다.
        </p>
      </section>

      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '22px 24px 48px' }}>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {ARCHIVE_FIELDS.map((f, i) => (
              <button key={f} type="button" style={{
                padding: '7px 14px', fontSize: 13, fontWeight: 500, borderRadius: 999,
                border: '1px solid ' + (i === 0 ? '#0f172a' : '#e2e8f0'),
                background: i === 0 ? '#0f172a' : '#fff', color: i === 0 ? '#fff' : '#475569', cursor: 'pointer',
              }}>{f}</button>
            ))}
          </div>
          <div>
            <label htmlFor="archive-q" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>자료 검색</label>
            <input id="archive-q" type="search" placeholder="자료 제목·기관 검색"
              style={{ fontFamily: 'inherit', fontSize: 14, padding: '9px 14px', border: '1px solid #cbd5e1', borderRadius: 8, minWidth: 200, color: '#0f172a' }} />
          </div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ display: 'flex', gap: 16, padding: '12px 20px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>
            <div style={{ flex: 1, minWidth: 0 }}>자료 제목</div>
            <div style={{ width: 160 }}>분야 · 라이선스</div>
            <div style={{ width: 100 }}>발행기관</div>
            <div style={{ width: 72 }}>발행</div>
            <div style={{ width: 96, textAlign: 'right' }}>받기</div>
          </div>
          {ARCHIVE_ITEMS.map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'center', padding: '16px 20px', borderBottom: i < ARCHIVE_ITEMS.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
              <div style={{ flex: 1, minWidth: 0, fontWeight: 500, fontSize: 15 }}>{item.title}</div>
              <div style={{ width: 160, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 6, background: '#f1f5f9', color: '#475569' }}>{item.field}</span>
                <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 6, background: '#eff6ff', color: '#1d4ed8' }}>{item.license}</span>
              </div>
              <div style={{ width: 100, fontSize: 13, color: '#475569' }}>{item.org}</div>
              <div style={{ width: 72, fontSize: 13, color: '#64748b' }}>{item.date}</div>
              <div style={{ width: 96, textAlign: 'right' }}>
                <button type="button" aria-label={`${item.title} 내려받기`} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#b45309',
                  border: '1px solid #fcd34d', background: '#fffbeb', borderRadius: 8, padding: '7px 12px', cursor: 'pointer',
                }}>PDF ↓</button>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ fontSize: 12, color: '#94a3b8' }}>공공누리 제1유형: 출처표시 조건 하에 자유 이용 가능</div>
          <div style={{ display: 'flex', gap: 6 }}>
            <span style={{ padding: '6px 11px', border: '1px solid #0f172a', background: '#0f172a', color: '#fff', borderRadius: 7, fontSize: 13, fontWeight: 600 }}>1</span>
            <button type="button" style={{ padding: '6px 11px', border: '1px solid #e2e8f0', background: '#fff', borderRadius: 7, fontSize: 13, color: '#475569', cursor: 'pointer' }}>2</button>
            <button type="button" style={{ padding: '6px 11px', border: '1px solid #e2e8f0', background: '#fff', borderRadius: 7, fontSize: 13, color: '#475569', cursor: 'pointer' }}>3</button>
          </div>
        </div>
      </section>
    </>
  );
}
