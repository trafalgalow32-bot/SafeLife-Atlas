// AccessibleView.tsx

import React from 'react';
import type { ProblemNodeData, ProblemEdgeData } from '../types/graph';

interface AccessibleViewProps {
  nodesData: ProblemNodeData[];
  edgesData: ProblemEdgeData[];
  onSelectNode: (node: ProblemNodeData) => void;
}

export const AccessibleView: React.FC<AccessibleViewProps> = ({
  nodesData,
  edgesData,
  onSelectNode,
}) => {
  const causes = nodesData.filter((n) => n.node_type === 'CAUSE');
  const impacts = nodesData.filter((n) => n.node_type === 'IMPACT');

  const getConnectedImpacts = (causeId: string) => {
    const targets = edgesData.filter((e) => e.source === causeId).map((e) => e.target);
    return impacts.filter((imp) => targets.includes(imp.id));
  };

  return (
    <div
      role="region"
      aria-label="사회문제 세부구조 대체 목록 뷰"
      style={{
        padding: '24px',
        overflowY: 'auto',
        height: '100%',
        maxWidth: '900px',
        margin: '0 auto',
        fontFamily: 'sans-serif',
      }}
    >
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '20px', color: '#0f172a', marginBottom: '8px' }}>
          의미론적 세부문제 탐색 (스크린리더 및 키보드 지원)
        </h2>
        <p style={{ fontSize: '14px', color: '#475569' }}>
          마우스 그래프 조작이 불편한 사용자를 위한 계층형 텍스트 뷰입니다. Tab 키와 Enter 키로 세부 내용을 탐색할 수 있습니다.
        </p>
      </div>

      {/* 발생 원인 섹션 */}
      <section aria-labelledby="cause-heading" style={{ marginBottom: '32px' }}>
        <h3 id="cause-heading" style={{ fontSize: '17px', color: '#1e293b', borderBottom: '2px solid #cbd5e1', paddingBottom: '8px' }}>
          1. 발생 원인 세부문제 ({causes.length}개)
        </h3>
        <ul style={{ listStyle: 'none', padding: 0, margin: '16px 0 0 0' }}>
          {causes.map((node) => {
            const connected = getConnectedImpacts(node.id);
            return (
              <li key={node.id} style={{ marginBottom: '12px' }}>
                <details
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    padding: '12px',
                  }}
                >
                  <summary
                    style={{
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: '14px',
                      color: '#0f172a',
                    }}
                  >
                    <span style={{ color: '#64748b' }}>[{node.id}]</span> {node.label} (시급성: {node.urgency_score}점 / 과기기대: {node.tech_expectation_score}점)
                  </summary>
                  
                  <div style={{ marginTop: '12px', fontSize: '13px', color: '#334155', lineHeight: 1.6 }}>
                    <p style={{ margin: '6px 0' }}><strong>상세 설명:</strong> {node.description}</p>
                    <p style={{ margin: '6px 0' }}><strong>대응 사분면:</strong> {node.quadrant}</p>
                    
                    {connected.length > 0 && (
                      <div style={{ marginTop: '8px', padding: '8px', background: '#eff6ff', borderRadius: '4px' }}>
                        <strong style={{ color: '#1d4ed8' }}>연결된 파급 영향:</strong>
                        <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
                          {connected.map((c) => (
                            <li key={c.id}>
                              [{c.id}] {c.label}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {node.reference_chips.length > 0 && (
                      <div style={{ marginTop: '8px' }}>
                        <strong>연계 레퍼런스:</strong>
                        {node.reference_chips.map((chip, idx) => (
                          <div key={idx} style={{ color: '#0369a1', marginTop: '2px' }}>
                            • [{chip.source_type}] {chip.title}
                          </div>
                        ))}
                      </div>
                    )}

                    <button
                      onClick={() => onSelectNode(node)}
                      style={{
                        marginTop: '10px',
                        padding: '4px 10px',
                        background: '#0f172a',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '12px',
                        cursor: 'pointer',
                      }}
                    >
                      상세 드로어로 보기
                    </button>
                  </div>
                </details>
              </li>
            );
          })}
        </ul>
      </section>

      {/* 파급 영향 섹션 */}
      <section aria-labelledby="impact-heading">
        <h3 id="impact-heading" style={{ fontSize: '17px', color: '#1e293b', borderBottom: '2px solid #93c5fd', paddingBottom: '8px' }}>
          2. 파급 영향 세부문제 ({impacts.length}개)
        </h3>
        <ul style={{ listStyle: 'none', padding: 0, margin: '16px 0 0 0' }}>
          {impacts.map((node) => (
            <li key={node.id} style={{ marginBottom: '12px' }}>
              <div
                style={{
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  borderRadius: '6px',
                  padding: '12px',
                }}
              >
                <div style={{ fontWeight: 600, fontSize: '14px', color: '#1e3a8a' }}>
                  <span>[{node.id}]</span> {node.label}
                </div>
                <div style={{ marginTop: '6px', fontSize: '13px', color: '#334155' }}>
                  <p style={{ margin: '4px 0' }}><strong>정의:</strong> {node.description}</p>
                  <p style={{ margin: '4px 0' }}>
                    <strong>시급성:</strong> {node.urgency_score}점 | <strong>과기 기대:</strong> {node.tech_expectation_score}점
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};