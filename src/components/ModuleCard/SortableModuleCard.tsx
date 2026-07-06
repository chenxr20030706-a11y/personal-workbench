import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Link } from 'react-router-dom';
import {
  FlaskConical,
  BookOpen,
  Film,
  Briefcase,
  Languages,
  HeartPulse,
  GripVertical,
  ChevronRight,
} from 'lucide-react';
import type { ModuleConfig } from '../../types';

const iconMap: Record<string, typeof FlaskConical> = {
  FlaskConical,
  BookOpen,
  Film,
  Briefcase,
  Languages,
  HeartPulse,
};

interface SortableModuleCardProps {
  module: ModuleConfig;
  index: number;
}

export default function SortableModuleCard({ module, index }: SortableModuleCardProps) {
  const Icon = iconMap[module.icon] || FlaskConical;
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: module.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const gradientColors = [
    'from-dream-blue-400 to-dream-blue-500',
    'from-dream-blue-300 to-dream-blue-400',
    'from-dream-gold-300 to-dream-gold-400',
    'from-dream-blue-300 to-dream-gold-300',
    'from-dream-blue-400 to-dream-blue-600',
    'from-dream-gold-400 to-dream-blue-400',
  ];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`glass-card glass-card-hover rounded-2xl overflow-hidden animate-fade-in-up stagger-${index + 1} ${
        isDragging ? 'dragging z-50' : ''
      }`}
    >
      <Link to={module.route} className="block p-6 group">
        <div className="flex items-start justify-between mb-4">
          <div
            className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradientColors[index % gradientColors.length]} flex items-center justify-center shadow-soft-lg group-hover:scale-110 transition-transform duration-300`}
          >
            <Icon className="w-7 h-7 text-white icon-glow" />
          </div>
          <button
            {...attributes}
            {...listeners}
            className="drag-handle p-2 rounded-lg hover:bg-dream-blue-50/80 text-dream-blue-300 hover:text-dream-blue-500 transition-colors"
          >
            <GripVertical className="w-5 h-5" />
          </button>
        </div>

        <h3 className="text-lg font-semibold text-dream-slate-800 mb-2 font-display">
          {module.name}
        </h3>
        <p className="text-sm text-dream-blue-500 mb-4 line-clamp-2">
          {module.description}
        </p>

        {module.badge && (
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-dream-blue-100/80 text-dream-blue-600 text-xs font-medium mb-4">
            {module.badge}
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-dream-blue-100/50">
          <span className="text-sm text-dream-blue-400">进入模块</span>
          <ChevronRight className="w-5 h-5 text-dream-blue-300 group-hover:text-dream-blue-500 group-hover:translate-x-1 transition-all duration-300" />
        </div>
      </Link>
    </div>
  );
}
