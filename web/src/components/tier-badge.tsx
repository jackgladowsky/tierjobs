import { cn } from '@/lib/utils';
import { Tier } from '@/lib/types';

interface TierBadgeProps {
  tier: Tier;
  size?: 'sm' | 'md' | 'lg';
  showGlow?: boolean;
}

const tierConfig: Record<Tier, { 
  gradient: string; 
  glow: string;
  textColor: string;
}> = {
  'S+': {
    gradient: 'bg-gradient-to-r from-amber-400 to-yellow-500',
    glow: 'shadow-amber-500/40',
    textColor: 'text-black',
  },
  'S': {
    gradient: 'bg-gradient-to-r from-violet-400 to-purple-500',
    glow: 'shadow-violet-500/40',
    textColor: 'text-white',
  },
  'S-': {
    gradient: 'bg-gradient-to-r from-violet-400/80 to-purple-500/80',
    glow: 'shadow-violet-500/30',
    textColor: 'text-white',
  },
  'A++': {
    gradient: 'bg-gradient-to-r from-blue-400 to-indigo-500',
    glow: 'shadow-blue-500/40',
    textColor: 'text-white',
  },
  'A+': {
    gradient: 'bg-gradient-to-r from-blue-400 to-blue-500',
    glow: 'shadow-blue-500/30',
    textColor: 'text-white',
  },
  'A': {
    gradient: 'bg-gradient-to-r from-sky-400 to-blue-500',
    glow: 'shadow-sky-500/30',
    textColor: 'text-white',
  },
  'A-': {
    gradient: 'bg-gradient-to-r from-sky-400/80 to-blue-500/80',
    glow: 'shadow-sky-500/25',
    textColor: 'text-white',
  },
  'B+': {
    gradient: 'bg-gradient-to-r from-emerald-400 to-green-500',
    glow: 'shadow-emerald-500/30',
    textColor: 'text-white',
  },
  'B': {
    gradient: 'bg-gradient-to-r from-green-400 to-emerald-500',
    glow: 'shadow-green-500/25',
    textColor: 'text-white',
  },
  'B-': {
    gradient: 'bg-gradient-to-r from-green-400/80 to-emerald-500/80',
    glow: 'shadow-green-500/20',
    textColor: 'text-white',
  },
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs font-semibold',
  md: 'px-2.5 py-1 text-sm font-bold',
  lg: 'px-3 py-1.5 text-base font-bold',
};

export function TierBadge({ tier, size = 'md', showGlow = true }: TierBadgeProps) {
  const config = tierConfig[tier] || tierConfig['B'];
  
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md tracking-tight',
        config.gradient,
        config.textColor,
        sizeClasses[size],
        showGlow && `shadow-lg ${config.glow}`
      )}
    >
      {tier}
    </span>
  );
}

// Score badge component
interface ScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

export function ScoreBadge({ score, size = 'md' }: ScoreBadgeProps) {
  const getScoreColor = (s: number) => {
    if (s >= 95) return 'from-amber-400 to-yellow-500 shadow-amber-500/40';
    if (s >= 85) return 'from-violet-400 to-purple-500 shadow-violet-500/40';
    if (s >= 75) return 'from-blue-400 to-indigo-500 shadow-blue-500/40';
    if (s >= 65) return 'from-emerald-400 to-green-500 shadow-emerald-500/30';
    return 'from-gray-400 to-gray-500 shadow-gray-500/20';
  };
  
  const sizeMap = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };
  
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-bold text-white shadow-lg',
        'bg-gradient-to-r',
        getScoreColor(score),
        sizeMap[size]
      )}
    >
      {score}
    </span>
  );
}
