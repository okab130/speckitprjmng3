import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CumulativeChartProps {
  title: string;
  plannedData: Array<{ date: string; count: number }>;
  actualData: Array<{ date: string; count: number }>;
  plannedLabel?: string;
  actualLabel?: string;
}

export function CumulativeChart({
  title,
  plannedData,
  actualData,
  plannedLabel = '予定',
  actualLabel = '実績',
}: CumulativeChartProps) {
  // Merge data by date
  const dates = new Set([
    ...plannedData.map(d => d.date),
    ...actualData.map(d => d.date),
  ]);

  const chartData = Array.from(dates)
    .sort()
    .map(date => {
      const planned = plannedData.find(d => d.date === date);
      const actual = actualData.find(d => d.date === date);
      
      return {
        date,
        planned: planned?.count || 0,
        actual: actual?.count || 0,
      };
    });

  return (
    <Card className="shadow-lg">
      <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📈</span>
          <CardTitle className="text-xl">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <defs>
              <linearGradient id="colorPlanned" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#82ca9d" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
              stroke="#666"
            />
            <YAxis stroke="#666" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                border: '1px solid #ccc',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="line"
            />
            <Line
              type="monotone"
              dataKey="planned"
              stroke="#8884d8"
              name={plannedLabel}
              strokeWidth={3}
              dot={{ r: 4, fill: '#8884d8' }}
              activeDot={{ r: 6 }}
              fill="url(#colorPlanned)"
            />
            <Line
              type="monotone"
              dataKey="actual"
              stroke="#82ca9d"
              name={actualLabel}
              strokeWidth={3}
              dot={{ r: 4, fill: '#82ca9d' }}
              activeDot={{ r: 6 }}
              fill="url(#colorActual)"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
