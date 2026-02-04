import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ComparisonChartProps {
  title: string;
  data: Array<{ name: string; current: number; previous: number }>;
  currentLabel?: string;
  previousLabel?: string;
}

export function ComparisonChart({
  title,
  data,
  currentLabel = '今週',
  previousLabel = '先週',
}: ComparisonChartProps) {
  return (
    <Card className="shadow-lg">
      <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📊</span>
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #ccc',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            />
            <Legend />
            <Bar dataKey="previous" fill="#94a3b8" name={previousLabel} radius={[4, 4, 0, 0]} />
            <Bar dataKey="current" fill="#3b82f6" name={currentLabel} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
