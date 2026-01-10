'use client';

import { memo } from 'react';
import { Course } from '@/lib/types';
import { getCourseLevelColor, formatCredits } from '@/lib/courseData';

interface CourseNodeData {
  course: Course;
  isSelected?: boolean;
  isPrerequisite?: boolean;
  isUnlockable?: boolean;
  isFaded?: boolean;
}

interface CourseNodeProps {
  data: CourseNodeData;
  id: string;
  onClick?: () => void;
}

function CourseNodeComponent({ data, onClick }: CourseNodeProps) {
  const { course, isSelected, isPrerequisite, isUnlockable, isFaded } = data;
  const levelColor = getCourseLevelColor(course.level);

  // Determine styling based on selection state
  let nodeClasses = 'glass border-2';
  let borderColor = levelColor;
  
  if (isSelected) {
    nodeClasses = 'glass-strong border-blue-500 shadow-2xl shadow-blue-500/50 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20';
    borderColor = '#3b82f6';
  } else if (isPrerequisite) {
    nodeClasses = 'glass border-indigo-500/60 shadow-xl shadow-indigo-500/30 bg-gradient-to-br from-indigo-500/15 to-purple-500/15';
    borderColor = '#818cf8';
  } else if (isUnlockable) {
    nodeClasses = 'glass border-emerald-500/60 shadow-xl shadow-emerald-500/30 bg-gradient-to-br from-emerald-500/15 to-teal-500/15';
    borderColor = '#10b981';
  } else {
    nodeClasses = 'glass border-white/20 hover:border-white/30 hover:shadow-xl transition-all duration-300';
  }

  return (
    <div
      onClick={onClick}
      className={`rounded-xl ${nodeClasses} p-5 w-[240px] h-[160px] transition-all duration-300 cursor-pointer flex flex-col ${
        isSelected ? 'scale-110 z-20 ring-4 ring-blue-500/30 animate-pulse-slow' : 
        isPrerequisite ? 'scale-105 z-10 ring-2 ring-indigo-500/20' : 
        isUnlockable ? 'scale-105 z-10 ring-2 ring-emerald-500/20' :
        'hover:scale-105 hover:ring-2 hover:ring-white/20'
      } ${isFaded ? 'opacity-20 grayscale blur-[2px]' : ''}`}
      style={{
        borderColor: borderColor,
        borderWidth: isSelected ? '2px' : '1px',
      }}
    >
      <div className="text-center space-y-2.5 flex-1 flex flex-col justify-between">
        <div className={`font-bold text-lg tracking-tight ${
          isSelected ? 'text-blue-300' : 
          isPrerequisite ? 'text-indigo-300' : 
          isUnlockable ? 'text-emerald-300' :
          'text-gray-100'
        }`}>
          {course.code}
        </div>
        <div className={`text-xs leading-relaxed line-clamp-2 font-medium min-h-[2.5rem] flex items-center justify-center ${
          isSelected ? 'text-blue-200' : 
          isPrerequisite ? 'text-indigo-200' : 
          isUnlockable ? 'text-emerald-200' :
          'text-gray-400'
        }`} title={course.title}>
          {course.title}
        </div>
        <div className={`text-xs font-semibold px-3 py-1.5 rounded-lg inline-block backdrop-blur-sm ${
          isSelected ? 'bg-blue-500/30 text-blue-200 border border-blue-400/30' : 
          isPrerequisite ? 'bg-indigo-500/30 text-indigo-200 border border-indigo-400/30' : 
          isUnlockable ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-400/30' :
          'bg-white/10 text-gray-300 border border-white/20'
        }`}>
          {formatCredits(course.credits)}
        </div>
      </div>
    </div>
  );
}

export default memo(CourseNodeComponent);

