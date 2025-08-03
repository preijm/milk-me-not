
import React, { useState, useMemo, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend, Area, AreaChart, Brush, LabelList } from "recharts";
import { Search, ChevronLeft, ChevronRight, Filter, Star, TestTube, Package, Building2, X, Eye } from "lucide-react";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { MilkTestResult } from "@/types/milk-test";
import { ProductPropertyBadges } from "@/components/milk-test/ProductPropertyBadges";

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

// Custom tooltip component for individual test results
const TestResultTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <ProductPropertyBadges 
          propertyNames={data.propertyNames}
          flavorNames={data.flavorNames}
          isBarista={data.isBarista}
          compact={true}
          className="mb-2"
        />
        <p className="font-semibold text-gray-800">{data.productName}</p>
        <p className="text-sm text-gray-600">
          Rating: <span className="font-medium">{data.rating}/10</span>
        </p>
        <p className="text-sm text-gray-600">
          Date: <span className="font-medium">{data.date}</span>
        </p>
        {data.username && (
          <p className="text-sm text-gray-600">
            By: <span className="font-medium" translate="no">{data.username}</span>
          </p>
        )}
        {data.shopName && (
          <p className="text-sm text-gray-600">
            Shop: <span className="font-medium">{data.shopName}</span>
          </p>
        )}
      </div>
    );
  }
  return null;
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

  // Enhanced Brand Rating Dashboard Component
  const BrandRatingDashboard = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('rating-desc');
    const [filterBy, setFilterBy] = useState('all');
    const [hoveredBar, setHoveredBar] = useState<number | null>(null);
    const [itemsPerPage, setItemsPerPage] = useState(15);
    const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

    // Process brand data from results
    const processedBrandData = useMemo(() => {
      const brandGroups = results.reduce((acc: {
        [key: string]: {
          ratings: number[];
          tests: number;
          products: Set<string>;
        };
      }, curr) => {
        const brandName = curr.brand_name || 'Unknown';
        if (!acc[brandName]) {
          acc[brandName] = {
            ratings: [],
            tests: 0,
            products: new Set()
          };
        }
        acc[brandName].ratings.push(curr.rating);
        acc[brandName].tests += 1;
        if (curr.product_name) {
          acc[brandName].products.add(curr.product_name);
        }
        return acc;
      }, {});

      return Object.entries(brandGroups).map(([brand, data]) => ({
        name: brand,
        rating: data.ratings.reduce((sum, r) => sum + r, 0) / data.ratings.length,
        tests: data.tests,
        products: Array.from(data.products),
        type: 'brand'
      }));
    }, [results]);

    // Filter and sort data
    const filteredAndSortedData = useMemo(() => {
      let filtered = processedBrandData.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );

      // Apply filter
      if (filterBy === 'high-volume') {
        filtered = filtered.filter(item => item.tests >= 5);
      } else if (filterBy === 'low-volume') {
        filtered = filtered.filter(item => item.tests < 5);
      } else if (filterBy === 'top-rated') {
        filtered = filtered.filter(item => item.rating >= 7);
      } else if (filterBy === 'needs-improvement') {
        filtered = filtered.filter(item => item.rating < 5);
      }

      // Apply sorting
      return filtered.sort((a, b) => {
        switch (sortBy) {
          case 'rating-desc':
            return b.rating - a.rating;
          case 'rating-asc':
            return a.rating - b.rating;
          case 'tests-desc':
            return b.tests - a.tests;
          case 'tests-asc':
            return a.tests - b.tests;
          case 'name-asc':
            return a.name.localeCompare(b.name);
          case 'name-desc':
            return b.name.localeCompare(a.name);
          default:
            return b.rating - a.rating;
        }
      });
    }, [processedBrandData, searchTerm, sortBy, filterBy]);

    // Pagination
    const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentData = filteredAndSortedData.slice(startIndex, startIndex + itemsPerPage);

    // Reset to first page when filters change
    useEffect(() => {
      setCurrentPage(1);
    }, [searchTerm, sortBy, filterBy]);

    // Calculate stats
    const stats = useMemo(() => {
      const topRated = filteredAndSortedData.reduce((prev, current) => 
        prev.rating > current.rating ? prev : current
      );
      const mostTested = filteredAndSortedData.reduce((prev, current) => 
        prev.tests > current.tests ? prev : current
      );
      const avgRating = filteredAndSortedData.reduce((sum, item) => sum + item.rating, 0) / filteredAndSortedData.length;

      return {
        topRated,
        mostTested,
        total: filteredAndSortedData.length,
        avgRating: avgRating || 0
      };
    }, [filteredAndSortedData]);

    const getBarColor = (tests: number) => {
      if (tests >= 10) return 'hsl(var(--destructive))';
      if (tests >= 5) return 'hsl(var(--brand-blue))';
      if (tests >= 3) return 'hsl(var(--primary))';
      return 'hsl(var(--muted-foreground))';
    };

    const getBarOpacity = (index: number) => {
      if (hoveredBar === null) return 1;
      return hoveredBar === index ? 1 : 0.3;
    };

    // Get product data for selected brand
    const getProductDataForBrand = (brandName: string) => {
      const brandResults = results.filter(result => result.brand_name === brandName);
      const productGroups = brandResults.reduce((acc: {
        [key: string]: {
          ratings: number[];
          tests: MilkTestResult[];
        };
      }, curr) => {
        const productName = curr.product_name || 'Unknown Product';
        if (!acc[productName]) {
          acc[productName] = {
            ratings: [],
            tests: []
          };
        }
        acc[productName].ratings.push(curr.rating);
        acc[productName].tests.push(curr);
        return acc;
      }, {});

      return Object.entries(productGroups).map(([product, data]) => ({
        product,
        avgRating: data.ratings.reduce((sum, r) => sum + r, 0) / data.ratings.length,
        testCount: data.tests.length,
        tests: data.tests
      }));
    };

    // Get individual test results for selected product
    const getTestResultsForProduct = (productName: string) => {
      return results
        .filter(result => result.product_name === productName)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    };

    const handleBarClick = (data: any) => {
      setSelectedBrand(data.name);
    };

    const CustomTooltip = ({ active, payload }: any) => {
      if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
          <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg max-w-xs">
            <p className="font-bold text-lg mb-2">{data.name}</p>
            <p className="text-primary font-semibold">
              Rating: {data.rating.toFixed(1)}/10
            </p>
            <p className="text-muted-foreground mb-2">
              Tests: {data.tests} {data.tests === 1 ? 'test' : 'tests'}
            </p>
            <div className="text-sm text-muted-foreground">
              <p><strong>Products:</strong> {data.products.length}</p>
              <p className="truncate"><strong>Includes:</strong> {data.products.slice(0, 2).join(', ')}{data.products.length > 2 ? '...' : ''}</p>
            </div>
            <div className="mt-2 flex items-center">
              <div 
                className="w-4 h-4 rounded mr-2"
                style={{ backgroundColor: getBarColor(data.tests) }}
              />
              <span className="text-sm text-muted-foreground">
                {data.tests >= 10 ? 'High volume' : 
                 data.tests >= 5 ? 'Medium volume' : 
                 data.tests >= 3 ? 'Some tests' : 'Limited tests'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-2 italic">Click bar to view products</p>
          </div>
        );
      }
      return null;
    };

    return (
      <div className="w-full space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-md border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Highest Rated</h3>
                <p className="text-lg font-bold text-primary">{stats.topRated?.name || 'N/A'}</p>
                <p className="text-xs text-muted-foreground">{stats.topRated?.rating.toFixed(1)}/10 rating</p>
              </div>
              <Star className="text-primary w-6 h-6" />
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-md border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Most Tested</h3>
                <p className="text-lg font-bold text-destructive">{stats.mostTested?.name || 'N/A'}</p>
                <p className="text-xs text-muted-foreground">{stats.mostTested?.tests || 0} tests</p>
              </div>
              <TestTube className="text-destructive w-6 h-6" />
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-md border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Total Brands</h3>
                <p className="text-lg font-bold text-brand-blue">{stats.total}</p>
                <p className="text-xs text-muted-foreground">evaluated</p>
              </div>
              <Building2 className="text-brand-blue w-6 h-6" />
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-md border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Average Rating</h3>
                <p className="text-lg font-bold text-primary">{stats.avgRating.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">across all brands</p>
              </div>
              <div className="bg-primary/10 rounded-full p-2">
                <div className="w-4 h-4 bg-primary rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-md border border-white/20">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="relative flex-1 min-w-64">
              <Search className="absolute left-3 top-3 text-muted-foreground w-5 h-5" />
              <input
                type="text"
                placeholder="Search brands..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background"
              />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background"
            >
              <option value="rating-desc">Rating (High to Low)</option>
              <option value="rating-asc">Rating (Low to High)</option>
              <option value="tests-desc">Tests (Most to Least)</option>
              <option value="tests-asc">Tests (Least to Most)</option>
              <option value="name-asc">Name (A to Z)</option>
              <option value="name-desc">Name (Z to A)</option>
            </select>

            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background"
            >
              <option value="all">All Brands</option>
              <option value="high-volume">High Volume (10+ tests)</option>
              <option value="low-volume">Low Volume (&lt;10 tests)</option>
              <option value="top-rated">Top Rated (7+ rating)</option>
              <option value="needs-improvement">Needs Improvement (&lt;5 rating)</option>
            </select>

            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background"
            >
              <option value={10}>10 per page</option>
              <option value={15}>15 per page</option>
              <option value={20}>20 per page</option>
              <option value={25}>25 per page</option>
            </select>
          </div>

          <div className="mt-4 text-sm text-muted-foreground">
            Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredAndSortedData.length)} of {filteredAndSortedData.length} brands
          </div>
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-6 text-sm">
          <div className="flex items-center">
            <div className="w-4 h-4 rounded mr-2" style={{ backgroundColor: 'hsl(var(--destructive))' }}></div>
            <span>High Volume (10+ tests)</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded mr-2" style={{ backgroundColor: 'hsl(var(--brand-blue))' }}></div>
            <span>Medium Volume (5-9 tests)</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded mr-2" style={{ backgroundColor: 'hsl(var(--primary))' }}></div>
            <span>Some Tests (3-4 tests)</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded mr-2" style={{ backgroundColor: 'hsl(var(--muted-foreground))' }}></div>
            <span>Limited Tests (1-2 tests)</span>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-md border border-white/20">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={currentData}
              margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={100}
                interval={0}
                tick={{ fontSize: 10 }}
              />
              <YAxis 
                domain={[0, 10]}
                tick={{ fontSize: 12 }}
                label={{ value: 'Average Rating', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="rating" 
                radius={[4, 4, 0, 0]}
                onMouseEnter={(_, index) => setHoveredBar(index)}
                onMouseLeave={() => setHoveredBar(null)}
                onClick={handleBarClick}
                style={{ cursor: 'pointer' }}
              >
                {currentData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={getBarColor(entry.tests)}
                    fillOpacity={getBarOpacity(index)}
                    stroke={hoveredBar === index ? 'hsl(var(--foreground))' : 'none'}
                    strokeWidth={hoveredBar === index ? 2 : 0}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-white/20 rounded-lg hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            
            <div className="flex gap-2">
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                const pageNum = i + 1;
                const isActive = pageNum === currentPage;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-10 h-10 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-white/80 backdrop-blur-sm border border-white/20 hover:bg-white/90'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-white/20 rounded-lg hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Brand Products Dialog */}
        <Dialog open={!!selectedBrand} onOpenChange={() => setSelectedBrand(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                {selectedBrand} - Product Performance
              </DialogTitle>
            </DialogHeader>
            {selectedBrand && (
              <div className="space-y-4">
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product Name</TableHead>
                        <TableHead>Average Rating</TableHead>
                        <TableHead>Test Count</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getProductDataForBrand(selectedBrand)
                        .sort((a, b) => b.avgRating - a.avgRating)
                        .map((product, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{product.product}</TableCell>
                          <TableCell>
                            <span className="font-semibold text-primary">
                              {product.avgRating.toFixed(1)}/10
                            </span>
                          </TableCell>
                          <TableCell>{product.testCount} tests</TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedProduct(product.product)}
                              className="flex items-center gap-1"
                            >
                              <Eye className="w-4 h-4" />
                              View Tests
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Individual Test Results Dialog */}
        <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
          <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <TestTube className="w-5 h-5" />
                {selectedProduct} - Individual Test Results
              </DialogTitle>
            </DialogHeader>
            {selectedProduct && (
              <div className="space-y-4">
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Shop</TableHead>
                        <TableHead>Properties</TableHead>
                        <TableHead>Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getTestResultsForProduct(selectedProduct).map((test, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            {new Date(test.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <span className="font-semibold text-primary">
                              {test.rating}/10
                            </span>
                          </TableCell>
                          <TableCell translate="no">{test.username || 'Anonymous'}</TableCell>
                          <TableCell translate="no">{test.shop_name || 'N/A'}</TableCell>
                          <TableCell>
                            <ProductPropertyBadges 
                              propertyNames={test.property_names}
                              flavorNames={test.flavor_names}
                              isBarista={test.is_barista}
                              compact={true}
                            />
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <div className="truncate" title={test.notes || ''}>
                              {test.notes || 'No notes'}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    );
  };

  // Prepare data for brand average ratings chart (simple version for other charts)
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
    .sort((a, b) => b.avgRating - a.avgRating);

  // Prepare data for individual test results chart
  const testResultsData = results
    .filter(result => result.product_id) // Only include tests with valid products
    .sort((a, b) => b.rating - a.rating) // Sort by rating from high to low
    .map((result, index) => ({
      id: result.id,
      index: index + 1,
      rating: result.rating,
      productName: `${result.brand_name || 'Unknown'} - ${result.product_name || 'Unknown Product'}`,
      date: new Date(result.created_at).toLocaleDateString(),
      username: result.username,
      shopName: result.shop_name,
      propertyNames: result.property_names || [],
      flavorNames: result.flavor_names || [],
      isBarista: result.is_barista || false
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
    id: 'brands' as const,
    label: 'Brand Dashboard'
  }, {
    id: 'products' as const,
    label: 'All Test Results'
  }, {
    id: 'ratings' as const,
    label: 'Rating per Brand'
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
        return null; // Handled separately in JSX
      case 'products':
        return <BarChart 
          data={testResultsData} 
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 80
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="index" 
            type="number"
            domain={[0, testResultsData.length]}
            tick={{ fontSize: 10 }}
          />
          <YAxis domain={[0, 10]} />
          <Tooltip content={<TestResultTooltip />} />
          <Bar dataKey="rating" name="Rating" fill="#07c167" />
          <Brush dataKey="index" height={30} stroke="#07c167" />
        </BarChart>;
      case 'ratings':
        return <BarChart data={brandChartData} margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 60
        }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="brand" angle={-45} textAnchor="end" height={60} />
            <YAxis domain={[0, 10]} />
            <Tooltip />
            <Legend />
            <Bar dataKey="avgRating" name="Average Rating" fill="hsl(var(--primary))">
              <LabelList dataKey="count" position="top" fontSize={12} />
            </Bar>
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

        <div className={`${selectedChart === 'brands' ? 'min-h-[600px]' : 'h-[600px]'} p-6 pt-0`}>
          {selectedChart === 'brands' ? (
            <BrandRatingDashboard />
          ) : (
            <ChartContainer config={chartConfig}>
              {renderChart()}
            </ChartContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
