import { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import type { UniformType, PaginatedResponse } from '../../utils/api';
import { toast } from 'react-toastify';

const Schools = () => {
  const [categoryData, setCategoryData] = useState<PaginatedResponse<UniformType> | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<string>('name');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Modal states
  const [showSortModal, setShowSortModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<UniformType | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    name: ''
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
      // ****************Fetch data***************
      const response = await api.getUniformTypes(params);
      // Convert to paginated response format if it's just an array
      if (Array.isArray(response)) {
        setCategoryData({
          results: response,
          count: response.length,
          next: null,
          previous: null
        });
      } else {
        setCategoryData(response);
      }
    } catch (error) {
      console.error('Failed to fetch schools:', error);
      toast.error('Failed to load schools data');
    } finally {
      setLoading(false);
    }
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

  const openActionModal = (category: UniformType) => {
    setSelectedCategory(category);
    setShowActionModal(true);
  };

  const openEditModal = () => {
    if (selectedCategory) {
      setFormData({
        name: selectedCategory.name,
      });
      setShowEditModal(true);
      setShowActionModal(false);
    }
  };

  const openAddModal = () => {
    setFormData({
      name: ''
    });
    setShowAddModal(true);
  };

  //********************************** */
  const handleDelete = async () => {
    if (selectedCategory) {
      try {
        await api.deleteUniformType(selectedCategory.id);
        toast.success('School deleted successfully');
        fetchData();
        setShowActionModal(false);
        setSelectedCategory(null);
      } catch (error) {
        toast.error('Failed to delete school');
      }
    }
  };

  const handleSubmit = async (isEdit: boolean = false) => {
    try {
      setFormLoading(true);
      
      const data = {
        name: formData.name
      };

      if (isEdit && selectedCategory) {
        await api.updateUniformType(selectedCategory.id, data);
        toast.success('School updated successfully');
        setShowEditModal(false);
      } else {
        await api.createUniformType(data);
        toast.success('School created successfully');
        setShowAddModal(false);
      }
      
      fetchData();
      setSelectedCategory(null);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Operation failed');
    } finally {
      setFormLoading(false);
    }
  };

  // const handlePageChange = (page: number) => {
  //   setCurrentPage(page);
  // };

  // Summary stats
  const getSummaryStats = () => {
    if (!categoryData?.results) return { total: 0, withId: 0};
    
    const categories = categoryData.results;
    return {
      total: categoryData.count,
      withId: categories.filter(category => category.id).length,
    };
  };

  const stats = getSummaryStats();

  if (loading && !categoryData) {
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
        <h1 className="text-2xl font-bold text-gray-900">Schools Management</h1>
        <p className="text-gray-600">Manage school information and contacts</p>
      </div>

      {/* Search and Filters */}
      <div className="mb-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="col-span-2">
          <input
            type="text"
            placeholder="Search schools..."
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

        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          + Add School
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-500">Total Schools</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-500">With Id</h3>
          <p className="text-2xl font-bold text-blue-600 mt-1">{stats.withId}</p>
        </div>
        {/* <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-500">With Email</h3>
          <p className="text-2xl font-bold text-green-600 mt-1">{stats.withEmail}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-500">With Phone</h3>
          <p className="text-2xl font-bold text-purple-600 mt-1">{stats.withPhone}</p>
        </div> */}
      </div>

      {/* category Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category name
                </th>
               
                {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created on
                </th> */}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categoryData?.results?.map((category) => (
                <tr key={category.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{category.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {category.name}
                  </td>
                  {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(category.created_at)}
                  </td> */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => openActionModal(category)}
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
        {categoryData && (categoryData.previous || categoryData.next) && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              {categoryData.previous && (
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Previous
                </button>
              )}
              {categoryData.next && (
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
                  <span className="font-medium">{Math.ceil(categoryData.count / 20)}</span> ({categoryData.count} total schools)
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  {categoryData.previous && (
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      Previous
                    </button>
                  )}
                  {categoryData.next && (
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
                  onClick={() => handleSort('name')}
                  className="w-full text-left p-2 rounded text-black hover:bg-gray-200"
                >
                  Name (A-Z)
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleSort('-name')}
                  className="w-full text-left p-2 rounded text-black hover:bg-gray-200"
                >
                  Name (Z-A)
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleSort('location')}
                  className="w-full text-left p-2 rounded text-black hover:bg-gray-200"
                >
                  Location
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
              <li>
                <button
                  onClick={openEditModal}
                  className="w-full text-left p-2 rounded text-black hover:bg-gray-200"
                >
                  Edit category
                </button>
              </li>
              <li>
                <button
                  onClick={handleDelete}
                  className="w-full text-left p-2 rounded text-red-500 hover:bg-red-100"
                >
                  Delete category
                </button>
              </li>
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
          <div className="bg-white rounded-lg shadow-lg p-6 w-96 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-black mb-4">
              {showEditModal ? 'Edit School' : 'Add New School'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">School Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Enter school name"
                  required
                />
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
                disabled={formLoading || !formData.name}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {formLoading ? 'Saving...' : (showEditModal ? 'Update School' : 'Add School')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Schools;
