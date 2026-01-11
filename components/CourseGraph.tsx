'use client';

import { useMemo, useRef, useEffect, useState } from 'react';
import CourseNode from './CourseNode';
import YearLabels from './YearLabels';
import { CourseNode as CourseNodeType, CourseEdge } from '@/lib/types';

// Get year level (1-4) from course level (1000-4000)
function getYearLevel(level: number): number {
  if (level >= 4000) return 4;
  if (level >= 3000) return 3;
  if (level >= 2000) return 2;
  return 1;
}

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
}: CourseGraphProps) {
  const nodeRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [nodePositions, setNodePositions] = useState<Map<string, { x: number; y: number; width: number; height: number }>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);

  // Group nodes by year
  const nodesByYear = useMemo(() => {
    const grouped = new Map<number, CourseNodeType[]>();
    nodes.forEach(node => {
      const year = getYearLevel(node.data.course.level);
      if (!grouped.has(year)) {
        grouped.set(year, []);
      }
      grouped.get(year)!.push(node);
    });
    
    // Sort by year and within year by code
    const sorted = Array.from(grouped.entries()).sort((a, b) => a[0] - b[0]);
    sorted.forEach(([year, yearNodes]) => {
      yearNodes.sort((a, b) => {
        if (a.data.course.department !== b.data.course.department) {
          return a.data.course.department.localeCompare(b.data.course.department);
        }
        return a.data.course.code.localeCompare(b.data.course.code);
      });
    });
    
    return sorted;
  }, [nodes]);

  // Update positions after render
  useEffect(() => {
    const updatePositions = () => {
      if (!containerRef.current) return;
      
      const containerRect = containerRef.current.getBoundingClientRect();
      const newPositions = new Map<string, { x: number; y: number; width: number; height: number }>();
      
      nodeRefs.current.forEach((element, nodeId) => {
        const rect = element.getBoundingClientRect();
        // Calculate position relative to container
        newPositions.set(nodeId, {
          x: rect.left - containerRect.left,
          y: rect.top - containerRect.top,
          width: rect.width,
          height: rect.height,
        });
      });
      
      setNodePositions(newPositions);
    };
    
    updatePositions();
    
    const handleScroll = () => {
      updatePositions();
    };
    
    const handleResize = () => {
      updatePositions();
    };
    
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleResize);
    const timeoutId = setTimeout(updatePositions, 100); // Update after layout
    
    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, [nodes]);

  // Get edge path for drawing lines
  const getEdgePath = (edge: CourseEdge) => {
    const sourcePos = nodePositions.get(edge.source);
    const targetPos = nodePositions.get(edge.target);
    
    if (!sourcePos || !targetPos) return '';
    
    const sourceX = sourcePos.x + sourcePos.width / 2;
    const sourceY = sourcePos.y + sourcePos.height;
    const targetX = targetPos.x + targetPos.width / 2;
    const targetY = targetPos.y;
    
    // Create curved path
    const midY = (sourceY + targetY) / 2;
    return `M ${sourceX} ${sourceY} C ${sourceX} ${midY} ${targetX} ${midY} ${targetX} ${targetY}`;
  };

  const handleNodeClick = (nodeId: string) => {
    onNodeClick?.(nodeId);
  };

  const setNodeRef = (nodeId: string) => (el: HTMLDivElement | null) => {
    if (el) {
      nodeRefs.current.set(nodeId, el);
    } else {
      nodeRefs.current.delete(nodeId);
    }
  };

  return (
    <div 
      ref={containerRef}
      className="w-full relative"
    >
      {/* SVG overlay for edges */}
      {nodePositions.size > 0 && (
        <svg
          className="absolute inset-0 pointer-events-none z-10"
          style={{ width: '100%', height: '100%' }}
          xmlns="http://www.w3.org/2000/svg"
        >
          {edges.map(edge => {
            const path = getEdgePath(edge);
            if (!path) return null;
            
            const strokeWidth = edge.style?.strokeWidth || 2;
            const stroke = edge.style?.stroke || '#60a5fa';
            const opacity = edge.style?.opacity || 0.5;
            
            return (
              <path
                key={edge.id}
                d={path}
                fill="none"
                stroke={stroke}
                strokeWidth={strokeWidth}
                opacity={opacity}
                strokeDasharray={edge.animated ? '5,5' : 'none'}
                strokeLinecap="round"
                style={edge.animated ? {
                  animation: 'dash 1s linear infinite',
                } : {}}
              />
            );
          })}
        </svg>
      )}

      {/* Year Labels - Sticky */}
      <YearLabels />

      {/* Main content container */}
      <div className="relative px-8 pb-6 pt-2">
        {nodesByYear.map(([year, yearNodes]) => (
          <div key={year} className="mb-4">
            {/* Year header */}
            <div id={`year-${year * 1000}`} className="sticky top-2 z-10 mb-3 scroll-mt-[140px]">
              <div className="px-4 py-2.5 glass rounded-xl text-xs font-semibold text-gray-300 shadow-lg border border-white/10 inline-block w-[125px] h-[48px] flex flex-col justify-center">
                <div className="text-blue-400 font-bold uppercase tracking-wider text-center leading-tight text-xs">
                  {year === 1 ? 'First Year' : year === 2 ? 'Second Year' : year === 3 ? 'Third Year' : 'Fourth Year'}
                </div>
                <div className="text-gray-400 text-center leading-tight text-[11px]">
                  {(year * 1000)}-level
                </div>
              </div>
            </div>
            
            {/* Courses in this year - flexbox with wrapping */}
            <div className="flex flex-wrap gap-3 relative z-20">
              {yearNodes.map(node => (
                <div
                  key={node.id}
                  ref={setNodeRef(node.id)}
                  className="relative"
                >
                  <CourseNode
                    data={node.data}
                    id={node.id}
                    onClick={() => handleNodeClick(node.id)}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
