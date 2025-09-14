import { useState } from 'react';
// import { useNavigate } from "react-router-dom"
import Button from '../../components/Button';
import SearchBar from '../../components/Search';

const Inventory = () => {
  const [showModal, setShowModal] = useState(false);
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [showActionModal,setsShowActionModal] = useState(false)
  const [showEditModal, setShowEditmodal] = useState(false)

  // const navigate = useNavigate()


  const inventoryItems = [
    { id: 'INV001', School_name: 'ST Peters', type: 'Sock',variant: 'primary', stock: 45, minStock: 10, price: 999.99, status: 'In Stock', updated_on: 'June 9 2025'},
    { id: 'INV002', School_name: 'Gilgil Hills', type: 'Trousers',variant: 'JSS', stock: 8, minStock: 15, price: 299.99, status: 'Low Stock', updated_on: 'June 9 2025' },
    { id: 'INV003', School_name: 'Utumishi', type: 'Shorts',variant: 'JSS', stock: 125, minStock: 20, price: 29.99, status: 'In Stock', updated_on: 'June 9 2025' },
    { id: 'INV004', School_name: 'ST Ann', type: 'HC Shirts',variant: 'primary', stock: 0, minStock: 5, price: 599.99, status: 'Out of Stock', updated_on: 'June 9 2025' },
  ];

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case 'In Stock':
        return 'bg-green-100 text-green-800';
      case 'Low Stock':
        return 'bg-yellow-100 text-yellow-800';
      case 'Out of Stock':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSort = (criteria: string) => {
    setSortBy(criteria);
    setShowModal(false);
    // Here you can apply sorting logic to inventoryItems (e.g., sort by stock, price, etc.)
    console.log("Sorting by:", criteria);
  };

  const handleAction =()=>{
    console.log("action clicked");
    setsShowActionModal(true)
    
  }

  const handleEdit = (id:string)=>{
    setShowEditmodal(true)
    setsShowActionModal(false)
  }

  const handleDelete = (id:string)=>{
    alert(`item ${id} deleted successfull`);
    setsShowActionModal(false) 
  }

  const handleSubmit = ()=>{
    console.log('data submited');
    
    setShowEditmodal(false)

  }

  return (
    <div className="p-6">
      <div className="mb-6 ">
        <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
      </div>
      <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <SearchBar />
        </div>
        <div className="flex gap-2 md:justify-end">
          <button 
            onClick={() => setShowModal(true)} 
            className="btn bg-gray-400 border-0"
          >
            Sort by
          </button>
          <Button text="+ Add Item" />
        </div>
      </div>


      {/* ✅ Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-80">
            <h3 className="text-lg font-semibold text-black mb-4">Sort By</h3>
            <ul className="space-y-3">
              <li>
                <button
                  onClick={() => handleSort("type")}
                  className="w-full text-left p-2 rounded text-black hover:bg-gray-200"
                >
                  Type
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleSort("status")}
                  className="w-full text-left p-2 rounded text-black hover:bg-gray-200"
                >
                  Status
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleSort("price")}
                  className="w-full text-left p-2 rounded text-black hover:bg-gray-200"
                >
                  Price
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleSort("updated_on")}
                  className="w-full text-left p-2 rounded text-black hover:bg-gray-200"
                >
                  Last Updated
                </button>
              </li>
            </ul>
            <div className="mt-6 text-right">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-200 rounded text-black hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Action Modal */}
      {showActionModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-80">
            <h3 className="text-lg font-semibold text-black mb-4">Sort By</h3>
            <ul className="space-y-3">
              <li>
                <button
                  onClick={() => handleEdit('id')}
                  className="w-full text-left p-2 rounded text-black hover:bg-gray-200"
                >
                  Edit
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleDelete('id')}
                  className="w-full text-left p-2 rounded text-red-500 hover:bg-red-100"
                >
                  Delete
                </button>
              </li>
              
            </ul>
            <div className="mt-6 text-right">
              <button
                onClick={() => setsShowActionModal(false)}
                className="px-4 py-2 bg-gray-200 rounded text-black hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

       {/* ✅ Edit Modal */}
       {showEditModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-80">
            <h3 className="text-lg font-semibold text-black mb-4">Edit the item</h3>
            <label htmlFor="quantity" className='text-black'>Quantity</label>
            <div>
              <input type="text" placeholder='Add new stock' className='text-gray-300 mt-3 p-2 active:border-0'/>
            </div>
            
            
            <div className="mt-6 flex justify-between">

            <button
                onClick={() => setShowEditmodal(false)}
                className="px-4 py-2 bg-gray-200 rounded text-black hover:bg-gray-300"
              >
                cancel
              </button>
              
              <button
                onClick={() => handleSubmit()}
                className="px-4 py-2 bg-[#3DAEE9] btn border-0 rounded text-black hover:bg-blue-500"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-500">Total Items</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">{inventoryItems.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-500">In Stock</h3>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {inventoryItems.filter(item => item.status === 'In Stock').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-500">Low Stock</h3>
          <p className="text-2xl font-bold text-yellow-600 mt-1">
            {inventoryItems.filter(item => item.status === 'Low Stock').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-500">Out of Stock</h3>
          <p className="text-2xl font-bold text-red-600 mt-1">
            {inventoryItems.filter(item => item.status === 'Out of Stock').length}
          </p>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  School Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  TYpe
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Variant
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
                  Updated on
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {inventoryItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.School_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.variant}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.stock}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Ksh {item.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStockStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.updated_on}
                  </td>
                  <td 
                    className="text-center whitespace-nowrap text-sm text-gray-500 hover:cursor-pointer"
                    onClick={handleAction}>
                      ...
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
