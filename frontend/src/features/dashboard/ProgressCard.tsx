import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ProgressCardProps {
  title: string;
  current: number;
  total: number;
  icon?: string;
  colorScheme?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
}

const colorSchemes = {
  blue: { bg: 'bg-blue-500', light: 'bg-blue-100', gradient: 'from-blue-500 to-blue-600' },
  green: { bg: 'bg-green-500', light: 'bg-green-100', gradient: 'from-green-500 to-green-600' },
  yellow: { bg: 'bg-yellow-500', light: 'bg-yellow-100', gradient: 'from-yellow-500 to-yellow-600' },
  red: { bg: 'bg-red-500', light: 'bg-red-100', gradient: 'from-red-500 to-red-600' },
  purple: { bg: 'bg-purple-500', light: 'bg-purple-100', gradient: 'from-purple-500 to-purple-600' },
};

export function ProgressCard({ title, current, total, icon, colorScheme = 'blue' }: ProgressCardProps) {
  const percentage = total > 0 ? (current / total) * 100 : 0;
  const colors = colorSchemes[colorScheme];

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-gray-600">
            {title}
          </CardTitle>
          {icon && <span className="text-2xl">{icon}</span>}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">{current}</span>
            <span className="text-lg text-gray-500">/ {total}</span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-600">
              <span>進捗</span>
              <span className="font-semibold">{percentage.toFixed(1)}%</span>
            </div>
            <div className={`w-full h-2 ${colors.light} rounded-full overflow-hidden`}>
              <div
                className={`h-full bg-gradient-to-r ${colors.gradient} transition-all duration-500 rounded-full`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
