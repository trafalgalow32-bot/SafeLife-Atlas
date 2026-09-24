// App.tsx

import { useEffect, useState } from 'react';
import { fetchDomainGraph } from './api/client';
import type { DomainGraphResponse, ProblemNodeData } from './types/graph';
import { GraphCanvas } from './components/GraphCanvas';
import { AccessibleView } from './components/AccessibleView';

export default function App() {
  const [graphData, setGraphData] = useState<DomainGraphResponse | null>(null);
  const [selectedNode, setSelectedNode] = useState<ProblemNodeData | null>(null);
  const [viewMode, setViewMode] = useState<'graph' | 'accessible'>('graph');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDomainGraph('voice-phishing')
      .then(setGraphData)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh', margin: 0, overflow: 'hidden' }}>
      {/* 헤더 */}
      <header
        style={{
          padding: '12px 24px',
          background: '#0f172a',
          color: '#fff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 10,
        }}
      >
        <div>
          <h1 style={{ fontSize: '18px', margin: 0, fontWeight: 700 }}>SafeLife-Atlas : 사회문제 세부구조 탐색기</h1>
          <span style={{ fontSize: '13px', color: '#94a3b8' }}>
            {graphData ? `${graphData.domain_name} (총 ${graphData.total_nodes}개 노드)` : '데이터 로딩 중...'}
          </span>
        </div>

        {/* 뷰 모드 전환 토글 버튼 (WCAG 2.1 AA 준수 핵심) */}
        <div role="group" aria-label="화면 표시 방식 선택" style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setViewMode('graph')}
            aria-pressed={viewMode === 'graph'}
            style={{
              padding: '6px 14px',
              fontSize: '13px',
              fontWeight: 600,
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              background: viewMode === 'graph' ? '#2563eb' : '#334155',
              color: '#fff',
            }}
          >
            노드 그래프 뷰
          </button>
          <button
            onClick={() => setViewMode('accessible')}
            aria-pressed={viewMode === 'accessible'}
            style={{
              padding: '6px 14px',
              fontSize: '13px',
              fontWeight: 600,
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              background: viewMode === 'accessible' ? '#2563eb' : '#334155',
              color: '#fff',
            }}
          >
            접근성 목록 뷰 (텍스트)
          </button>
        </div>
      </header>

      {/* 본문 영역 */}
      <div style={{ display: 'flex', flex: 1, position: 'relative', width: '100%', height: 'calc(100vh - 57px)', overflow: 'hidden' }}>
        {error && (
          <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 50, background: '#fee2e2', color: '#dc2626', padding: '10px 16px', borderRadius: '6px' }}>
            {error} (FastAPI 서버 상태 확인 필요)
          </div>
        )}

        {/* 뷰 모드에 따른 렌더링 분기 */}
        <main style={{ flex: 1, height: '100%', background: viewMode === 'graph' ? '#0b1120' : '#ffffff' }}>
          {graphData && (
            viewMode === 'graph' ? (
              <GraphCanvas
                nodesData={graphData.nodes}
                edgesData={graphData.edges}
                onNodeClick={setSelectedNode}
              />
            ) : (
              <AccessibleView
                nodesData={graphData.nodes}
                edgesData={graphData.edges}
                onSelectNode={setSelectedNode}
              />
            )
          )}
        </main>

        {/* 우측 노드 상세 드로어 */}
        {selectedNode && (
          <aside
            role="complementary"
            aria-label="세부문제 상세 정보"
            style={{
              width: '360px',
              background: '#ffffff',
              borderLeft: '1px solid #e2e8f0',
              padding: '24px',
              overflowY: 'auto',
              boxShadow: '-2px 0 8px rgba(0,0,0,0.05)',
              zIndex: 20,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '4px',
                  background: selectedNode.node_type === 'CAUSE' ? '#f1f5f9' : '#dbeafe',
                  color: selectedNode.node_type === 'CAUSE' ? '#475569' : '#1d4ed8',
                }}
              >
                {selectedNode.node_type === 'CAUSE' ? '발생 원인' : '파급 영향'}
              </span>
              <button
                onClick={() => setSelectedNode(null)}
                aria-label="닫기"
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '18px', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <h2 style={{ fontSize: '17px', fontWeight: 700, marginTop: '12px', marginBottom: '8px', color: '#0f172a' }}>
              [{selectedNode.id}] {selectedNode.label}
            </h2>
            <p style={{ fontSize: '13px', color: '#334155', lineHeight: 1.6 }}>{selectedNode.description}</p>
            
            <hr style={{ margin: '16px 0', border: 'none', borderTop: '1px solid #f1f5f9' }} />
            
            <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div><strong>시급성 점수:</strong> <span style={{ color: '#0284c7', fontWeight: 600 }}>{selectedNode.urgency_score}점</span></div>
              <div><strong>과기 해결 기대:</strong> <span style={{ color: '#16a34a', fontWeight: 600 }}>{selectedNode.tech_expectation_score}점</span></div>
              <div><strong>대응 사분면:</strong> <code style={{ background: '#f8fafc', padding: '2px 6px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>{selectedNode.quadrant}</code></div>
            </div>

            {selectedNode.reference_chips.length > 0 && (
              <div style={{ marginTop: '20px' }}>
                <strong style={{ fontSize: '13px', color: '#0f172a' }}>관련 성과 및 브리프 레퍼런스</strong>
                <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selectedNode.reference_chips.map((chip, idx) => (
                    <div key={idx} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '10px 12px', borderRadius: '6px', fontSize: '12px' }}>
                      <div style={{ color: '#0284c7', fontWeight: 700, marginBottom: '2px' }}>[{chip.source_type}]</div>
                      <div style={{ color: '#1e293b' }}>{chip.title}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>
        )}
      </div>
    </div>
  );
}