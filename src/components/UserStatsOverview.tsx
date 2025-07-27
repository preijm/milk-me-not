import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MilkTestResult } from "@/types/milk-test";

interface Stats {
  activeMembers: number;
  totalTests: number;
  productsReviewed: number;
  brandsCovered: number;
}

export const UserStatsOverview = ({
  results
}: {
  results: MilkTestResult[];
}) => {
  const avgRating = results.length ? (results.reduce((acc, curr) => acc + curr.rating, 0) / results.length).toFixed(1) : "0.0";
  const uniqueBrands = [...new Set(results.map(r => r.brand_name).filter(Boolean))];

  // Calculate latest test
  const latestTest = results.length ? [...results].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0] : null;

  // Calculate most tested brand
  const brandCounts = results.reduce((acc: Record<string, number>, curr) => {
    const brand = curr.brand_name || "Unknown";
    acc[brand] = (acc[brand] || 0) + 1;
    return acc;
  }, {});
  const mostTestedBrand = results.length ? Object.entries(brandCounts).sort((a, b) => {
    const countDiff = b[1] - a[1];
    return countDiff !== 0 ? countDiff : a[0].localeCompare(b[0]);
  })[0]?.[0] : "None";

  // Calculate most tested product type (from product names)
  const productTypeCounts = results.reduce((acc: Record<string, number>, curr) => {
    const productName = curr.product_name || "Unknown";
    acc[productName] = (acc[productName] || 0) + 1;
    return acc;
  }, {});
  
  const mostTestedProductType = results.length ? Object.entries(productTypeCounts).sort((a, b) => {
    const countDiff = b[1] - a[1];
    return countDiff !== 0 ? countDiff : a[0].localeCompare(b[0]);
  })[0]?.[0] : "None";

  // Format date for latest test
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };
  return <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4">
      <div className="bg-white border border-blue-200 rounded-lg p-2 sm:p-4 transition-all duration-200 hover:shadow-sm">
        <p className="text-xs sm:text-sm text-gray-600 mb-1">Average Rating</p>
        <p className="text-lg sm:text-2xl font-semibold text-gray-900">{avgRating}/10</p>
      </div>
      
      <div className="bg-white border border-green-200 rounded-lg p-2 sm:p-4 transition-all duration-200 hover:shadow-sm">
        <p className="text-xs sm:text-sm text-gray-600 mb-1">Total Tests</p>
        <p className="text-lg sm:text-2xl font-semibold text-gray-900">{results.length}</p>
      </div>
      
      <div className="bg-white border border-purple-200 rounded-lg p-2 sm:p-4 transition-all duration-200 hover:shadow-sm">
        <p className="text-xs sm:text-sm text-gray-600 mb-1">Unique Brands</p>
        <p className="text-lg sm:text-2xl font-semibold text-gray-900">{uniqueBrands.length}</p>
      </div>
      
      <div className="bg-white border border-orange-200 rounded-lg p-2 sm:p-4 transition-all duration-200 hover:shadow-sm">
        <p className="text-xs sm:text-sm text-gray-600 mb-1">Latest Test</p>
        <p className="text-sm sm:text-lg font-semibold text-gray-900 leading-tight">
          {latestTest ? formatDate(latestTest.created_at) : 'None'}
        </p>
      </div>
      
      <div className="bg-white border border-indigo-200 rounded-lg p-2 sm:p-4 transition-all duration-200 hover:shadow-sm">
        <p className="text-xs sm:text-sm text-gray-600 mb-1">Most Tested Brand</p>
        <p className="text-sm sm:text-lg font-semibold text-gray-900 truncate">{mostTestedBrand}</p>
      </div>
      
      <div className="bg-white border border-pink-200 rounded-lg p-2 sm:p-4 transition-all duration-200 hover:shadow-sm">
        <p className="text-xs sm:text-sm text-gray-600 mb-1">Most Tested Product</p>
        <p className="text-sm sm:text-lg font-semibold text-gray-900 truncate">{mostTestedProductType}</p>
      </div>
    </div>;
};

// New component for home page stats
export const HomeStatsOverview = () => {
  const [stats, setStats] = useState<Stats>({
    activeMembers: 0,
    totalTests: 0,
    productsReviewed: 0,
    brandsCovered: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get active members count
        const { count: membersCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        // Get total tests count
        const { count: totalTestsCount } = await supabase
          .from('milk_tests')
          .select('*', { count: 'exact', head: true });

        // Get unique products reviewed count
        const { data: uniqueProducts } = await supabase
          .from('milk_tests')
          .select('product_id')
          .not('product_id', 'is', null);
        
        const uniqueProductCount = uniqueProducts ? 
          new Set(uniqueProducts.map(item => item.product_id)).size : 0;

        // Get brands covered count
        const { count: brandsCount } = await supabase
          .from('brands')
          .select('*', { count: 'exact', head: true });

        setStats({
          activeMembers: membersCount || 0,
          totalTests: totalTestsCount || 0,
          productsReviewed: uniqueProductCount,
          brandsCovered: brandsCount || 0
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="py-16">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-12 bg-gray-200 rounded mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-32 mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K+';
    }
    return num.toString() + '+';
  };

  return (
    <div className="py-12">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center mb-8 mt-8">
          <div className="animate-fade-in bg-white/10 backdrop-blur-sm border-2 border-gray-300 rounded-lg p-4 md:p-6 hover:bg-white/20 transition-all duration-300 shadow-sm">
            <div className="text-2xl md:text-4xl lg:text-5xl font-bold mb-2 md:mb-4" style={{ color: '#00BF63' }}>
              {formatNumber(stats.activeMembers)}
            </div>
            <div className="text-sm md:text-lg text-gray-600">
              Active Members
            </div>
          </div>
          <div className="animate-fade-in bg-white/10 backdrop-blur-sm border-2 border-gray-300 rounded-lg p-4 md:p-6 hover:bg-white/20 transition-all duration-300 shadow-sm">
            <div className="text-2xl md:text-4xl lg:text-5xl font-bold mb-2 md:mb-4" style={{ color: '#00BF63' }}>
              {formatNumber(stats.totalTests)}
            </div>
            <div className="text-sm md:text-lg text-gray-600">
              Total Tests
            </div>
          </div>
          <div className="animate-fade-in bg-white/10 backdrop-blur-sm border-2 border-gray-300 rounded-lg p-4 md:p-6 hover:bg-white/20 transition-all duration-300 shadow-sm">
            <div className="text-2xl md:text-4xl lg:text-5xl font-bold mb-2 md:mb-4" style={{ color: '#00BF63' }}>
              {formatNumber(stats.productsReviewed)}
            </div>
            <div className="text-sm md:text-lg text-gray-600">
              Products Reviewed
            </div>
          </div>
          <div className="animate-fade-in bg-white/10 backdrop-blur-sm border-2 border-gray-300 rounded-lg p-4 md:p-6 hover:bg-white/20 transition-all duration-300 shadow-sm">
            <div className="text-2xl md:text-4xl lg:text-5xl font-bold mb-2 md:mb-4" style={{ color: '#00BF63' }}>
              {formatNumber(stats.brandsCovered)}
            </div>
            <div className="text-sm md:text-lg text-gray-600">
              Brands Covered
            </div>
          </div>
        </div>
        
        <div className="text-center animate-fade-in">
          <a 
            href="/results" 
            className="inline-flex items-center px-8 py-3 bg-transparent border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-semibold rounded-lg transition-colors duration-200 text-lg"
          >
            View All Results
          </a>
        </div>
      </div>
    </div>
  );
};