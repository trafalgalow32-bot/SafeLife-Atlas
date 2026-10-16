// Explorer.tsx — 도메인 탐색기 (그래프/대체뷰 + 분석 패널). 기존 App 본문을 도메인별로 재사용.

import { useEffect, useState, type CSSProperties } from 'react';
import { Zap, Target, BarChart2, Info } from 'lucide-react';
import { fetchDomainGraph, fetchDomainAnalytics } from '../api/client';
import type { DomainGraphResponse, ProblemNodeData } from '../types/graph';
import type { DomainAnalyticsResponse } from '../types/analytics';
import { GraphCanvas } from './GraphCanvas';
import { AccessibleView } from './AccessibleView';
import { AnalyticsPanel } from './AnalyticsPanel';

const toggleStyle = (active: boolean): CSSProperties => ({
  padding: '6px 14px',
  fontSize: 13,
  fontWeight: 600,
  borderRadius: 6,
  border: '1px solid ' + (active ? '#2563eb' : '#cbd5e1'),
  cursor: 'pointer',
  background: active ? '#2563eb' : '#ffffff',
  color: active ? '#ffffff' : '#475569',
});

export function Explorer({ domainId }: { domainId: string }) {
  const [graphData, setGraphData] = useState<DomainGraphResponse | null>(null);
  const [analyticsData, setAnalyticsData] = useState<DomainAnalyticsResponse | null>(null);
  const [selectedNode, setSelectedNode] = useState<ProblemNodeData | null>(null);
  const [viewMode, setViewMode] = useState<'graph' | 'accessible'>('graph');
  const [activeTab, setActiveTab] = useState<'analytics' | 'node'>('analytics');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setGraphData(null);
    setAnalyticsData(null);
    setSelectedNode(null);
    setError(null);
    Promise.all([fetchDomainGraph(domainId), fetchDomainAnalytics(domainId)])
      .then(([graph, analytics]) => {
        setGraphData(graph);
        setAnalyticsData(analytics);
      })
      .catch((err) => setError(err.message));
  }, [domainId]);

  const handleSelectNode = (node: ProblemNodeData | null) => {
    setSelectedNode(node);
    if (node) {
      setActiveTab('node');
    }
  };

  const handleSelectNodeById = (nodeId: string) => {
    if (!graphData) return;
    const target = graphData.nodes.find((n) => n.id === nodeId);
    if (target) {
      handleSelectNode(target);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '78vh',
        minHeight: 560,
        border: '1px solid #e2e8f0',
        borderRadius: 12,
        overflow: 'hidden',
        background: '#ffffff',
      }}
    >
      {/* 툴바: 뷰 전환 */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '10px 14px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
        <div role="group" aria-label="화면 표시 방식 선택" style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setViewMode('graph')} aria-pressed={viewMode === 'graph'} style={toggleStyle(viewMode === 'graph')}>
            노드 그래프 뷰
          </button>
          <button onClick={() => setViewMode('accessible')} aria-pressed={viewMode === 'accessible'} style={toggleStyle(viewMode === 'accessible')}>
            접근성 목록 뷰 (텍스트)
          </button>
        </div>
      </div>

      {/* 본문: 그래프/대체뷰 + 우측 분석 패널 */}
      <div style={{ display: 'flex', flex: 1, position: 'relative', minHeight: 0 }}>
        {error && (
          <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 50, background: '#fee2e2', color: '#dc2626', padding: '10px 16px', borderRadius: 6 }}>
            {error} (FastAPI 서버 상태 확인 필요)
          </div>
        )}

        <main
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0,
            minHeight: 0,
            position: 'relative',
            background: viewMode === 'graph' ? '#0b1120' : '#ffffff',
          }}
        >
          {graphData &&
            (viewMode === 'graph' ? (
              <GraphCanvas nodesData={graphData.nodes} edgesData={graphData.edges} onNodeClick={handleSelectNode} />
            ) : (
              <AccessibleView nodesData={graphData.nodes} edgesData={graphData.edges} onSelectNode={handleSelectNode} />
            ))}
        </main>

        <aside
          role="complementary"
          aria-label="문제 분석 및 세부 정보"
          style={{ width: 380, background: '#ffffff', borderLeft: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}
        >
          <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
            <button
              onClick={() => setActiveTab('analytics')}
              style={{
                flex: 1, padding: '12px 0', fontSize: 13, fontWeight: 700, border: 'none',
                borderBottom: activeTab === 'analytics' ? '2px solid #2563eb' : '2px solid transparent',
                background: 'transparent', color: activeTab === 'analytics' ? '#2563eb' : '#64748b',
                cursor: 'pointer', display: 'inline-flex', justifyContent: 'center', alignItems: 'center', gap: 6,
              }}
            >
              <BarChart2 size={15} /> 종합 분석
            </button>
            <button
              onClick={() => setActiveTab('node')}
              style={{
                flex: 1, padding: '12px 0', fontSize: 13, fontWeight: 700, border: 'none',
                borderBottom: activeTab === 'node' ? '2px solid #2563eb' : '2px solid transparent',
                background: 'transparent', color: activeTab === 'node' ? '#2563eb' : '#64748b',
                cursor: 'pointer', display: 'inline-flex', justifyContent: 'center', alignItems: 'center', gap: 6,
              }}
            >
              <Info size={15} /> 세부문제 정보 {selectedNode ? `(${selectedNode.id})` : ''}
            </button>
          </div>

          <div style={{ flex: 1, padding: 20, overflowY: 'auto' }}>
            {activeTab === 'analytics' && analyticsData && (
              <AnalyticsPanel analytics={analyticsData} onSelectNodeById={handleSelectNodeById} />
            )}

            {activeTab === 'node' &&
              (selectedNode ? (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700,
                        padding: '3px 8px', borderRadius: 4,
                        background: selectedNode.node_type === 'CAUSE' ? '#fef2f2' : '#eff6ff',
                        color: selectedNode.node_type === 'CAUSE' ? '#b91c1c' : '#1d4ed8',
                        border: selectedNode.node_type === 'CAUSE' ? '1px solid #fecaca' : '1px solid #bfdbfe',
                      }}
                    >
                      {selectedNode.node_type === 'CAUSE' ? <Zap size={13} aria-hidden="true" /> : <Target size={13} aria-hidden="true" />}
                      {selectedNode.node_type === 'CAUSE' ? '발생 원인' : '파급 영향'}
                    </span>
                    <button
                      onClick={() => setSelectedNode(null)}
                      aria-label="상세 정보 닫기"
                      style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 18, color: '#64748b' }}
                    >
                      ✕
                    </button>
                  </div>

                  <h2 style={{ fontSize: 16, fontWeight: 700, marginTop: 14, marginBottom: 8, color: '#0f172a', lineHeight: 1.4 }}>
                    [{selectedNode.id}] {selectedNode.label}
                  </h2>
                  <p style={{ fontSize: 13, color: '#334155', lineHeight: 1.6, margin: '8px 0 16px 0' }}>
                    {selectedNode.description}
                  </p>

                  {selectedNode.trend_keyword && (
                    <div style={{ marginBottom: 16, padding: '8px 10px', background: '#eff6ff', borderRadius: 6, border: '1px solid #bfdbfe' }}>
                      <span style={{ fontSize: 11, color: '#1e40af', fontWeight: 600, display: 'block', marginBottom: 2 }}>
                        2024~2026 빅카인즈 최신 키워드
                      </span>
                      <span style={{ fontSize: 12, color: '#1d4ed8', fontWeight: 700 }}>{selectedNode.trend_keyword}</span>
                    </div>
                  )}

                  <hr style={{ margin: '14px 0', border: 'none', borderTop: '1px solid #e2e8f0' }} />

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                      <span style={{ color: '#475569', fontWeight: 600 }}>시급성 점수</span>
                      <strong style={{ color: '#0369a1', fontSize: 14 }}>{selectedNode.urgency_score}점</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                      <span style={{ color: '#475569', fontWeight: 600 }}>과기 해결 기대</span>
                      <strong style={{ color: '#15803d', fontSize: 14 }}>{selectedNode.tech_expectation_score}점</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, paddingTop: 6, borderTop: '1px solid #e2e8f0' }}>
                      <span style={{ color: '#475569', fontWeight: 600 }}>대응 사분면</span>
                      <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700, fontFamily: 'monospace', background: '#0f172a', color: '#ffffff' }}>
                        {selectedNode.quadrant}
                      </span>
                    </div>
                  </div>

                  {selectedNode.reference_chips && selectedNode.reference_chips.length > 0 && (
                    <div style={{ marginTop: 20 }}>
                      <strong style={{ fontSize: 13, color: '#0f172a', display: 'block', marginBottom: 8 }}>
                        관련 성과 및 브리프 레퍼런스
                      </strong>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {selectedNode.reference_chips.map((chip, idx) => (
                          <div key={idx} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '10px 12px', borderRadius: 6, fontSize: 12 }}>
                            <div style={{ color: '#0369a1', fontWeight: 700, marginBottom: 2 }}>[{chip.source_type}]</div>
                            <div style={{ color: '#1e293b', lineHeight: 1.4 }}>{chip.title}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ textAlign: 'center', color: '#64748b', marginTop: 60, fontSize: 13 }}>
                  그래프 캔버스에서 확인하고자 하는 세부문제 노드를 선택해주세요.
                </div>
              ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
