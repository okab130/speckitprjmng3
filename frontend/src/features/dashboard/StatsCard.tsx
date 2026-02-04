import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ReactNode } from 'react';

interface StatsCardProps {
  title: string;
  value: number | string;
  description?: string;
  className?: string;
  icon?: ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  colorScheme?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo';
}

const colorSchemes = {
  blue: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
  green: 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
  yellow: 'from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700',
  red: 'from-red-500 to-red-600 hover:from-red-600 hover:to-red-700',
  purple: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
  indigo: 'from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700',
};

export function StatsCard({ 
  title, 
  value, 
  description, 
  className = '',
  icon,
  trend,
  trendValue,
  colorScheme = 'blue'
}: StatsCardProps) {
  const gradientClass = colorSchemes[colorScheme];
  
  return (
    <Card className={`overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-105 ${className}`}>
      <div className={`bg-gradient-to-br ${gradientClass} p-4 text-white`}>
        <CardHeader className="pb-2 p-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-white/90">
              {title}
            </CardTitle>
            {icon && (
              <div className="text-2xl opacity-80">
                {icon}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0 pt-2">
          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-bold">{value}</div>
            {trend && trendValue && (
              <div className={`flex items-center text-xs font-medium ${
                trend === 'up' ? 'text-white/90' : 
                trend === 'down' ? 'text-white/70' : 
                'text-white/80'
              }`}>
                {trend === 'up' && '↑'}
                {trend === 'down' && '↓'}
                {trend === 'neutral' && '→'}
                {trendValue}
              </div>
            )}
          </div>
          {description && (
            <p className="text-xs text-white/80 mt-2">{description}</p>
          )}
        </CardContent>
      </div>
    </Card>
  );
}
