import { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import type { Sale, School, Inventory, PaginatedResponse } from '../../utils/api';
import { toast } from 'react-toastify';
import { usePermissions } from '../../hooks/usePermissions';
import { useAuth } from '../../context/AuthContext';

// Define the Return type based on the backend Return model
interface Return {
  id: number;
  sale: number; // Sale ID
  reason: string;
  returned_on: string;
  received_by: number | null;
}

// Update Sale type to match the new backend model
interface UpdatedSale {
  id: number;
  inventory: number;
  quantity: number;
  total: string; // DecimalField as string
  selling_price: string; // DecimalField as string
  sold_by: number | null;
  sold_on: string;
  inventory_details?: {
    id: number;
    variant: string;
    size_details: { id: number; label: string };
    school_details: { id: number; name: string };
    quantity: number;
  };
  returns?: Return[]; // Add returns to track associated returns
}

const Sales = () => {
  const [salesData, setSalesData] = useState<PaginatedResponse<UpdatedSale> | null>(null);
  const [schools, setSchools] = useState<School[]>([]);
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<string>('-sold_on');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  
  const permissions = usePermissions();
  const { user } = useAuth();

  // Modal states
  const [showSortModal, setShowSortModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState<UpdatedSale | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Form data for new sale
  const [saleFormData, setSaleFormData] = useState({
    inventory: '',
    quantity: 1,
    selling_price: '',
  });

  // Form data for new return
  const [returnFormData, setReturnFormData] = useState({
    reason: '',
  });

  // Fetch data
  useEffect(() => {
    fetchData();
    fetchDropdownData();
  }, [searchTerm, sortBy, currentPage, pageSize]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        ordering: sortBy,
        page_size: pageSize,
      };
      if (searchTerm) params.search = searchTerm;

      const response = await api.getSales(params);
      if (Array.isArray(response)) {
        setSalesData({
          results: response,
          count: response.length,
          next: null,
          previous: null,
        });
      } else {
        setSalesData(response);
      }
    } catch (error) {
      console.error('Failed to fetch sales:', error);
      toast.error('Failed to load sales data');
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdownData = async () => {
    try {
      const [schoolsData, inventoryData] = await Promise.all([
        api.getSchools(),
        api.getInventory(),
      ]);
      if (Array.isArray(schoolsData)) {
        setSchools(schoolsData);
      } else {
        setSchools(schoolsData.results || []);
      }
      setInventory(inventoryData.results || []);
    } catch (error) {
      console.error('Failed to fetch dropdown data:', error);
    }
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
    }).format(parseFloat(amount));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleSort = (criteria: string) => {
    setSortBy(criteria);
    setCurrentPage(1);
    setShowSortModal(false);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  const openActionModal = (sale: UpdatedSale) => {
    setSelectedSale(sale);
    setShowActionModal(true);
  };

  const openDetailsModal = (sale: UpdatedSale) => {
    setSelectedSale(sale);
    setShowDetailsModal(true);
    setShowActionModal(false);
  };

  const openAddModal = () => {
    setSaleFormData({
      inventory: '',
      quantity: 1,
      selling_price: '',
    });
    setShowAddModal(true);
  };

  const openReturnModal = (sale: UpdatedSale) => {
    setSelectedSale(sale);
    setReturnFormData({ reason: '' });
    setShowReturnModal(true);
    setShowActionModal(false);
  };

  const handleCreateSale = async () => {
    try {
      setFormLoading(true);
        const data = {
        inventory: parseInt(saleFormData.inventory),
        quantity: saleFormData.quantity,
        selling_price: parseFloat(saleFormData.selling_price),
        total: (saleFormData.quantity * parseFloat(saleFormData.selling_price)).toFixed(2),
        sold_by: user?.id || 1,
      };

      await api.createSale(data);
      toast.success('Sale created successfully');
      setShowAddModal(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create sale');
    } finally {
      setFormLoading(false);
    }
  };

  const handleCreateReturn = async () => {
    if (!selectedSale) return;
    try {
      setFormLoading(true);
      const data = {
        sale: selectedSale.id,
        reason: returnFormData.reason,
        received_by: user?.id || 1,
      };

      await api.createReturn(data); 
      toast.success('Return created successfully');
      setShowReturnModal(false);
      setSelectedSale(null);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create return');
    } finally {
      setFormLoading(false);
    }
  };

  // Summary stats with daily breakdown
  const getSummaryStats = () => {
    if (!salesData?.results) return { 
      total: 0, 
      revenue: 0, 
      returns: 0, 
      todaySales: 0, 
      todayRevenue: 0,
      yesterdayRevenue: 0 
    };
    
    const sales = salesData.results;
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Format dates for comparison (YYYY-MM-DD)
    const todayStr = today.toISOString().split('T')[0];
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    const todaysSales = sales.filter(sale => {
      const saleDate = new Date(sale.sold_on).toISOString().split('T')[0];
      return saleDate === todayStr;
    });
    
    const yesterdaysSales = sales.filter(sale => {
      const saleDate = new Date(sale.sold_on).toISOString().split('T')[0];
      return saleDate === yesterdayStr;
    });
    
    return {
      total: salesData.count,
      revenue: sales.reduce((sum, sale) => sum + parseFloat(sale.total), 0),
      returns: sales.filter((sale) => sale.returns && sale.returns.length > 0).length,
      todaySales: todaysSales.length,
      todayRevenue: todaysSales.reduce((sum, sale) => sum + parseFloat(sale.total), 0),
      yesterdayRevenue: yesterdaysSales.reduce((sum, sale) => sum + parseFloat(sale.total), 0),
    };
  };

  const stats = getSummaryStats();

  if (loading && !salesData) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Sales Management</h1>
        <p className="text-gray-600">
          {permissions.canProcessReturns 
            ? 'Manage customer orders and returns' 
            : 'Manage customer orders'}
        </p>
      </div>

      {/* Search and Filters */}
      <div className={`mb-4 grid grid-cols-1 gap-4 text-black ${
        permissions.canCreateSale 
          ? 'md:grid-cols-3 lg:grid-cols-5' 
          : 'md:grid-cols-3 lg:grid-cols-4'
      }`}>
        <div className="col-span-2">
          <input
            type="text"
            placeholder="Search sales..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        
        <select
          value={pageSize}
          onChange={(e) => handlePageSizeChange(parseInt(e.target.value))}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value={10}>10 per page</option>
          <option value={20}>20 per page</option>
          <option value={50}>50 per page</option>
          <option value={100}>100 per page</option>
        </select>
        
        <button
          onClick={() => setShowSortModal(true)}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 flex items-center space-x-2"
        >
          <span>Sort by</span>
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
            {sortBy === '-sold_on' && 'Latest'}
            {sortBy === 'sold_on' && 'Oldest'}
            {sortBy === '-total' && 'High $'}
            {sortBy === 'total' && 'Low $'}
            {sortBy === '-id' && 'New ID'}
            {sortBy === 'id' && 'Old ID'}
          </span>
        </button>
        
        {permissions.canCreateSale && (
          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            + New Sale
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className={`grid grid-cols-1 gap-4 mb-6 ${
        permissions.canProcessReturns 
          ? 'md:grid-cols-2 lg:grid-cols-4' 
          : 'md:grid-cols-2'
      }`}>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-500">Total Sales</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-500">Today's Sales</h3>
          <p className="text-2xl font-bold text-blue-600 mt-1">{stats.todaySales}</p>
          <p className="text-xs text-gray-400 mt-1">Sales made today</p>
        </div>
        
        {permissions.canProcessReturns && (
          <>
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-sm font-medium text-gray-500">Today's Sales</h3>
              <p className="text-2xl font-bold text-green-600 mt-1">{formatCurrency(stats.todayRevenue.toString())}</p>
              <p className="text-xs text-gray-400 mt-1">
                {stats.yesterdayRevenue > 0 && (
                  <span className={`${
                    stats.todayRevenue > stats.yesterdayRevenue 
                      ? 'text-green-500' 
                      : stats.todayRevenue < stats.yesterdayRevenue 
                      ? 'text-red-500' 
                      : 'text-gray-500'
                  }`}>
                    {stats.todayRevenue > stats.yesterdayRevenue ? '↑' : stats.todayRevenue < stats.yesterdayRevenue ? '↓' : '→'} 
                    vs yesterday
                  </span>
                )}
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-sm font-medium text-gray-500">Returned Sales</h3>
              <p className="text-2xl font-bold text-red-600 mt-1">{stats.returns}</p>
              <p className="text-xs text-gray-400 mt-1">Total returns</p>
            </div>
          </>
        )}
      </div>

      {/* Sales Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  School
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unit Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {salesData?.results?.map((sale) => (
                <tr key={sale.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{sale.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>
                      <div className="font-medium">{sale.inventory_details?.variant || 'N/A'}</div>
                      <div className="text-xs text-gray-400">
                        Size: {sale.inventory_details?.size_details?.label || 'N/A'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {sale.inventory_details?.school_details?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {sale.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatCurrency(sale.selling_price)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(sale.total)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        sale.returns && sale.returns.length > 0
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {sale.returns && sale.returns.length > 0 ? 'Returned' : 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(sale.sold_on)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => openActionModal(sale)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      •••
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {salesData && (salesData.previous || salesData.next) && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              {salesData.previous && (
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Previous
                </button>
              )}
              {salesData.next && (
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Next
                </button>
              )}
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing page <span className="font-medium">{currentPage}</span> of{' '}
                  <span className="font-medium">{Math.ceil(salesData.count / pageSize)}</span> (
                  {salesData.count} total sales, {pageSize} per page)
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  {salesData.previous && (
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      Previous
                    </button>
                  )}
                  {salesData.next && (
                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      Next
                    </button>
                  )}
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sort Modal */}
      {showSortModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-80">
            <h3 className="text-lg font-semibold text-black mb-4">Sort By</h3>
            <ul className="space-y-3">
              <li>
                <button
                  onClick={() => handleSort('-sold_on')}
                  className={`w-full text-left p-2 rounded ${
                    sortBy === '-sold_on'
                      ? 'bg-blue-100 text-blue-800 border border-blue-300'
                      : 'text-black hover:bg-gray-200'
                  }`}
                >
                  Latest First {sortBy === '-sold_on' && '✓'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleSort('sold_on')}
                  className={`w-full text-left p-2 rounded ${
                    sortBy === 'sold_on'
                      ? 'bg-blue-100 text-blue-800 border border-blue-300'
                      : 'text-black hover:bg-gray-200'
                  }`}
                >
                  Oldest First {sortBy === 'sold_on' && '✓'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleSort('-total')}
                  className={`w-full text-left p-2 rounded ${
                    sortBy === '-total'
                      ? 'bg-blue-100 text-blue-800 border border-blue-300'
                      : 'text-black hover:bg-gray-200'
                  }`}
                >
                  Highest Amount {sortBy === '-total' && '✓'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleSort('total')}
                  className={`w-full text-left p-2 rounded ${
                    sortBy === 'total'
                      ? 'bg-blue-100 text-blue-800 border border-blue-300'
                      : 'text-black hover:bg-gray-200'
                  }`}
                >
                  Lowest Amount {sortBy === 'total' && '✓'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleSort('-id')}
                  className={`w-full text-left p-2 rounded ${
                    sortBy === '-id'
                      ? 'bg-blue-100 text-blue-800 border border-blue-300'
                      : 'text-black hover:bg-gray-200'
                  }`}
                >
                  Sale ID (Newest) {sortBy === '-id' && '✓'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleSort('id')}
                  className={`w-full text-left p-2 rounded ${
                    sortBy === 'id'
                      ? 'bg-blue-100 text-blue-800 border border-blue-300'
                      : 'text-black hover:bg-gray-200'
                  }`}
                >
                  Sale ID (Oldest) {sortBy === 'id' && '✓'}
                </button>
              </li>
            </ul>
            <div className="mt-6 text-right">
              <button
                onClick={() => setShowSortModal(false)}
                className="px-4 py-2 bg-gray-200 rounded text-black hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Modal */}
      {showActionModal && selectedSale && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-80">
            <h3 className="text-lg font-semibold text-black mb-4">Actions</h3>
            <ul className="space-y-3">
              <li>
                <button
                  onClick={() => openDetailsModal(selectedSale)}
                  className="w-full text-left p-2 rounded text-black hover:bg-gray-200"
                >
                  View Details
                </button>
              </li>
              {!selectedSale.returns?.length && permissions.canProcessReturns && (
                <li>
                  <button
                    onClick={() => openReturnModal(selectedSale)}
                    className="w-full text-left p-2 rounded text-red-600 hover:bg-red-100"
                  >
                    Process Return
                  </button>
                </li>
              )}
            </ul>
            <div className="mt-6 text-right">
              <button
                onClick={() => setShowActionModal(false)}
                className="px-4 py-2 bg-gray-200 rounded text-black hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sale Details Modal */}
      {showDetailsModal && selectedSale && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-black mb-4">Sale Details #{selectedSale.id}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Item</label>
                <div className="text-sm text-gray-900">
                  <div>{selectedSale.inventory_details?.name || 'N/A'}</div>
                  <div>{selectedSale.inventory_details?.variant || 'N/A'}</div>
                  <div className="text-gray-600">
                    Size: {selectedSale.inventory_details?.size_details?.label || 'N/A'}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">School</label>
                <div className="text-sm text-gray-900">
                  {selectedSale.inventory_details?.school_details?.name || 'N/A'}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Quantity</label>
                  <div className="text-sm text-gray-900">{selectedSale.quantity}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Unit Price</label>
                  <div className="text-sm text-gray-900">{formatCurrency(selectedSale.selling_price)}</div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Total</label>
                <div className="text-lg font-bold text-gray-900">{formatCurrency(selectedSale.total)}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    selectedSale.returns && selectedSale.returns.length > 0
                      ? 'bg-red-100 text-red-800'
                      : 'bg-green-100 text-green-800'
                  }`}
                >
                  {selectedSale.returns && selectedSale.returns.length > 0 ? 'Returned' : 'Active'}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Sold On</label>
                <div className="text-sm text-gray-900">{formatDate(selectedSale.sold_on)}</div>
              </div>
              {selectedSale.returns && selectedSale.returns.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Return Details</label>
                  <div className="text-sm text-gray-900">
                    <div>Reason: {selectedSale.returns[0].reason}</div>
                    <div>Returned On: {formatDate(selectedSale.returns[0].returned_on)}</div>
                  </div>
                </div>
              )}
            </div>
            <div className="mt-6 text-right">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 bg-gray-200 rounded text-black hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Sale Modal */}
      {showAddModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 text-black">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-black mb-4">Create New Sale</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Inventory Item *</label>
                <select
                  value={saleFormData.inventory}
                  onChange={(e) => setSaleFormData({ ...saleFormData, inventory: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Item</option>
                  {inventory.filter((item) => item.quantity > 0).map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.variant} -{item.uniformType_details?.name} {item.size_details?.label} ({item.school_details?.name}) - Stock: {item.quantity}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Quantity *</label>
                <input
                  type="number"
                  min="1"
                  value={saleFormData.quantity}
                  onChange={(e) => setSaleFormData({ ...saleFormData, quantity: parseInt(e.target.value) || 1 })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Selling Price for each (KES) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={saleFormData.selling_price}
                  onChange={(e) => setSaleFormData({ ...saleFormData, selling_price: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
            <div className="mt-6 flex justify-between">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-gray-200 rounded text-black hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateSale}
                disabled={formLoading || !saleFormData.inventory || !saleFormData.selling_price}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {formLoading ? 'Saving...' : 'Create Sale'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Return Modal */}
      {showReturnModal && selectedSale && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 text-black">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-black mb-4">Process Return for Sale #{selectedSale.id}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Reason for Return *</label>
                <textarea
                  value={returnFormData.reason}
                  onChange={(e) => setReturnFormData({ ...returnFormData, reason: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  rows={3}
                  placeholder="Enter reason for return..."
                  required
                />
              </div>
            </div>
            <div className="mt-6 flex justify-between">
              <button
                onClick={() => setShowReturnModal(false)}
                className="px-4 py-2 bg-gray-200 rounded text-black hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateReturn}
                disabled={formLoading || !returnFormData.reason}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              >
                {formLoading ? 'Processing...' : 'Process Return'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sales;