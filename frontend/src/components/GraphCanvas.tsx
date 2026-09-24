// GraphCanvas.tsx (그래프 자동 레이아웃 컴포넌트)

import React, { useMemo } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  BackgroundVariant,
  type Node,
  type Edge,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { ProblemNodeData, ProblemEdgeData } from '../types/graph';
import { CustomProblemNode } from './CustomProblemNode';

interface GraphCanvasProps {
  nodesData: ProblemNodeData[];
  edgesData: ProblemEdgeData[];
  onNodeClick: (node: ProblemNodeData) => void;
}

const nodeTypes = {
  customProblem: CustomProblemNode,
};

// 좌/우 분리 및 2열 계층 그리드 좌표 수식
function getStructuredLayout(
  nodesData: ProblemNodeData[],
  edgesData: ProblemEdgeData[]
): { nodes: Node[]; edges: Edge[] } {
  const causes = nodesData.filter((n) => n.node_type === 'CAUSE');
  const impacts = nodesData.filter((n) => n.node_type === 'IMPACT');

  const nodes: Node[] = [];

  // 발생 원인 (16개): 좌측 2개 컬럼으로 지그재그 배치 (간격 축소 및 압축)
  causes.forEach((node, index) => {
    const col = index % 2; // 0열 또는 1열
    const row = Math.floor(index / 2);
    nodes.push({
      id: node.id,
      type: 'customProblem',
      position: { x: col * 260 + 50, y: row * 85 + 40 },
      data: { ...node },
    });
  });

  // 파급 영향 (6개): 우측 컬럼으로 일렬 배치
  impacts.forEach((node, index) => {
    nodes.push({
      id: node.id,
      type: 'customProblem',
      position: { x: 620, y: index * 110 + 80 },
      data: { ...node },
    });
  });

  const edges: Edge[] = edgesData.map((edge, index) => ({
    id: `edge-${edge.source}-${edge.target}-${index}`,
    source: edge.source,
    target: edge.target,
    animated: true,
    style: { stroke: '#3b82f6', strokeWidth: 1.5 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: '#3b82f6',
    },
  }));

  return { nodes, edges };
}

export const GraphCanvas: React.FC<GraphCanvasProps> = ({
  nodesData,
  edgesData,
  onNodeClick,
}) => {
  const { nodes, edges } = useMemo(
    () => getStructuredLayout(nodesData, edgesData),
    [nodesData, edgesData]
  );

  return (
    <div style={{ width: '100%', height: '100%', background: '#f8fafc' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={(_, node) => onNodeClick(node.data as unknown as ProblemNodeData)}
        fitView
        fitViewOptions={{ padding: 0.15 }}
      >
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#cbd5e1" />
        <Controls />
      </ReactFlow>
    </div>
  );
};