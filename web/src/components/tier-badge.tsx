import { Tier } from '@/lib/types';
import { cn } from '@/lib/utils';

const tierConfig: Record<Tier, { bg: string; text: string; border: string; glow?: string }> = {
  'S+': {
    bg: 'bg-gradient-to-r from-amber-500 to-yellow-400',
    text: 'text-black font-bold',
    border: 'border-amber-400',
    glow: 'shadow-amber-500/50 shadow-lg',
  },
  'S': {
    bg: 'bg-gradient-to-r from-slate-300 to-slate-200',
    text: 'text-slate-900 font-bold',
    border: 'border-slate-300',
    glow: 'shadow-slate-300/50 shadow-md',
  },
  'S-': {
    bg: 'bg-gradient-to-r from-slate-400 to-slate-300',
    text: 'text-slate-900 font-semibold',
    border: 'border-slate-400',
  },
  'A++': {
    bg: 'bg-gradient-to-r from-purple-600 to-violet-500',
    text: 'text-white font-semibold',
    border: 'border-purple-400',
  },
  'A+': {
    bg: 'bg-gradient-to-r from-blue-600 to-blue-500',
    text: 'text-white font-semibold',
    border: 'border-blue-400',
  },
  'A': {
    bg: 'bg-gradient-to-r from-teal-600 to-teal-500',
    text: 'text-white font-medium',
    border: 'border-teal-400',
  },
  'A-': {
    bg: 'bg-gradient-to-r from-teal-500 to-teal-400',
    text: 'text-white font-medium',
    border: 'border-teal-300',
  },
  'B+': {
    bg: 'bg-gradient-to-r from-gray-500 to-gray-400',
    text: 'text-white font-medium',
    border: 'border-gray-300',
  },
  'B': {
    bg: 'bg-gradient-to-r from-gray-600 to-gray-500',
    text: 'text-white font-medium',
    border: 'border-gray-400',
  },
  'B-': {
    bg: 'bg-gradient-to-r from-gray-700 to-gray-600',
    text: 'text-white font-medium',
    border: 'border-gray-500',
  },
};

interface TierBadgeProps {
  tier: Tier;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function TierBadge({ tier, size = 'md', className }: TierBadgeProps) {
  const config = tierConfig[tier] ?? {
    bg: 'bg-gray-500',
    text: 'text-white',
    border: 'border-gray-400',
  };
  
  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-0.5',
    lg: 'text-base px-3 py-1',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border',
        config.bg,
        config.text,
        config.border,
        config.glow,
        sizeClasses[size],
        className
      )}
    >
      {tier}
    </span>
  );
}
