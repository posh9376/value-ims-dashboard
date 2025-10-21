import { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import type { User, PaginatedResponse } from '../../utils/api';
import { toast } from 'react-toastify';
import { usePermissions } from '../../hooks/usePermissions';

const Users = () => {
  const [usersData, setUsersData] = useState<PaginatedResponse<User> | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'cashier' | 'manager'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState<string>('username');
  const [currentPage, setCurrentPage] = useState(1);
  
  const permissions = usePermissions();
  
  // Modal states
  const [showSortModal, setShowSortModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'cashier',
    id_card_number: '',
    is_active: true
  });

  const userRoles = [
    { value: 'admin', label: 'Admin', description: 'Full system access' },
    { value: 'manager', label: 'Manager', description: 'Manage operations' },
    { value: 'cashier', label: 'Cashier', description: 'Handle sales and transactions' }
  ];

  // Fetch data
  useEffect(() => {
    fetchData();
  }, [searchTerm, roleFilter, statusFilter, sortBy, currentPage]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        ordering: sortBy
      };
      
      if (searchTerm) params.search = searchTerm;
      if (roleFilter !== 'all') params.role = roleFilter;
      if (statusFilter !== 'all') params.is_active = statusFilter === 'active';
      
      const response = await api.getUsers(params);
      // Convert to paginated response format if it's just an array
      if (Array.isArray(response)) {
        setUsersData({
          results: response,
          count: response.length,
          next: null,
          previous: null
        });
      } else {
        setUsersData(response);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to load users data');
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'manager': return 'bg-blue-100 text-blue-800';
      case 'cashier': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
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

  const handleRoleFilter = (role: typeof roleFilter) => {
    setRoleFilter(role);
    setCurrentPage(1);
  };

  const handleStatusFilter = (status: typeof statusFilter) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const openActionModal = (user: User) => {
    setSelectedUser(user);
    setShowActionModal(true);
  };

  const openDetailsModal = (user: User) => {
    setSelectedUser(user);
    setShowDetailsModal(true);
    setShowActionModal(false);
  };

  const openEditModal = () => {
    if (selectedUser) {
      setFormData({
        username: selectedUser.username,
        password: '', // Don't pre-fill password
        role: selectedUser.role || 'cashier',
        id_card_number: '',
        is_active: selectedUser.is_active
      });
      setShowEditModal(true);
      setShowActionModal(false);
    }
  };

  const openAddModal = () => {
    setFormData({
      username: '',
      password: '',
      role: 'cashier',
      id_card_number: '',
      is_active: true
    });
    setShowAddModal(true);
  };

  const handleToggleStatus = async () => {
    if (selectedUser) {
      try {
        await api.updateUser(selectedUser.id, { 
          is_active: !selectedUser.is_active 
        });
        toast.success(`User ${!selectedUser.is_active ? 'activated' : 'deactivated'} successfully`);
        fetchData();
        setShowActionModal(false);
        setSelectedUser(null);
      } catch (error) {
        toast.error('Failed to update user status');
      }
    }
  };

  const handleDelete = async () => {
    if (selectedUser) {
      try {
        await api.deleteUser(selectedUser.id);
        toast.success('User deleted successfully');
        fetchData();
        setShowActionModal(false);
        setSelectedUser(null);
      } catch (error) {
        toast.error('Failed to delete user');
      }
    }
  };

  const handleSubmit = async (isEdit: boolean = false) => {
    try {
      setFormLoading(true);
      
      const data: any = {
        username: formData.username,
        id_card_number: formData.id_card_number || null,
        role: formData.role,
        is_active: formData.is_active
      };

      // Only include password if it's provided
      if (formData.password) {
        data.password = formData.password;
      }

      if (isEdit && selectedUser) {
        await api.updateUser(selectedUser.id, data);
        toast.success('User updated successfully');
        setShowEditModal(false);
      } else {
        if (!formData.password) {
          toast.error('Password is required for new users');
          return;
        }
        await api.createUser(data);
        toast.success('User created successfully');
        setShowAddModal(false);
      }
      
      fetchData();
      setSelectedUser(null);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Operation failed');
    } finally {
      setFormLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getFullName = (user: User) => {
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    return user.username;
  };

  // Summary stats
  const getSummaryStats = () => {
    if (!usersData?.results) return { total: 0, active: 0, admins: 0, cashiers: 0 };
    
    const users = usersData.results;
    return {
      total: usersData.count,
      active: users.filter(user => user.is_active).length,
      admins: users.filter(user => user.role === 'admin').length,
      cashiers: users.filter(user => user.role === 'cashier').length
    };
  };

  const stats = getSummaryStats();

  if (loading && !usersData) {
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
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600">
          {permissions.canManageUsers 
            ? 'Manage system users and their roles' 
            : 'View system users and their roles'}
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 text-black">
        <div className="col-span-2">
          <input
            type="text"
            placeholder="Search users..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => handleRoleFilter(e.target.value as typeof roleFilter)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="manager">Manager</option>
          <option value="cashier">Cashier</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => handleStatusFilter(e.target.value as typeof statusFilter)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        <button
          onClick={() => setShowSortModal(true)}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
        >
          Sort by
        </button>

        {permissions.canManageUsers && (
          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            + Add User
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-500">Active Users</h3>
          <p className="text-2xl font-bold text-green-600 mt-1">{stats.active}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-500">Admins</h3>
          <p className="text-2xl font-bold text-red-600 mt-1">{stats.admins}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-500">Cashiers</h3>
          <p className="text-2xl font-bold text-blue-600 mt-1">{stats.cashiers}</p>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {usersData?.results?.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{user.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div className="font-medium">{getFullName(user)}</div>
                      <div className="text-xs text-gray-500">@{user.username}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {user.id_card_number || 'N/A'}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role || 'cashier')}`}>
                      {(user.role || 'cashier').charAt(0).toUpperCase() + (user.role || 'cashier').slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.is_active)}`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.last_login ? formatDate(user.last_login) : 'Never'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(user.date_joined)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => openActionModal(user)}
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
        {usersData && (usersData.previous || usersData.next) && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              {usersData.previous && (
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Previous
                </button>
              )}
              {usersData.next && (
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
                  <span className="font-medium">{Math.ceil(usersData.count / 20)}</span> ({usersData.count} total users)
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  {usersData.previous && (
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      Previous
                    </button>
                  )}
                  {usersData.next && (
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
                  onClick={() => handleSort('username')}
                  className="w-full text-left p-2 rounded text-black hover:bg-gray-200"
                >
                  Username (A-Z)
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleSort('-username')}
                  className="w-full text-left p-2 rounded text-black hover:bg-gray-200"
                >
                  Username (Z-A)
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleSort('role')}
                  className="w-full text-left p-2 rounded text-black hover:bg-gray-200"
                >
                  Role
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleSort('-date_joined')}
                  className="w-full text-left p-2 rounded text-black hover:bg-gray-200"
                >
                  Recently Joined
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleSort('-last_login')}
                  className="w-full text-left p-2 rounded text-black hover:bg-gray-200"
                >
                  Recent Login
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
                  onClick={() => openDetailsModal(selectedUser!)}
                  className="w-full text-left p-2 rounded text-black hover:bg-gray-200"
                >
                  View Details
                </button>
              </li>
              {permissions.canManageUsers && (
                <>
                  <li>
                    <button
                      onClick={openEditModal}
                      className="w-full text-left p-2 rounded text-black hover:bg-gray-200"
                    >
                      Edit User
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={handleToggleStatus}
                      className={`w-full text-left p-2 rounded ${
                        selectedUser?.is_active 
                          ? 'text-orange-600 hover:bg-orange-100' 
                          : 'text-green-600 hover:bg-green-100'
                      }`}
                    >
                      {selectedUser?.is_active ? 'Deactivate User' : 'Activate User'}
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={handleDelete}
                      className="w-full text-left p-2 rounded text-red-500 hover:bg-red-100"
                    >
                      Delete User
                    </button>
                  </li>
                </>
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

      {/* User Details Modal */}
      {showDetailsModal && selectedUser && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-black mb-4">User Details #{selectedUser.id}</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <div className="text-sm text-gray-900">{getFullName(selectedUser)}</div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Username</label>
                <div className="text-sm text-gray-900">@{selectedUser.username}</div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Id Number</label>
                <div className="text-sm text-gray-900">{selectedUser.id_card_number || 'N/A'}</div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(selectedUser.role || 'cashier')}`}>
                  {(selectedUser.role || 'cashier').charAt(0).toUpperCase() + (selectedUser.role || 'cashier').slice(1)}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedUser.is_active)}`}>
                  {selectedUser.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Date Joined</label>
                <div className="text-sm text-gray-900">{formatDate(selectedUser.date_joined)}</div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Last Login</label>
                <div className="text-sm text-gray-900">
                  {selectedUser.last_login ? formatDate(selectedUser.last_login) : 'Never logged in'}
                </div>
              </div>
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

      {/* Add/Edit Modal */}
      {(showEditModal || showAddModal) && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 text-black">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-black mb-4">
              {showEditModal ? 'Edit User' : 'Add New User'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Username *</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Enter username"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Id Number</label>
                <input
                  type="text"
                  value={formData.id_card_number}
                  onChange={(e) => setFormData({ ...formData, id_card_number: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="123..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Password {showAddModal ? '*' : '(leave blank to keep current)'}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder={showAddModal ? "Enter password" : "New password (optional)"}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Role *</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                >
                  {userRoles.map(role => (
                    <option key={role.value} value={role.value}>
                      {role.label} - {role.description}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                  Active user (can login to system)
                </label>
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
                disabled={formLoading || !formData.username || (showAddModal && !formData.password)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {formLoading ? 'Saving...' : (showEditModal ? 'Update User' : 'Add User')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
