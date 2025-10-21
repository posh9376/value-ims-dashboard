import { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import type { Size, PaginatedResponse } from '../../utils/api';
import { toast } from 'react-toastify';
import { usePermissions } from '../../hooks/usePermissions';

const Sizes = () => {
  const [sizesData, setSizesData] = useState<PaginatedResponse<Size> | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<string>('label');
  const [currentPage, setCurrentPage] = useState(1);
  
  const permissions = usePermissions();
  
  // Modal states
  const [showSortModal, setShowSortModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSize, setSelectedSize] = useState<Size | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    label: ''
  });


  // Fetch data
  useEffect(() => {
    fetchData();
  }, [searchTerm, sortBy, currentPage]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        ordering: sortBy
      };
      
      if (searchTerm) params.search = searchTerm;
      
      const response = await api.getSizes(params);
      // Convert to paginated response format if it's just an array
      if (Array.isArray(response)) {
        setSizesData({
          results: response,
          count: response.length,
          next: null,
          previous: null
        });
      } else {
        setSizesData(response);
        console.log(sizesData);
        
      }
    } catch (error) {
      console.error('Failed to fetch sizes:', error);
      toast.error('Failed to load sizes data');
    } finally {
      setLoading(false);
    }
  };

  // const fetchDropdownData = async () => {
  //   try {
  //     const [unformTypesData] = await Promise.all([
  //       api.getUniformTypes()
  //     ]);
  //     // Handle both array and paginated response formats
  //     if (Array.isArray(unformTypesData)) {
  //       setUniformType(unformTypesData);
  //     } else {
  //       setUniformType(unformTypesData.results || []);
  //     }
  //   } catch (error) {
  //     console.error('Failed to fetch dropdown data:', error);
  //   }
  // };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleSort = (criteria: string) => {
    setSortBy(criteria);
    setCurrentPage(1);
    setShowSortModal(false);
  };

  const openActionModal = (size: Size) => {
    setSelectedSize(size);
    setShowActionModal(true);
  };

  const openEditModal = () => {
    if (selectedSize) {
      setFormData({
        label: selectedSize.label
      });
      setShowEditModal(true);
      setShowActionModal(false);
    }
  };

  const openAddModal = () => {
    setFormData({
      label: ''
    });
    setShowAddModal(true);
  };

  const handleDelete = async () => {
    if (selectedSize) {
      try {
        await api.deleteSize(selectedSize.id);
        toast.success('Size deleted successfully');
        fetchData();
        setShowActionModal(false);
        setSelectedSize(null);
      } catch (error) {
        toast.error('Failed to delete size');
      }
    }
  };

  const handleSubmit = async (isEdit: boolean = false) => {
    try {
      setFormLoading(true);
      
      const data = {
        label: formData.label
      };

      if (isEdit && selectedSize) {
        await api.updateSize(selectedSize.id, data);
        toast.success('Size updated successfully');
        setShowEditModal(false);
      } else {
        await api.createSize(data);
        toast.success('Size created successfully');
        setShowAddModal(false);
      }
      
      fetchData();
      setSelectedSize(null);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Operation failed');
    } finally {
      setFormLoading(false);
    }
  };



  // Summary stats
  const getSummaryStats = () => {
    if (!sizesData?.results) return { total: 0, withCategory: 0, withDescription: 0, categories: 0 };
    
    const sizes = sizesData.results;
    const uniqueCategories = new Set(sizes.filter(size => size.category).map(size => size.category));
    
    return {
      total: sizesData.count,
      withCategory: sizes.filter(size => size.category).length,
      withDescription: sizes.filter(size => size.description).length,
      categories: uniqueCategories.size
    };
  };

  const stats = getSummaryStats();

  if (loading && !sizesData) {
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
        <h1 className="text-2xl font-bold text-gray-900">Sizes Management</h1>
        <p className="text-gray-600">
          {permissions.canManageSizes 
            ? 'Manage uniform and clothing sizes' 
            : 'View uniform and clothing sizes'}
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-black">
        <div className="col-span-2">
          <input
            type="text"
            placeholder="Search sizes..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        <button
          onClick={() => setShowSortModal(true)}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
        >
          Sort by
        </button>

        {permissions.canManageSizes && (
          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            + Add Size
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-500">Total Sizes</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-500">With Category</h3>
          <p className="text-2xl font-bold text-blue-600 mt-1">{stats.withCategory}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-500">With Description</h3>
          <p className="text-2xl font-bold text-green-600 mt-1">{stats.withDescription}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-500">Categories</h3>
          <p className="text-2xl font-bold text-purple-600 mt-1">{stats.categories}</p>
        </div>
      </div>

      {/* Sizes Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Size Label
                </th>

                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sizesData?.results?.map((size) => (
                <tr key={size.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{size.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                    {size.label}
                  </td>
                  {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      size.category 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {size.category || 'No Category'}
                    </span>
                  </td> */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => openActionModal(size)}
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
        {sizesData && (sizesData.previous || sizesData.next) && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              {sizesData.previous && (
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Previous
                </button>
              )}
              {sizesData.next && (
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
                  <span className="font-medium">{Math.ceil(sizesData.count / 20)}</span> ({sizesData.count} total sizes)
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  {sizesData.previous && (
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      Previous
                    </button>
                  )}
                  {sizesData.next && (
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
                  onClick={() => handleSort('label')}
                  className="w-full text-left p-2 rounded text-black hover:bg-gray-200"
                >
                  Size Label (A-Z)
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleSort('-label')}
                  className="w-full text-left p-2 rounded text-black hover:bg-gray-200"
                >
                  Size Label (Z-A)
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleSort('-created_at')}
                  className="w-full text-left p-2 rounded text-black hover:bg-gray-200"
                >
                  Recently Added
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleSort('created_at')}
                  className="w-full text-left p-2 rounded text-black hover:bg-gray-200"
                >
                  Oldest First
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
              {permissions.canManageSizes ? (
                <>
                  <li>
                    <button
                      onClick={openEditModal}
                      className="w-full text-left p-2 rounded text-black hover:bg-gray-200"
                    >
                      Edit Size
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={handleDelete}
                      className="w-full text-left p-2 rounded text-red-500 hover:bg-red-100"
                    >
                      Delete Size
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
            {showEditModal ? 'Edit Size' : 'Add New Size'}
          </h3>
          
          <form
            onSubmit={(e) => {
              e.preventDefault(); // Prevent default form submission behavior
              handleSubmit(showEditModal); // Call handleSubmit with the isEdit flag
            }}
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Size Label *</label>
                <input
                  type="text"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g., XS, S, M, L, XL, 24, 26, 28"
                  required
                  autoFocus // Automatically focus the input when the modal opens
                />
              </div>
            </div>

            <div className="mt-6 flex justify-between">
              <button
                type="button" // Prevent this button from submitting the form
                onClick={() => {
                  setShowEditModal(false);
                  setShowAddModal(false);
                }}
                className="px-4 py-2 bg-gray-200 rounded text-black hover:bg-gray-300"
              >
                Cancel
              </button>
              
              <button
                type="submit" // This button submits the form
                disabled={formLoading || !formData.label}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {formLoading ? 'Saving...' : (showEditModal ? 'Update Size' : 'Add Size')}
              </button>
            </div>
          </form>
        </div>
      </div>
    )}
    </div>
  );
};

export default Sizes;
