import { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import type { Inventory as InventoryItem, School, Size, PaginatedResponse, UniformType } from '../../utils/api';
import { toast } from 'react-toastify';
import { usePermissions } from '../../hooks/usePermissions';

const Inventory = () => {
  const [inventoryData, setInventoryData] = useState<PaginatedResponse<InventoryItem> | null>(null);
  const [schools, setSchools] = useState<School[]>([]);
  const [sizes, setSizes] = useState<Size[]>([]);
  const [uniformTypes, setUniformTypes] = useState<UniformType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');
  const [sortBy, setSortBy] = useState<string>('-updated_at');
  const [currentPage, setCurrentPage] = useState(1);
  
  const permissions = usePermissions();
  
  // Modal states
  const [showSortModal, setShowSortModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    variant: '',
    school: '',
    uniformType: '',
    size: '',
    quantity: 0,
    b_price: '',
    s_price: '',
    minimum_quantity: 10
  });

  // Fetch data
  useEffect(() => {
    fetchData();
    fetchDropdownData();
  }, [searchTerm, statusFilter, sortBy, currentPage]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        ordering: sortBy
      };
      
      if (searchTerm) params.search = searchTerm;
      if (statusFilter !== 'all') params.status = statusFilter;
      
      const response = await api.getInventory(params);
      setInventoryData(response);
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
      toast.error('Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdownData = async () => {
    try {
      const [schoolsData, sizesData, uniformTypesData] = await Promise.all([
        api.getSchools(),
        api.getSizes(),
        api.getUniformTypes()
      ]);
      // Handle both array and paginated response formats
      if (Array.isArray(schoolsData)) {
        setSchools(schoolsData);
      } else {
        setSchools(schoolsData.results || []);
      }
      if (Array.isArray(sizesData)) {
        setSizes(sizesData);
      } else {
        setSizes(sizesData.results || []);
      }
      if (Array.isArray(uniformTypesData)) {
        setUniformTypes(uniformTypesData);
      } else {
        setUniformTypes(uniformTypesData.results || []);
      }
    } catch (error) {
      console.error('Failed to fetch dropdown data:', error);
    }
  };

  const getStockStatus = (item: InventoryItem) => {
    if (item.quantity === 0) return { status: 'Out of Stock', color: 'bg-red-100 text-red-800' };
    if (item.quantity <= item.minimum_quantity) return { status: 'Low Stock', color: 'bg-yellow-100 text-yellow-800' };
    return { status: 'In Stock', color: 'bg-green-100 text-green-800' };
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

  const handleStatusFilter = (status: typeof statusFilter) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const openActionModal = (item: InventoryItem) => {
    setSelectedItem(item);
    setShowActionModal(true);
  };

  const openEditModal = () => {
    if (selectedItem) {
      setFormData({
        variant: selectedItem.variant,
        school: selectedItem.school.toString(),
        uniformType: selectedItem.uniformType.toString(),
        size: selectedItem.size.toString(),
        quantity: selectedItem.quantity,
        b_price: selectedItem.b_price,
        s_price: selectedItem.s_price,
        minimum_quantity: selectedItem.minimum_quantity
      });
      setShowEditModal(true);
      setShowActionModal(false);
    }
  };

  const openAddModal = () => {
    setFormData({
      variant: '',
      school: '',
      uniformType: '',
      size: '',
      quantity: 0,
      b_price: '',
      s_price: '',
      minimum_quantity: 10
    });
    setShowAddModal(true);
  };

  const handleDelete = async () => {
    if (selectedItem) {
      try {
        await api.deleteInventoryItem(selectedItem.id);
        toast.success('Item deleted successfully');
        fetchData();
        setShowActionModal(false);
        setSelectedItem(null);
      } catch (error) {
        toast.error('Failed to delete item');
      }
    }
  };

  const handleSubmit = async (isEdit: boolean = false) => {
    try {
      setFormLoading(true);
      
      const data = {
        variant: formData.variant,
        school: parseInt(formData.school),
        uniformType: parseInt(formData.uniformType),
        size: parseInt(formData.size),
        quantity: formData.quantity,
        b_price: formData.b_price,
        s_price: formData.s_price,
        minimum_quantity: formData.minimum_quantity
      };

      if (isEdit && selectedItem) {
        await api.updateInventoryItem(selectedItem.id, data);
        toast.success('Item updated successfully');
        setShowEditModal(false);
      } else {
        await api.createInventoryItem(data);
        toast.success('Item added successfully');
        setShowAddModal(false);
      }
      
      fetchData();
      setSelectedItem(null);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Operation failed');
    } finally {
      setFormLoading(false);
    }
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
    }).format(parseFloat(amount));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  // Summary stats
  const getSummaryStats = () => {
    if (!inventoryData?.results) return { total: 0, inStock: 0, lowStock: 0, outOfStock: 0 };
    
    const items = inventoryData.results;
    return {
      total: inventoryData.count,
      inStock: items.filter(item => item.quantity > item.minimum_quantity).length,
      lowStock: items.filter(item => item.quantity > 0 && item.quantity <= item.minimum_quantity).length,
      outOfStock: items.filter(item => item.quantity === 0).length
    };
  };

  const stats = getSummaryStats();

  if (loading && !inventoryData) {
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
        <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
        <p className="text-gray-600">
          {permissions.canManageInventory 
            ? 'Manage inventory items and stock levels' 
            : 'View inventory items and stock levels'}
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-4 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 text-black">
        <div className="col-span-2">
          <input
            type="text"
            placeholder="Search inventory..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => handleStatusFilter(e.target.value as typeof statusFilter)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="in_stock">In Stock</option>
          <option value="low_stock">Low Stock</option>
          <option value="out_of_stock">Out of Stock</option>
        </select>

        <button
          onClick={() => setShowSortModal(true)}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
        >
          Sort by
        </button>

        {permissions.canManageInventory && (
          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            + Add Item
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-500">Total Items</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-500">In Stock</h3>
          <p className="text-2xl font-bold text-green-600 mt-1">{stats.inStock}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-500">Low Stock</h3>
          <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.lowStock}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-500">Out of Stock</h3>
          <p className="text-2xl font-bold text-red-600 mt-1">{stats.outOfStock}</p>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  School
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Variant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Uniform Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Updated
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {inventoryData?.results?.map((item) => {
                const stockStatus = getStockStatus(item);
                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{item.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.school_details?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.variant}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.uniformType_details?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.size_details?.label || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(item.s_price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${stockStatus.color}`}>
                        {stockStatus.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(item.updated_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() => openActionModal(item)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        •••
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {inventoryData && (inventoryData.previous || inventoryData.next) && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              {inventoryData.previous && (
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Previous
                </button>
              )}
              {inventoryData.next && (
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
                  <span className="font-medium">{Math.ceil(inventoryData.count / 20)}</span> ({inventoryData.count} total items)
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  {inventoryData.previous && (
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      Previous
                    </button>
                  )}
                  {inventoryData.next && (
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
                  onClick={() => handleSort('variant')}
                  className="w-full text-left p-2 rounded text-black hover:bg-gray-200"
                >
                  Variant
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleSort('-quantity')}
                  className="w-full text-left p-2 rounded text-black hover:bg-gray-200"
                >
                  Quantity (High to Low)
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleSort('quantity')}
                  className="w-full text-left p-2 rounded text-black hover:bg-gray-200"
                >
                  Quantity (Low to High)
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleSort('-s_price')}
                  className="w-full text-left p-2 rounded text-black hover:bg-gray-200"
                >
                  Price (High to Low)
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleSort('-updated_at')}
                  className="w-full text-left p-2 rounded text-black hover:bg-gray-200"
                >
                  Last Updated
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
      {showActionModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-80">
            <h3 className="text-lg font-semibold text-black mb-4">Actions</h3>
            <ul className="space-y-3">
              {permissions.canManageInventory ? (
                <>
                  <li>
                    <button
                      onClick={openEditModal}
                      className="w-full text-left p-2 rounded text-black hover:bg-gray-200"
                    >
                      Edit Item
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={handleDelete}
                      className="w-full text-left p-2 rounded text-red-500 hover:bg-red-100"
                    >
                      Delete Item
                    </button>
                  </li>
                </>
              ) : (
                <li className="text-gray-500 text-center py-4">
                  View only access
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

      {/* Add/Edit Modal */}
      {(showEditModal || showAddModal) && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 text-black">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <h3 className="text-lg font-semibold text-black mb-4">
              {showEditModal ? 'Edit Item' : 'Add New Item'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Variant</label>

                <select
                  value={formData.variant}
                  onChange={(e) => setFormData({ ...formData, variant: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Select Variant</option>
                  <option  value="Primary">Primary</option>
                  <option  value="JSS">JSS</option>
                  <option  value="Hi school">Hi school</option>
                  
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Uniform Type</label>
                <select
                  value={formData.uniformType}
                  onChange={(e) => setFormData({ ...formData, uniformType: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Select Uniform Type</option>
                  {uniformTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">School</label>
                <select
                  value={formData.school}
                  onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Select School</option>
                  {schools.map(school => (
                    <option key={school.id} value={school.id}>{school.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Size</label>
                <select
                  value={formData.size}
                  onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Select Size</option>
                  {sizes.map(size => (
                    <option key={size.id} value={size.id}>{size.label}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Quantity</label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Min Quantity</label>
                  <input
                    type="number"
                    value={formData.minimum_quantity}
                    onChange={(e) => setFormData({ ...formData, minimum_quantity: parseInt(e.target.value) || 0 })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Buy Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.b_price}
                    onChange={(e) => setFormData({ ...formData, b_price: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Sell Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.s_price}
                    onChange={(e) => setFormData({ ...formData, s_price: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-between">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setShowAddModal(false);
                }}
                className="px-4 py-2 bg-gray-200 rounded text-black hover:bg-gray-300"
              >
                Cancel
              </button>
              
              <button
                onClick={() => handleSubmit(showEditModal)}
                disabled={formLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {formLoading ? 'Saving...' : (showEditModal ? 'Update' : 'Add Item')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
