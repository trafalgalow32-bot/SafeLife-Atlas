// App.tsx

import { useEffect, useState } from 'react';
import { Zap, Target, BarChart2, Info } from 'lucide-react';
import { fetchDomainGraph, fetchDomainAnalytics } from './api/client';
import type { DomainGraphResponse, ProblemNodeData } from './types/graph';
import type { DomainAnalyticsResponse } from './types/analytics';
import { GraphCanvas } from './components/GraphCanvas';
import { AccessibleView } from './components/AccessibleView';
import { AnalyticsPanel } from './components/AnalyticsPanel';

export default function App() {
  const [graphData, setGraphData] = useState<DomainGraphResponse | null>(null);
  const [analyticsData, setAnalyticsData] = useState<DomainAnalyticsResponse | null>(null);
  const [selectedNode, setSelectedNode] = useState<ProblemNodeData | null>(null);
  const [viewMode, setViewMode] = useState<'graph' | 'accessible'>('graph');
  const [activeTab, setActiveTab] = useState<'analytics' | 'node'>('analytics');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetchDomainGraph('voice-phishing'),
      fetchDomainAnalytics('voice-phishing'),
    ])
      .then(([graph, analytics]) => {
        setGraphData(graph);
        setAnalyticsData(analytics);
      })
      .catch((err) => setError(err.message));
  }, []);

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

        {/* main 태그: position relative 및 Flexbox를 명시하여 내부 절대 좌표 캔버스의 기준점 확보 */}
        <main
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            width: '100%',
            minWidth: 0,
            minHeight: 0,
            position: 'relative',
            background: viewMode === 'graph' ? '#0b1120' : '#ffffff',
          }}
        >
          {graphData && (
            viewMode === 'graph' ? (
              <GraphCanvas
                nodesData={graphData.nodes}
                edgesData={graphData.edges}
                onNodeClick={handleSelectNode}
              />
            ) : (
              <AccessibleView
                nodesData={graphData.nodes}
                edgesData={graphData.edges}
                onSelectNode={handleSelectNode}
              />
            )
          )}
        </main>

        {/* 우측 사이드 패널 (안 A: 2단 탭 구조) */}
        <aside
          role="complementary"
          aria-label="문제 분석 및 세부 정보"
          style={{
            width: '380px',
            background: '#ffffff',
            borderLeft: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '-2px 0 8px rgba(0,0,0,0.05)',
            zIndex: 20,
          }}
        >
          {/* 상단 탭 헤더 */}
          <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
            <button
              onClick={() => setActiveTab('analytics')}
              style={{
                flex: 1,
                padding: '12px 0',
                fontSize: '13px',
                fontWeight: 700,
                border: 'none',
                borderBottom: activeTab === 'analytics' ? '2px solid #2563eb' : '2px solid transparent',
                background: 'transparent',
                color: activeTab === 'analytics' ? '#2563eb' : '#64748b',
                cursor: 'pointer',
                display: 'inline-flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <BarChart2 size={15} /> 종합 분석
            </button>
            <button
              onClick={() => setActiveTab('node')}
              style={{
                flex: 1,
                padding: '12px 0',
                fontSize: '13px',
                fontWeight: 700,
                border: 'none',
                borderBottom: activeTab === 'node' ? '2px solid #2563eb' : '2px solid transparent',
                background: 'transparent',
                color: activeTab === 'node' ? '#2563eb' : '#64748b',
                cursor: 'pointer',
                display: 'inline-flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Info size={15} /> 세부문제 정보 {selectedNode ? `(${selectedNode.id})` : ''}
            </button>
          </div>

          {/* 탭 본문 영역 */}
          <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
            {activeTab === 'analytics' && analyticsData && (
              <AnalyticsPanel
                analytics={analyticsData}
                onSelectNodeById={handleSelectNodeById}
              />
            )}

            {activeTab === 'node' && (
              selectedNode ? (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '12px',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '4px',
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
                      style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '18px', color: '#64748b' }}
                    >
                      ✕
                    </button>
                  </div>

                  <h2 style={{ fontSize: '16px', fontWeight: 700, marginTop: '14px', marginBottom: '8px', color: '#0f172a', lineHeight: 1.4 }}>
                    [{selectedNode.id}] {selectedNode.label}
                  </h2>
                  <p style={{ fontSize: '13px', color: '#334155', lineHeight: 1.6, margin: '8px 0 16px 0' }}>
                    {selectedNode.description}
                  </p>

                  {/* 2026 최신 언론 키워드 */}
                  {selectedNode.trend_keyword && (
                    <div style={{ marginBottom: '16px', padding: '8px 10px', background: '#eff6ff', borderRadius: '6px', border: '1px solid #bfdbfe' }}>
                      <span style={{ fontSize: '11px', color: '#1e40af', fontWeight: 600, display: 'block', marginBottom: '2px' }}>
                        2024~2026 빅카인즈 최신 키워드
                      </span>
                      <span style={{ fontSize: '12px', color: '#1d4ed8', fontWeight: 700 }}>
                        {selectedNode.trend_keyword}
                      </span>
                    </div>
                  )}

                  <hr style={{ margin: '14px 0', border: 'none', borderTop: '1px solid #e2e8f0' }} />

                  {/* 체감 지표 및 사분면 점수 블록 */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                      <span style={{ color: '#475569', fontWeight: 600 }}>시급성 점수</span>
                      <strong style={{ color: '#0284c7', fontSize: '14px' }}>{selectedNode.urgency_score}점</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                      <span style={{ color: '#475569', fontWeight: 600 }}>과기 해결 기대</span>
                      <strong style={{ color: '#16a34a', fontSize: '14px' }}>{selectedNode.tech_expectation_score}점</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', paddingTop: '6px', borderTop: '1px solid #e2e8f0' }}>
                      <span style={{ color: '#475569', fontWeight: 600 }}>대응 사분면</span>
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 700,
                          fontFamily: 'monospace',
                          background: '#0f172a',
                          color: '#ffffff',
                        }}
                      >
                        {selectedNode.quadrant}
                      </span>
                    </div>
                  </div>

                  {/* 관련 성과 및 브리프 레퍼런스 */}
                  {selectedNode.reference_chips && selectedNode.reference_chips.length > 0 && (
                    <div style={{ marginTop: '20px' }}>
                      <strong style={{ fontSize: '13px', color: '#0f172a', display: 'block', marginBottom: '8px' }}>
                        관련 성과 및 브리프 레퍼런스
                      </strong>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {selectedNode.reference_chips.map((chip, idx) => (
                          <div key={idx} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '10px 12px', borderRadius: '6px', fontSize: '12px' }}>
                            <div style={{ color: '#0284c7', fontWeight: 700, marginBottom: '2px' }}>[{chip.source_type}]</div>
                            <div style={{ color: '#1e293b', lineHeight: 1.4 }}>{chip.title}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ textAlign: 'center', color: '#94a3b8', marginTop: '60px', fontSize: '13px' }}>
                  그래프 캔버스에서 확인하고자 하는 세부문제 노드를 선택해주세요.
                </div>
              )
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}