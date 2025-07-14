
import React, { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend, Area, AreaChart } from "recharts";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { Card, CardContent } from "@/components/ui/card";
import { MilkTestResult } from "@/types/milk-test";

const COLORS = [
  "hsl(var(--primary))", 
  "hsl(var(--brand-blue))", 
  "hsl(40 100% 70%)", // warm yellow
  "hsl(120 60% 50%)", // green
  "hsl(280 60% 60%)"  // purple
];
const chartConfig = {
  rating: {
    color: "hsl(var(--primary))"
  },
  count: {
    color: "hsl(var(--brand-blue))"
  }
};

export const MilkCharts = ({
  results
}: {
  results: MilkTestResult[];
}) => {
  const [selectedChart, setSelectedChart] = useState<'ratings' | 'types' | 'trends' | 'distribution' | 'brands' | 'products'>('brands');

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

  // Prepare data for brand average ratings chart
  const brandData = results.reduce((acc: {
    [key: string]: {
      count: number;
      total: number;
    };
  }, curr) => {
    const brandName = curr.brand_name || 'Unknown';
    if (!acc[brandName]) {
      acc[brandName] = {
        count: 0,
        total: 0
      };
    }
    acc[brandName].count += 1;
    acc[brandName].total += curr.rating;
    return acc;
  }, {});
  const brandChartData = Object.entries(brandData)
    .map(([brand, data]) => ({
      brand,
      avgRating: Number((data.total / data.count).toFixed(1)),
      count: data.count
    }))
    .sort((a, b) => b.avgRating - a.avgRating)
    .slice(0, 30); // Show top 30 brands

  // Prepare data for top 10 products chart
  const productData = results.reduce((acc: {
    [key: string]: {
      count: number;
      total: number;
      brandName: string;
      productName: string;
    };
  }, curr) => {
    if (!curr.product_id) return acc;
    
    const key = curr.product_id;
    if (!acc[key]) {
      acc[key] = {
        count: 0,
        total: 0,
        brandName: curr.brand_name || 'Unknown',
        productName: curr.product_name || 'Unknown Product'
      };
    }
    acc[key].count += 1;
    acc[key].total += curr.rating;
    return acc;
  }, {});
  const topProductsData = Object.entries(productData)
    .map(([productId, data]) => ({
      productId,
      productName: `${data.brandName} - ${data.productName}`,
      avgRating: Number((data.total / data.count).toFixed(1)),
      count: data.count
    }))
    .sort((a, b) => b.avgRating - a.avgRating)
    .slice(0, 10); // Show top 10 products

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
    id: 'brands' as const,
    label: 'Avg Rating per Brand'
  }, {
    id: 'products' as const,
    label: 'Top 10 Best Products'
  }, {
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
      case 'brands':
        return <BarChart 
          data={brandChartData} 
          layout="horizontal"
          margin={{
            top: 20,
            right: 30,
            left: 100,
            bottom: 20
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" domain={[0, 10]} />
          <YAxis 
            type="category" 
            dataKey="brand" 
            width={90}
            tick={{ fontSize: 12 }}
          />
          <Tooltip />
          <Bar dataKey="avgRating" name="Average Rating" fill="hsl(var(--primary))" />
        </BarChart>;
      case 'products':
        return <BarChart 
          data={topProductsData} 
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 100
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="productName" 
            angle={-45} 
            textAnchor="end" 
            height={100}
            tick={{ fontSize: 10 }}
          />
          <YAxis domain={[0, 10]} />
          <Tooltip />
          <Bar dataKey="avgRating" name="Average Rating" fill="hsl(var(--primary))" />
        </BarChart>;
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
            <Bar dataKey="avgRating" name="Average Rating" fill="hsl(var(--primary))" />
            <Bar dataKey="count" name="Number of Tests" fill="hsl(var(--brand-blue))" />
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
            <Line type="monotone" dataKey="rating" stroke="hsl(var(--primary))" dot={true} name="Rating" />
            <Line type="monotone" dataKey="movingAverage" stroke="hsl(var(--brand-blue))" dot={false} name="Moving Average" />
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
            <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" name="Number of Ratings" />
          </AreaChart>;
    }
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden animate-fade-in">
      <CardContent className="p-0">
        <div className="flex flex-wrap gap-2 mb-6 p-6 pb-0 bg-white/50 backdrop-blur-sm">
          {chartButtons.map(button => (
            <button 
              key={button.id} 
              onClick={() => setSelectedChart(button.id)} 
              className={`px-4 py-2 rounded-full transition-colors ${
                selectedChart === button.id 
                  ? 'bg-[hsl(var(--primary))] text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {button.label}
            </button>
          ))}
        </div>

        <div className="h-[600px] p-6 pt-0">
          <ChartContainer config={chartConfig}>
            {renderChart()}
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
};
