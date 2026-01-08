'use client';

import { useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import CourseNode from './CourseNode';
import { CourseNode as CourseNodeType, CourseEdge } from '@/lib/types';

const nodeTypes = {
  courseNode: CourseNode,
};

interface CourseGraphProps {
  nodes: CourseNodeType[];
  edges: CourseEdge[];
  onNodeClick?: (nodeId: string) => void;
  onNodesChange?: (changes: any) => void;
}

export default function CourseGraph({
  nodes,
  edges,
  onNodeClick,
  onNodesChange,
}: CourseGraphProps) {
  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node<any>) => {
      onNodeClick?.(node.id);
    },
    [onNodeClick]
  );

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={handleNodeClick}
        onNodesChange={onNodesChange}
        fitView
        proOptions={{ hideAttribution: true }}
        nodesDraggable={false}
        nodesConnectable={false}
        selectNodesOnDrag={false}
      >
        <Background 
          variant="dots" 
          gap={24} 
          size={1.5}
          className="!bg-gradient-to-br from-indigo-50/60 via-purple-50/40 via-pink-50/30 via-cyan-50/30 to-emerald-50/40"
          color="#c7d2fe"
          style={{ background: 'linear-gradient(135deg, rgba(238, 242, 255, 0.6) 0%, rgba(243, 232, 255, 0.4) 25%, rgba(251, 207, 232, 0.3) 50%, rgba(207, 250, 254, 0.3) 75%, rgba(209, 250, 229, 0.4) 100%)' }}
        />
      </ReactFlow>
    </div>
  );
}

