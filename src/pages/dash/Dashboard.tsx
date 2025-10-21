import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Dashdiv from "../../components/Dashdiv";
import { LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart, Pie, Cell, Legend } from "recharts";
import { api } from '../../utils/api';
import type { DashboardData, MonthlySalesData, InventorySummary } from '../../utils/api';
import { toast } from 'react-toastify';
import { usePermissions } from '../../hooks/usePermissions';
import { useAuth } from '../../context/AuthContext';

const COLORS = ["#3DAEE9", "#D0FF00", "#FF7A59", "#9B59B6", "#E74C3C"];

function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [monthlySales, setMonthlySales] = useState<MonthlySalesData[]>([]);
  const [inventorySummary, setInventorySummary] = useState<InventorySummary | null>(null);
  const [loading, setLoading] = useState(true);
  
  const companyName = import.meta.env.VITE_COMPANY_NAME;
  const navigate = useNavigate();
  const permissions = usePermissions();
  const { user } = useAuth();

  useEffect(() => {
    // If cashier tries to access dashboard, redirect to sales
    if (!permissions.canViewDashboard) {
      navigate('/sales');
      return;
    }

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        const [dashboardResponse, salesResponse, inventoryResponse] = await Promise.all([
          api.getDashboardData(),
          api.getMonthlySales(),
          api.getInventorySummary()
        ]);
        
        setDashboardData(dashboardResponse);
        setMonthlySales(salesResponse);
        setInventorySummary(inventoryResponse);
        
        // Debug logging to verify revenue data
        console.log('Dashboard Data:', dashboardResponse);
        console.log('Month Sales Revenue:', dashboardResponse?.month_sales);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [permissions.canViewDashboard, navigate]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
    }).format(amount);
  };

  // Redirect cashiers to sales page
  if (!permissions.canViewDashboard) {
    return null;
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome to {companyName} Dashboard</p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome to {companyName} Dashboard, {user?.username}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Dashdiv 
          heading="Monthly Revenue" 
          text={formatCurrency(dashboardData?.month_sales || 0)} 
          footer={`${(dashboardData?.month_growth ?? 0) > 0 ? '+' : ''}${dashboardData?.month_growth ?? 0}% from last month`}
          color="text-yellow-600" 
          route="/sales"
        />
        <Dashdiv 
          heading="Sales Today" 
          text={formatCurrency(dashboardData?.today_sales || 0)} 
          footer={`${dashboardData?.today_orders || 0} orders today`} 
          color="text-[#3DAEE9]" 
          route="/sales"
        />
        <Dashdiv 
          heading="Total Schools" 
          text={dashboardData?.total_schools.toString() || '0'} 
          footer="Active school partners" 
          color="text-green-600" 
          route="/schools"
        />
        <Dashdiv 
          heading="Low Stock Items" 
          text={dashboardData?.low_stock_items.toString() || '0'} 
          footer="Needs attention" 
          color="text-yellow-600" 
          route="/inventory"
        />
        <Dashdiv 
          heading="Out of Stock Items" 
          text={dashboardData?.out_of_stock_items.toString() || '0'} 
          footer="Needs restocking" 
          color="text-red-600" 
          route="/inventory"
        />
      </div>
     
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Sales Overview per month
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlySales}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), 'Sales']}
                />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="#3DAEE9"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Inventory Overview</h2>
          <div className="h-64">
            {inventorySummary?.top_variants && inventorySummary.top_variants.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={inventorySummary.top_variants.map(variant => ({
                      name: variant.variant,
                      value: variant.quantity
                    }))}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    innerRadius={40}
                    paddingAngle={4}
                  >
                    {inventorySummary.top_variants.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No inventory data available
              </div>
            )}
          </div>
        </div>
      </div>  
    </div>
  );
}

export default Dashboard