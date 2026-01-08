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
          gap={40} 
          size={1}
          color="rgba(59, 130, 246, 0.15)"
        />
      </ReactFlow>
    </div>
  );
}

