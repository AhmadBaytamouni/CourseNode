'use client';

import { memo } from 'react';
import { Course } from '@/lib/types';
import { getCourseLevelColor, UI_COLORS } from '@/constants/colors';
import { formatCredits } from '@/lib/courseData';
import { COURSE_NODE } from '@/constants/dimensions';

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
    nodeClasses = 'glass-strong border-blue-400 shadow-2xl shadow-blue-400/50 bg-gradient-to-br from-blue-400/25 via-purple-400/25 to-purple-400/25';
    borderColor = UI_COLORS.SELECTED.BORDER;
  } else if (isPrerequisite) {
    nodeClasses = 'glass border-purple-400/70 shadow-xl shadow-purple-400/30 bg-gradient-to-br from-purple-400/20 to-purple-500/20';
    borderColor = UI_COLORS.PREREQUISITE.BORDER;
  } else if (isUnlockable) {
    nodeClasses = 'glass border-emerald-500/60 shadow-xl shadow-emerald-500/30 bg-gradient-to-br from-emerald-500/15 to-teal-500/15';
    borderColor = UI_COLORS.UNLOCKABLE.BORDER;
  } else {
    nodeClasses = 'glass border-white/20 hover:border-white/30 hover:shadow-xl transition-all duration-300';
  }

  return (
    <div
      onClick={onClick}
      className={`rounded-xl ${nodeClasses} p-5 transition-all duration-300 cursor-pointer flex flex-col ${
        isSelected ? 'scale-110 z-20 ring-4 ring-blue-400/40 animate-pulse-slow' : 
        isPrerequisite ? 'scale-105 z-10 ring-2 ring-purple-400/30' : 
        isUnlockable ? 'scale-105 z-10 ring-2 ring-emerald-500/20' :
        'hover:scale-105 hover:ring-2 hover:ring-white/20'
      } ${isFaded ? 'opacity-20 grayscale blur-[2px]' : ''}`}
      style={{
        width: `${COURSE_NODE.WIDTH}px`,
        minHeight: `${COURSE_NODE.MIN_HEIGHT}px`,
        borderColor: borderColor,
        borderWidth: isSelected ? '2px' : '1px',
      }}
    >
      <div className="text-center space-y-2.5 flex-1 flex flex-col justify-between">
        <div className={`font-bold text-xl tracking-tight ${
          isSelected ? 'text-blue-200' : 
          isPrerequisite ? 'text-purple-200' : 
          isUnlockable ? 'text-emerald-300' :
          'text-gray-100'
        }`}>
          {course.code}
        </div>
        <div 
          className={`text-sm leading-relaxed line-clamp-4 font-medium min-h-[3.5rem] flex items-center justify-center ${
            isSelected ? 'text-blue-100' : 
            isPrerequisite ? 'text-purple-100' : 
            isUnlockable ? 'text-emerald-200' :
            'text-gray-400'
          }`} 
          title={course.title}
        >
          {course.title}
        </div>
        <div 
          className={`text-sm font-semibold px-3 py-1.5 rounded-lg inline-block backdrop-blur-sm ${
            isSelected ? 'bg-blue-400/40 text-blue-100 border border-blue-400/40' : 
            isPrerequisite ? 'bg-purple-400/40 text-purple-100 border border-purple-400/40' : 
            isUnlockable ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-400/30' :
            'bg-white/10 text-gray-300 border border-white/20'
          }`}
        >
          {formatCredits(course.credits)}
        </div>
      </div>
    </div>
  );
}

export default memo(CourseNodeComponent);
