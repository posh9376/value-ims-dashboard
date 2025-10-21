import { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import type { UniformType, PaginatedResponse } from '../../utils/api';
import { toast } from 'react-toastify';
import { usePermissions } from '../../hooks/usePermissions';

const UniformTypes = () => {
  const [uniformTypesData, setUniformTypesData] = useState<PaginatedResponse<UniformType> | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<string>('name');
  const [currentPage, setCurrentPage] = useState(1);
  
  const permissions = usePermissions();
  
  // Modal states
  const [showSortModal, setShowSortModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedUniformType, setSelectedUniformType] = useState<UniformType | null>(null);
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
      
      const response = await api.getUniformTypes(params);
      // Convert to paginated response format if it's just an array
      if (Array.isArray(response)) {
        setUniformTypesData({
          results: response,
          count: response.length,
          next: null,
          previous: null
        });
      } else {
        setUniformTypesData(response);
      }
    } catch (error) {
      console.error('Failed to fetch uniform types:', error);
      toast.error('Failed to load uniform types data');
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

  const openActionModal = (uniformType: UniformType) => {
    setSelectedUniformType(uniformType);
    setShowActionModal(true);
  };

  const openEditModal = () => {
    if (selectedUniformType) {
      setFormData({
        name: selectedUniformType.name
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

  const handleDelete = async () => {
    if (selectedUniformType) {
      try {
        await api.deleteUniformType(selectedUniformType.id);
        toast.success('Uniform type deleted successfully');
        fetchData();
        setShowActionModal(false);
        setSelectedUniformType(null);
      } catch (error) {
        toast.error('Failed to delete uniform type');
      }
    }
  };

  const handleSubmit = async (isEdit: boolean = false) => {
    try {
      setFormLoading(true);
      
      const data = {
        name: formData.name.trim()
      };

      if (isEdit && selectedUniformType) {
        await api.updateUniformType(selectedUniformType.id, data);
        toast.success('Uniform type updated successfully');
        setShowEditModal(false);
      } else {
        await api.createUniformType(data);
        toast.success('Uniform type created successfully');
        setShowAddModal(false);
      }
      
      fetchData();
      setSelectedUniformType(null);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Operation failed');
    } finally {
      setFormLoading(false);
    }
  };

  // Summary stats
  const getSummaryStats = () => {
    if (!uniformTypesData?.results) return { total: 0 };
    
    return {
      total: uniformTypesData.count
    };
  };

  const stats = getSummaryStats();

  if (loading && !uniformTypesData) {
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
        <h1 className="text-2xl font-bold text-gray-900">Uniform Types Management</h1>
        <p className="text-gray-600">
          {permissions.canManageUniformTypes 
            ? 'Manage uniform categories and types' 
            : 'View uniform categories and types'}
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="col-span-2">
          <input
            type="text"
            placeholder="Search uniform types..."
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

        {permissions.canManageUniformTypes && (
          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            + Add Uniform Type
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-500">Total Uniform Types</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-500">Available Types</h3>
          <p className="text-2xl font-bold text-blue-600 mt-1">{stats.total}</p>
        </div>
      </div>

      {/* Uniform Types Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Uniform Type Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {uniformTypesData?.results?.map((uniformType) => (
                <tr key={uniformType.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{uniformType.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                    {uniformType.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => openActionModal(uniformType)}
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
        {uniformTypesData && (uniformTypesData.previous || uniformTypesData.next) && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              {uniformTypesData.previous && (
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Previous
                </button>
              )}
              {uniformTypesData.next && (
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
                  <span className="font-medium">{Math.ceil(uniformTypesData.count / 20)}</span> ({uniformTypesData.count} total uniform types)
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  {uniformTypesData.previous && (
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      Previous
                    </button>
                  )}
                  {uniformTypesData.next && (
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
                  onClick={() => handleSort('id')}
                  className="w-full text-left p-2 rounded text-black hover:bg-gray-200"
                >
                  ID (Ascending)
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleSort('-id')}
                  className="w-full text-left p-2 rounded text-black hover:bg-gray-200"
                >
                  ID (Descending)
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
              {permissions.canManageUniformTypes ? (
                <>
                  <li>
                    <button
                      onClick={openEditModal}
                      className="w-full text-left p-2 rounded text-black hover:bg-gray-200"
                    >
                      Edit Uniform Type
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={handleDelete}
                      className="w-full text-left p-2 rounded text-red-500 hover:bg-red-100"
                    >
                      Delete Uniform Type
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
              {showEditModal ? 'Edit Uniform Type' : 'Add New Uniform Type'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Uniform Type Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g., Shirts, Trousers, Dresses, Ties"
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
                disabled={formLoading || !formData.name.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {formLoading ? 'Saving...' : (showEditModal ? 'Update Uniform Type' : 'Add Uniform Type')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UniformTypes;