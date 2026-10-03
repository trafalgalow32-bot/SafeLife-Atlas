// AnalyticsPanel.tsx

import React from 'react';
import { AlertTriangle, TrendingUp, Cpu } from 'lucide-react';
import type { DomainAnalyticsResponse } from '../types/analytics';

interface AnalyticsPanelProps {
  analytics: DomainAnalyticsResponse;
  onSelectNodeById: (nodeId: string) => void;
}

export const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({ analytics, onSelectNodeById }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontSize: '12px', color: '#334155' }}>
      {/* 1. 도메인 진단 평균 지표 */}
      <section style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <strong style={{ fontSize: '13px', color: '#0f172a' }}>도메인 체감 지표 요약</strong>
          <span style={{ fontSize: '11px', color: '#64748b' }}>총 {analytics.total_nodes}개 노드</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div style={{ background: '#ffffff', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <span style={{ color: '#64748b', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
              <TrendingUp size={13} color="#0284c7" aria-hidden="true" />
              평균 시급성
            </span>
            <strong style={{ color: '#0284c7', fontSize: '15px' }}>{analytics.avg_urgency}점</strong>
          </div>
          <div style={{ background: '#ffffff', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <span style={{ color: '#64748b', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
              <Cpu size={13} color="#16a34a" aria-hidden="true" />
              과기해결 기대
            </span>
            <strong style={{ color: '#16a34a', fontSize: '15px' }}>{analytics.avg_tech_expectation}점</strong>
          </div>
        </div>
      </section>

      {/* 2. 정책-과기 갭(Gap) TOP 3 */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <strong style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#0f172a', fontSize: '13px' }}>
            <AlertTriangle size={14} color="#d97706" aria-hidden="true" />
            해결 갭(Gap) 우선 노드
          </strong>
          <span style={{ fontSize: '10px', color: '#94a3b8' }}>시급성 - 과기기대</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {analytics.priority_gap_nodes.map((node, index) => (
            <div
              key={node.id}
              onClick={() => onSelectNodeById(node.id)}
              style={{
                background: index === 0 ? '#fffbeb' : '#ffffff',
                border: index === 0 ? '1px solid #fde68a' : '1px solid #e2e8f0',
                padding: '10px 12px',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontWeight: 700, color: index === 0 ? '#b45309' : '#475569' }}>
                  {index + 1}위 · {node.id}
                </span>
                <span style={{ fontWeight: 700, color: '#d97706', fontFamily: 'monospace' }}>
                  Gap {node.gap > 0 ? `+${node.gap.toFixed(2)}` : node.gap.toFixed(2)}
                </span>
              </div>
              <div style={{ color: '#1e293b', fontWeight: 600, marginBottom: '6px' }}>{node.label}</div>

              {/* 최신 언론 키워드 태그 (2026-HYBRID 연계) */}
              {node.trend_keyword && (
                <div style={{ margin: '4px 0 6px 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '10px', background: '#eff6ff', color: '#1d4ed8', padding: '2px 6px', borderRadius: '4px', border: '1px solid #bfdbfe' }}>
                    최신 언론 키워드: {node.trend_keyword}
                  </span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b' }}>
                <span>시급성: {node.urgency_score}점</span>
                <span>과기기대: {node.tech_expectation_score}점</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. 사분면 분류 현황 */}
      <section>
        <strong style={{ color: '#0f172a', fontSize: '13px', display: 'block', marginBottom: '8px' }}>
          사분면 대응 분류 분포
        </strong>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
          {Object.entries(analytics.quadrant_distribution).map(([qKey, qData]) => (
            <div key={qKey} style={{ background: '#f8fafc', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>{qKey}</span>
              <strong style={{ fontSize: '13px', color: '#0f172a' }}>{qData.count}개 노드</strong>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};