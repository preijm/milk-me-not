import React, { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend, Area, AreaChart } from "recharts";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { Card, CardContent } from "@/components/ui/card";
import { MilkTestResult } from "@/types/milk-test";

const COLORS = ["#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#3b82f6"];
const chartConfig = {
  rating: {
    color: "#8b5cf6"
  },
  count: {
    color: "#ec4899"
  }
};

export const MilkCharts = ({
  results
}: {
  results: MilkTestResult[];
}) => {
  const [selectedChart, setSelectedChart] = useState<'ratings' | 'types' | 'trends' | 'distribution'>('ratings');

  // Prepare data for bar chart - average rating by milk type
  const typeData = results.reduce((acc: {
    [key: string]: {
      count: number;
      total: number;
    };
  }, curr) => {
    const productTypes = curr.property_names || [];

    // If no product types, use 'Unknown'
    if (productTypes.length === 0) {
      if (!acc['Unknown']) {
        acc['Unknown'] = {
          count: 0,
          total: 0
        };
      }
      acc['Unknown'].count += 1;
      acc['Unknown'].total += curr.rating;
      return acc;
    }

    // Otherwise, count for each product type
    productTypes.forEach(type => {
      const displayType = type;
      if (!acc[displayType]) {
        acc[displayType] = {
          count: 0,
          total: 0
        };
      }
      acc[displayType].count += 1;
      acc[displayType].total += curr.rating;
    });
    return acc;
  }, {});
  const barChartData = Object.entries(typeData).map(([type, data]) => ({
    type,
    avgRating: Number((data.total / data.count).toFixed(1)),
    count: data.count
  }));

  // Prepare data for pie chart - rating distribution
  const ratingDistribution = results.reduce((acc: {
    [key: number]: number;
  }, curr) => {
    acc[curr.rating] = (acc[curr.rating] || 0) + 1;
    return acc;
  }, {});
  const pieChartData = Object.entries(ratingDistribution).map(([rating, count]) => ({
    rating: `${rating} Stars`,
    value: count
  }));

  // Prepare data for trend chart
  const trendData = results.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()).map((result, index) => ({
    index,
    rating: result.rating,
    date: new Date(result.created_at).toLocaleDateString()
  }));

  // Calculate moving average for trend smoothing
  const movingAverageData = trendData.map((point, index) => {
    const window = trendData.slice(Math.max(0, index - 2), index + 1);
    const average = window.reduce((sum, p) => sum + p.rating, 0) / window.length;
    return {
      ...point,
      movingAverage: Number(average.toFixed(1))
    };
  });
  const chartButtons = [{
    id: 'ratings' as const,
    label: 'Ratings by Type'
  }, {
    id: 'types' as const,
    label: 'Type Distribution'
  }, {
    id: 'trends' as const,
    label: 'Rating Trends'
  }, {
    id: 'distribution' as const,
    label: 'Rating Distribution'
  }];
  const renderChart = () => {
    switch (selectedChart) {
      case 'ratings':
        return <BarChart data={barChartData} margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 60
        }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="type" angle={-45} textAnchor="end" height={60} />
            <YAxis domain={[0, 5]} />
            <Tooltip />
            <Legend />
            <Bar dataKey="avgRating" name="Average Rating" fill="#8b5cf6" />
            <Bar dataKey="count" name="Number of Tests" fill="#ec4899" />
          </BarChart>;
      case 'types':
        return <PieChart>
            <Pie data={pieChartData} dataKey="value" nameKey="rating" cx="50%" cy="50%" outerRadius={150} label>
              {pieChartData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>;
      case 'trends':
        return <LineChart data={movingAverageData} margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 60
        }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" angle={-45} textAnchor="end" height={60} />
            <YAxis domain={[0, 5]} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="rating" stroke="#8b5cf6" dot={true} name="Rating" />
            <Line type="monotone" dataKey="movingAverage" stroke="#ec4899" dot={false} name="Moving Average" />
          </LineChart>;
      case 'distribution':
        return <AreaChart data={pieChartData} margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 60
        }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="rating" angle={-45} textAnchor="end" height={60} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" name="Number of Ratings" />
          </AreaChart>;
    }
  };

  return (
    <Card className="bg-white rounded-lg shadow-md overflow-hidden">
      <CardContent className="p-0">
        <div className="flex flex-wrap gap-2 mb-6 p-6 pb-0">
          {chartButtons.map(button => (
            <button 
              key={button.id} 
              onClick={() => setSelectedChart(button.id)} 
              className={`px-4 py-2 rounded-full transition-colors ${
                selectedChart === button.id 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {button.label}
            </button>
          ))}
        </div>

        <div className="h-[400px] p-6 pt-0">
          <ChartContainer config={chartConfig}>
            {renderChart()}
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
};
