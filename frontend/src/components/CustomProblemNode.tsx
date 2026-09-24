// CustomProblemNode.tsx

import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Zap, Target } from 'lucide-react';
import type { ProblemNodeData } from '../types/graph';

interface CustomProblemNodeProps {
  data: ProblemNodeData;
}

const quadrantColors: Record<string, { bg: string; border: string; text: string }> = {
  TECH_DRIVEN: { bg: '#eff6ff', border: '#3b82f6', text: '#1d4ed8' },
  POLICY_DRIVEN: { bg: '#fef2f2', border: '#ef4444', text: '#b91c1c' },
  BALANCED: { bg: '#f0fdf4', border: '#22c55e', text: '#15803d' },
  LONG_TERM: { bg: '#f8fafc', border: '#94a3b8', text: '#475569' },
};

export const CustomProblemNode: React.FC<CustomProblemNodeProps> = memo(({ data }) => {
  const isCause = data.node_type === 'CAUSE';
  const color = quadrantColors[data.quadrant] || quadrantColors.BALANCED;

  return (
    <div
      style={{
        width: '210px',
        padding: '8px 12px',
        background: '#ffffff',
        border: `1.5px solid ${color.border}`,
        borderRadius: '8px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.06)',
        cursor: 'pointer',
        fontSize: '11px',
        fontFamily: 'sans-serif',
      }}
    >
      {/* 엣지 연결 핸들 */}
      <Handle type="target" position={Position.Left} style={{ background: color.border, width: 6, height: 6 }} />

      {/* 헤더: ID 뱃지 & 유형 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 800, color: color.text, fontSize: '10px' }}>
          {isCause ? <Zap size={11} aria-hidden="true" /> : <Target size={11} aria-hidden="true" />}
          [{data.id}] {isCause ? '원인' : '영향'}
        </span>
        <span
          style={{
            fontSize: '9px',
            padding: '1px 5px',
            borderRadius: '4px',
            background: color.bg,
            color: color.text,
            fontWeight: 600,
          }}
        >
          {data.quadrant.replace('_', ' ')}
        </span>
      </div>

      {/* 세부문제 라벨 (말줄임) */}
      <div
        style={{
          fontWeight: 700,
          color: '#0f172a',
          fontSize: '12px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          marginBottom: '6px',
        }}
        title={data.label}
      >
        {data.label}
      </div>

      {/* 지표 게이지 (시급성 vs 과기기대) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '10px' }}>
        <span>시급성: <strong style={{ color: '#0f172a' }}>{data.urgency_score}</strong></span>
        <span>과기기대: <strong style={{ color: '#0f172a' }}>{data.tech_expectation_score}</strong></span>
      </div>

      <Handle type="source" position={Position.Right} style={{ background: color.border, width: 6, height: 6 }} />
    </div>
  );
});