// AboutPage.tsx — 소개: 제작 의도 · 접근성 명분 · 기술 스택 · 데이터 라이선스.

export default function AboutPage() {
  const h2 = { fontSize: 18, fontWeight: 700, margin: '32px 0 8px' } as const;
  const p = { fontSize: 15, lineHeight: 1.7, color: '#334155', margin: 0 } as const;
  return (
    <section style={{ maxWidth: 1200, margin: '0 auto', padding: '44px 24px 48px' }}>
      <div style={{ maxWidth: 780 }}>
        <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', color: '#b45309' }}>소개</div>
        <h1 style={{ fontSize: 30, fontWeight: 700, margin: '12px 0 0', letterSpacing: '-0.02em' }}>왜 이 플랫폼을 만들었나</h1>
        <p style={{ ...p, marginTop: 16, fontSize: 16 }}>
          사회문제해결 R&amp;D 현장에서 반복해서 본 문제는, 좋은 연구가 시민의 언어로 닿지 못한다는 것이었습니다. 보고서는 두껍고, 자료는 흩어져 있고, 화면은 접근성을 고려하지 않습니다. SafeLife-Atlas는 하나의 사회문제를 원인과 영향의 구조로 보여주고, 관련 공공자료로 바로 이어주는 작은 플랫폼입니다.
        </p>

        <h2 style={h2}>무엇을 하나</h2>
        <p style={p}>사회문제별로 세부문제(노드)와 인과관계(엣지)를 그래프로 그리고, 시급성·과기 기대 같은 축으로 분석 패널을 함께 제공합니다. 정의 → 구조 → 자료 순서로 깊이를 더합니다.</p>

        <h2 style={h2}>접근성을 명분이자 기능으로</h2>
        <p style={p}>그래프를 읽기 어려운 사용자를 위해 같은 데이터를 목록·표로 보는 대체 뷰를 제공하고, 키보드만으로 전체를 탐색할 수 있게 했습니다. 고대비 색상과 명도 대비 기준(WCAG 2.1 AA)을 지킵니다.</p>

        <h2 style={h2}>기술 스택</h2>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
          {['React', 'React Flow', 'FastAPI (Python)', 'Render 배포'].map((t) => (
            <span key={t} style={{ fontSize: 13, fontWeight: 600, padding: '6px 12px', borderRadius: 999, background: '#fff', border: '1px solid #e2e8f0', color: '#475569' }}>{t}</span>
          ))}
        </div>

        <h2 style={h2}>데이터와 라이선스</h2>
        <p style={p}>한국과학기술기획평가원(KISTEP) 사회문제해결 R&amp;D 자료를 기반으로, 공공데이터포털 오픈API와 공공누리 유형1 자료, 빅카인즈 언론 키워드를 활용합니다. 인과 엣지는 보고서 분류 체계에 근거한 분석자 추론 레이어임을 명시합니다.</p>

        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12, padding: '18px 22px', marginTop: 32 }}>
          <div style={{ fontWeight: 600, fontSize: 14, color: '#92400e' }}>이 페이지는 소개 가이드북의 축약판입니다</div>
          <div style={{ fontSize: 14, color: '#78350f', lineHeight: 1.6, marginTop: 4 }}>베타 테스터·면접용 상세 가이드북(제작 의도·설계 결정·기술 선택 근거)은 반응형 웹 가이드북으로 별도 제작 예정입니다.</div>
        </div>
      </div>
    </section>
  );
}
