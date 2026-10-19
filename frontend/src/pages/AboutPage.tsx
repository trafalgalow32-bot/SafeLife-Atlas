// AboutPage.tsx — 소개 가이드북: 제작 의도 · 설계 결정 · 기술 선택 근거 · 데이터 라이선스.
// 용도 2개를 하나로: 베타 테스터용 안내 + 면접용 소개.

type Decision = { tag: string; title: string; problem: string; choice: string };
type Stack = { name: string; why: string };

const decisions: Decision[] = [
  {
    tag: '방법론',
    title: '하나를 끝까지, 항상 배포 상태로',
    problem: '여러 도메인을 넓게 벌이면 "파다 만" 결과물이 되기 쉽다.',
    choice:
      '보이스피싱 한 도메인을 정의 → 구조(그래프) → 자료 → 배포까지 수직으로 끝냈다. 북극성은 "배포 링크 하나로 바로 시연".',
  },
  {
    tag: '접근성',
    title: '접근성을 명분이자 기능으로',
    problem: '그래프는 스크린리더로 거의 읽히지 않고, 공공 화면은 글자가 작고 복잡하다.',
    choice:
      '같은 데이터를 목록·표로 보는 대체 뷰와 키보드 전체 탐색을 함께 제공한다. WCAG 2.1 AA 대비 기준 준수, Lighthouse 접근성 100.',
  },
  {
    tag: '정직성',
    title: '인과 엣지 = 분석자 추론 레이어',
    problem: '노드 사이 화살표(인과)는 원본 보고서에 그려져 있던 것이 아니다.',
    choice:
      '보고서의 원인/영향 분류 체계에 근거해 분석자가 추론한 레이어임을 화면과 문서에 명시한다. 출처를 과장하지 않는 것이 신뢰의 근거다.',
  },
  {
    tag: '안정성',
    title: '끊기지 않는 공개 화면',
    problem: '무료 호스팅은 DB가 만료되거나 서비스가 잠들면 공개 화면이 깨질 수 있다.',
    choice:
      '자료실을 백엔드 API로 서빙하되, 응답이 비거나 실패하면 번들에 포함된 자료로 자동 폴백한다. 어떤 경우에도 방문자 화면은 멈추지 않는다.',
  },
];

const stack: Stack[] = [
  { name: 'React + React Flow', why: '트리·그래프 표현에 특화. "요구사항을 쓰던 사람이 화면까지 구현한다"는 서사.' },
  { name: 'FastAPI (Python)', why: '비동기 + 자동 검증 + Swagger 문서. 향후 RAG·데이터 파이프라인을 같은 파이썬 생태계로 확장.' },
  { name: 'Render (render.yaml)', why: '블루프린트 한 파일로 프론트·백엔드 자동 재배포. 설정 자체가 IaC 포트폴리오 가점.' },
];

const roadmap: string[] = [
  '자료실을 관리자 검토 → 발행 게시판으로 확장 (DB 계층 추가)',
  '사회문제 도메인 확대 (사이버범죄·전력수급 등)',
  '정책 초점과 언론 보도의 간극을 비교하는 분석 레이어 (빅카인즈)',
];

export default function AboutPage() {
  const eyebrow = { fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', color: '#b45309' } as const;
  const h2 = { fontSize: 20, fontWeight: 700, margin: '0 0 6px', color: '#0f172a', letterSpacing: '-0.01em' } as const;
  const lead = { fontSize: 15, lineHeight: 1.7, color: '#475569', margin: '0 0 20px', maxWidth: 720 } as const;
  const p = { fontSize: 15, lineHeight: 1.7, color: '#334155', margin: 0 } as const;
  const card = { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '20px 22px' } as const;
  const grid = (min: number) =>
    ({ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(${min}px, 1fr))`, gap: 16, marginTop: 16 } as const);

  return (
    <section style={{ maxWidth: 1200, margin: '0 auto', padding: '44px 24px 56px' }}>
      {/* 히어로 */}
      <div style={{ maxWidth: 780 }}>
        <div style={eyebrow}>소개 · 가이드북</div>
        <h1 style={{ fontSize: 32, fontWeight: 700, margin: '12px 0 0', letterSpacing: '-0.02em', color: '#0f172a' }}>
          과학기술로 푸는 사회문제, 시민의 언어로
        </h1>
        <p style={{ ...lead, fontSize: 17, color: '#334155', marginTop: 16 }}>
          사회문제해결 R&amp;D 현장에서 반복해서 본 문제는, 좋은 연구가 시민의 언어로 닿지 못한다는 것이었습니다. 보고서는 두껍고, 자료는 흩어져 있고, 화면은 접근성을 고려하지 않습니다. SafeLife-Atlas는 하나의 사회문제를 원인과 영향의 구조로 보여주고, 관련 공공자료로 바로 이어주는 작은 플랫폼입니다.
        </p>
      </div>

      {/* 한눈에 보기 */}
      <div style={grid(220)} aria-label="한눈에 보기">
        {[
          { k: '무엇', v: '사회문제의 세부구조(노드)와 인과관계(엣지)를 그래프로 탐색하는 플랫폼' },
          { k: '누구를 위해', v: '복잡한 보고서 대신 구조를 보고 싶은 일반 시민·청년' },
          { k: '어떻게', v: '정의 → 구조 → 자료 순서로 깊이를 더하는 하나의 흐름' },
        ].map((item) => (
          <div key={item.k} style={card}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#b45309', marginBottom: 6 }}>{item.k}</div>
            <div style={{ fontSize: 14, lineHeight: 1.6, color: '#334155' }}>{item.v}</div>
          </div>
        ))}
      </div>

      {/* 무엇을 하나 */}
      <div style={{ marginTop: 48 }}>
        <h2 style={h2}>무엇을 하나</h2>
        <p style={lead}>세 단계로 깊이를 더합니다. 들어오자마자 그래프를 던지지 않고, 문제가 무엇인지부터 정의합니다.</p>
        <div style={grid(220)}>
          {[
            { n: '01', t: '정의', d: '사회문제가 무엇인지 먼저 읽는다. 열람 전 반드시 거치는 단계.' },
            { n: '02', t: '구조', d: '세부문제와 인과관계를 그래프로. 시급성·과기 기대 축의 분석 패널 포함.' },
            { n: '03', t: '자료', d: '관련 공공자료(공공누리 원문)로 바로 연결한다.' },
          ].map((s) => (
            <div key={s.n} style={card}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8' }}>{s.n}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '4px 0 6px' }}>{s.t}</div>
              <div style={{ fontSize: 14, lineHeight: 1.6, color: '#475569' }}>{s.d}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 왜 이렇게 만들었나 */}
      <div style={{ marginTop: 48 }}>
        <h2 style={h2}>왜 이렇게 만들었나</h2>
        <p style={lead}>기능 목록이 아니라, 선택과 그 근거로 설명합니다. 각 결정은 "문제 → 선택"의 쌍입니다.</p>
        <div style={grid(300)}>
          {decisions.map((d) => (
            <div key={d.title} style={card}>
              <span
                style={{
                  display: 'inline-block',
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  color: '#b45309',
                  background: '#fffbeb',
                  border: '1px solid #fde68a',
                  borderRadius: 999,
                  padding: '3px 10px',
                  marginBottom: 10,
                }}
              >
                {d.tag}
              </span>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 10px' }}>{d.title}</h3>
              <p style={{ fontSize: 13.5, lineHeight: 1.6, color: '#64748b', margin: '0 0 8px' }}>
                <strong style={{ color: '#475569' }}>문제 · </strong>
                {d.problem}
              </p>
              <p style={{ fontSize: 14, lineHeight: 1.65, color: '#334155', margin: 0 }}>
                <strong style={{ color: '#b45309' }}>선택 · </strong>
                {d.choice}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 기술 스택 */}
      <div style={{ marginTop: 48 }}>
        <h2 style={h2}>기술 스택과 선택 이유</h2>
        <p style={lead}>무엇을 썼는지보다, 왜 그걸 골랐는지를 남깁니다.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16, maxWidth: 860 }}>
          {stack.map((s) => (
            <div key={s.name} style={{ ...card, display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'baseline' }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', minWidth: 180 }}>{s.name}</div>
              <div style={{ fontSize: 14, lineHeight: 1.6, color: '#475569', flex: 1 }}>{s.why}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 데이터와 라이선스 */}
      <div style={{ marginTop: 48, maxWidth: 860 }}>
        <h2 style={h2}>데이터와 라이선스</h2>
        <p style={{ ...p, marginTop: 8 }}>
          한국과학기술기획평가원(KISTEP) 사회문제해결 R&amp;D 자료를 기반으로, 공공데이터포털 오픈API와 공공누리 유형1 자료, 빅카인즈 언론 키워드를 활용합니다. 공공누리 규율을 지켜, 집계 가능한 것과 전재가 금지된 것을 구분하고, 원문은 재호스팅하지 않고 원본 URL로 연결합니다.
        </p>
      </div>

      {/* 정직성 노트 */}
      <div
        style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: 14,
          padding: '20px 24px',
          marginTop: 32,
          maxWidth: 860,
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a', marginBottom: 8 }}>정직하게 밝혀두는 것</div>
        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13.5, lineHeight: 1.7, color: '#475569' }}>
          <li>인과 엣지는 원본에 그려진 것이 아니라 분류 체계에 근거한 분석자 추론 레이어입니다.</li>
          <li>근거 자료 상당수가 2023년 기준이라, 현재형으로 단정하기보다 분석의 축으로 다룹니다.</li>
          <li>성능 지표는 측정 환경에 따라 달라질 수 있어, 전달 경로와 무관한 접근성 중심으로만 인용합니다.</li>
        </ul>
      </div>

      {/* 앞으로 */}
      <div style={{ marginTop: 48, maxWidth: 860 }}>
        <h2 style={h2}>앞으로</h2>
        <ul style={{ margin: '12px 0 0', paddingLeft: 18, fontSize: 14.5, lineHeight: 1.8, color: '#334155' }}>
          {roadmap.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </div>

      {/* 만든 배경 credit */}
      <div style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid #e2e8f0', maxWidth: 860 }}>
        <p style={{ fontSize: 13.5, lineHeight: 1.7, color: '#64748b', margin: 0 }}>
          이 플랫폼은 사회문제해결 R&amp;D 현장의 실무 경험에서 출발했습니다. 자료의 출처와 분류 체계는 그 경험에 기반합니다. 조직을 홍보하려는 것이 아니라, 자료의 근거를 밝히기 위한 credit입니다.
        </p>
      </div>
    </section>
  );
}
