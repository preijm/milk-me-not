import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";

interface MilkTestResult {
  id: string;
  brand: string;
  type: string;
  rating: number;
  notes: string | null;
  created_at: string;
  user_id: string | null;
}

const COLORS = ["#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#3b82f6"];

export const MilkCharts = ({ results }: { results: MilkTestResult[] }) => {
  // Prepare data for bar chart - average rating by milk type
  const typeData = results.reduce((acc: { [key: string]: { count: number; total: number } }, curr) => {
    if (!acc[curr.type]) {
      acc[curr.type] = { count: 0, total: 0 };
    }
    acc[curr.type].count += 1;
    acc[curr.type].total += curr.rating;
    return acc;
  }, {});

  const barChartData = Object.entries(typeData).map(([type, data]) => ({
    type,
    avgRating: Number((data.total / data.count).toFixed(1)),
  }));

  // Prepare data for pie chart - rating distribution
  const ratingDistribution = results.reduce((acc: { [key: number]: number }, curr) => {
    acc[curr.rating] = (acc[curr.rating] || 0) + 1;
    return acc;
  }, {});

  const pieChartData = Object.entries(ratingDistribution).map(([rating, count]) => ({
    rating: `${rating} Stars`,
    value: count,
  }));

  return (
    <div className="bg-cream-100 rounded-lg p-6 mb-8">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Milk Rating Analytics</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-4">Average Rating by Milk Type</h3>
          <div className="h-[300px]">
            <ChartContainer config={{}}>
              <BarChart data={barChartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="type" 
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis domain={[0, 5]} />
                <ChartTooltip />
                <Bar dataKey="avgRating" fill="#8b5cf6" />
              </BarChart>
            </ChartContainer>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-4">Rating Distribution</h3>
          <div className="h-[300px]">
            <ChartContainer config={{}}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  dataKey="value"
                  nameKey="rating"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {pieChartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltip />
              </PieChart>
            </ChartContainer>
          </div>
        </div>
      </div>
    </div>
  );
};