// ArchivePage.tsx — 자료실: 과학기술 x 사회문제 공공자료 목록 (필터·검색·페이지네이션 배선).

import { useMemo, useState } from 'react';
import { ARCHIVE_ITEMS } from '../data/archive';

const PAGE_SIZE = 4;

export default function ArchivePage() {
  const [field, setField] = useState('전체');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);

  // 분야 칩은 실제 데이터에서 파생 → 결과 0인 '죽은 칩'이 생기지 않음.
  const fields = useMemo(
    () => ['전체', ...Array.from(new Set(ARCHIVE_ITEMS.map((i) => i.field)))],
    [],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ARCHIVE_ITEMS.filter((item) => {
      const fieldOk = field === '전체' || item.field === field;
      const queryOk =
        q === '' ||
        item.title.toLowerCase().includes(q) ||
        item.org.toLowerCase().includes(q);
      return fieldOk && queryOk;
    });
  }, [field, query]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

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
          <div role="group" aria-label="분야 필터" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {fields.map((f) => {
              const active = f === field;
              return (
                <button
                  key={f}
                  type="button"
                  aria-pressed={active}
                  onClick={() => { setField(f); setPage(1); }}
                  style={{
                    padding: '7px 14px', fontSize: 13, fontWeight: active ? 600 : 500, borderRadius: 999,
                    border: '1px solid ' + (active ? '#0f172a' : '#e2e8f0'),
                    background: active ? '#0f172a' : '#fff', color: active ? '#fff' : '#475569', cursor: 'pointer',
                  }}
                >
                  {f}
                </button>
              );
            })}
          </div>
          <div>
            <label htmlFor="archive-q" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>자료 검색</label>
            <input
              id="archive-q"
              type="search"
              placeholder="자료 제목·기관 검색"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1); }}
              style={{ fontFamily: 'inherit', fontSize: 14, padding: '9px 14px', border: '1px solid #cbd5e1', borderRadius: 8, minWidth: 200, color: '#0f172a' }}
            />
          </div>
        </div>

        <div aria-live="polite" style={{ fontSize: 13, color: '#475569', marginBottom: 10 }}>
          총 {filtered.length}건{field !== '전체' ? ` · ${field}` : ''}{query.trim() ? ` · "${query.trim()}" 검색` : ''}
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ display: 'flex', gap: 16, padding: '12px 20px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontSize: 12, fontWeight: 600, color: '#64748b' }}>
            <div style={{ flex: 1, minWidth: 0 }}>자료 제목</div>
            <div style={{ width: 160 }}>분야 · 라이선스</div>
            <div style={{ width: 100 }}>발행기관</div>
            <div style={{ width: 72 }}>발행</div>
            <div style={{ width: 96, textAlign: 'right' }}>받기</div>
          </div>

          {pageItems.length === 0 ? (
            <div style={{ padding: '48px 20px', textAlign: 'center', color: '#64748b', fontSize: 14 }}>
              조건에 맞는 자료가 없습니다. 분야나 검색어를 바꿔 보세요.
            </div>
          ) : (
            pageItems.map((item, i) => (
              <div key={item.title} style={{ display: 'flex', gap: 16, alignItems: 'center', padding: '16px 20px', borderBottom: i < pageItems.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                <div style={{ flex: 1, minWidth: 0, fontWeight: 500, fontSize: 15 }}>{item.title}</div>
                <div style={{ width: 160, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 6, background: '#f1f5f9', color: '#475569' }}>{item.field}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 6, background: '#eff6ff', color: '#1d4ed8' }}>{item.license}</span>
                </div>
                <div style={{ width: 100, fontSize: 13, color: '#475569' }}>{item.org}</div>
                <div style={{ width: 72, fontSize: 13, color: '#64748b' }}>{item.date}</div>
                <div style={{ width: 96, textAlign: 'right' }}>
                  {item.url ? (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`${item.title} 원문 내려받기 (새 창)`}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#b45309', border: '1px solid #fcd34d', background: '#fffbeb', borderRadius: 8, padding: '7px 12px', textDecoration: 'none' }}
                    >
                      PDF ↓
                    </a>
                  ) : (
                    <span style={{ fontSize: 12, color: '#64748b' }}>링크 준비 중</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ fontSize: 12, color: '#64748b' }}>공공누리 제1유형: 출처표시 조건 하에 자유 이용 가능</div>
          {pageCount > 1 && (
            <nav aria-label="자료실 페이지" style={{ display: 'flex', gap: 6 }}>
              {Array.from({ length: pageCount }, (_, idx) => idx + 1).map((p) => {
                const current = p === safePage;
                return (
                  <button
                    key={p}
                    type="button"
                    aria-current={current ? 'page' : undefined}
                    onClick={() => setPage(p)}
                    style={{
                      padding: '6px 11px', borderRadius: 7, fontSize: 13, fontWeight: current ? 600 : 400, cursor: 'pointer',
                      border: '1px solid ' + (current ? '#0f172a' : '#e2e8f0'),
                      background: current ? '#0f172a' : '#fff', color: current ? '#fff' : '#475569',
                    }}
                  >
                    {p}
                  </button>
                );
              })}
            </nav>
          )}
        </div>
      </section>
    </>
  );
}
