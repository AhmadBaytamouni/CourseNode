'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Course } from '@/lib/types';
import { getCourseLevelColor } from '@/lib/courseData';

interface CourseNodeData {
  course: Course;
  isSelected?: boolean;
  isPrerequisite?: boolean;
  isUnlockable?: boolean;
  isFaded?: boolean;
}

function CourseNodeComponent({ data }: NodeProps<CourseNodeData>) {
  const { course, isSelected, isPrerequisite, isUnlockable, isFaded } = data;
  const levelColor = getCourseLevelColor(course.level);

  // Determine styling based on selection state
  let nodeClasses = 'bg-white border-2';
  let borderColor = levelColor;
  
  if (isSelected) {
    nodeClasses = 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-blue-500 shadow-2xl shadow-blue-500/30';
    borderColor = '#3b82f6';
  } else if (isPrerequisite) {
    nodeClasses = 'bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-400 shadow-lg shadow-indigo-500/20';
    borderColor = '#818cf8';
  } else if (isUnlockable) {
    nodeClasses = 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-400 shadow-lg shadow-emerald-500/20';
    borderColor = '#10b981';
  } else {
    nodeClasses = 'bg-white/95 backdrop-blur-sm border-2 hover:border-opacity-80 hover:shadow-lg transition-all duration-300';
  }

  return (
    <div
      className={`rounded-2xl ${nodeClasses} p-5 min-w-[220px] transition-all duration-300 cursor-pointer ${
        isSelected ? 'scale-110 z-20 ring-4 ring-blue-200/50 animate-pulse-slow' : 
        isPrerequisite ? 'scale-105 z-10 ring-2 ring-indigo-200/30' : 
        isUnlockable ? 'scale-105 z-10 ring-2 ring-emerald-200/30' :
        'hover:scale-105 hover:ring-2 hover:ring-gray-200'
      } ${isFaded ? 'opacity-30 grayscale blur-sm' : ''}`}
      style={{
        borderColor: borderColor,
        borderWidth: isSelected ? '3px' : '2px',
      }}
    >
      <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-gray-400" />
      
      <div className="text-center space-y-2.5">
        <div className={`font-extrabold text-lg tracking-tight ${
          isSelected ? 'text-blue-900' : 
          isPrerequisite ? 'text-indigo-900' : 
          isUnlockable ? 'text-emerald-900' :
          'text-gray-900'
        }`}>
          {course.code}
        </div>
        <div className={`text-xs leading-relaxed line-clamp-2 font-medium ${
          isSelected ? 'text-blue-800' : 
          isPrerequisite ? 'text-indigo-800' : 
          isUnlockable ? 'text-emerald-800' :
          'text-gray-700'
        }`} title={course.title}>
          {course.title}
        </div>
        <div className={`text-xs font-semibold px-2 py-1 rounded-lg inline-block ${
          isSelected ? 'bg-blue-100 text-blue-700' : 
          isPrerequisite ? 'bg-indigo-100 text-indigo-700' : 
          isUnlockable ? 'bg-emerald-100 text-emerald-700' :
          'bg-gray-100 text-gray-600'
        }`}>
          {course.credits} credit{course.credits !== 1 ? 's' : ''} • {course.level}-level
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-gray-400" />
    </div>
  );
}

export default memo(CourseNodeComponent);

