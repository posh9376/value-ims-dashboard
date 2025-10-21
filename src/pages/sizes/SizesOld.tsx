import { useState } from "react";
import SearchBar from "../../components/Search"
import Button from "../../components/Button"

function Sizes() {

  const [showOptions, setShowOptions] = useState(false)
  const [showEditModal, setShowEditmodal] = useState(false)

  const inventoryItems = [
    { id: 'SZE001', size: '18', Item_type: 'short,trousers,shirts'},
    { id: 'SZE002', size: '22', Item_type: 'short,trousers,sweaters,shirts'},
    { id: 'SZE003', size: '24', Item_type: 'short,trousers,sweaters,shirts'},
    { id: 'SZE004', size: '26', Item_type: 'short,trousers,sweaters,shirts' },
  ];

  const handleEdit = (id:string)=>{
    console.log(`editing the id ${id}`);
    
    setShowOptions(false)
    setShowEditmodal(true)
  }

  const handleSubmit = ()=>{
    console.log('submited the data');
    setShowEditmodal(false)
    
  }

  const handleDelete = (id:string)=>{
    console.log(`Deleted shool of id ${id}`);
    setShowOptions(false)
  }

  const handleClick =()=>{
    console.log('I was clicked');
    setShowOptions(true)
    
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Sizes</h1>
        <div className='mb-4 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6'>
           <SearchBar/>
            <Button text="+ Add Size" />
        </div>
        
      </div>

      {/* ✅ Action Modal */}
      {showOptions && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-80">
            <h3 className="text-lg font-semibold text-black mb-4">Actions</h3>
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
                  Delete size
                </button>
              </li>
              
            </ul>
            <div className="mt-6 text-right">
              <button
                onClick={() => setShowOptions(false)}
                className="btn hover:bg-gray-700"
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
            <h3 className="text-lg font-semibold text-black mb-4">Edit the Size</h3>
            <label htmlFor="quantity" className='text-black'>Size</label>
            <div>
              <input type="text" placeholder='eg.24' className='text-black mt-2 mb-3 p-2 border border-[#3DAEE9] rounded-xl'/>
            </div>

            <select name="types" id="types" className="text-black mt-3">
              <option disabled>Select the uniform type</option>
              <option value="socks">Socks</option>
              <option value="shirts">Shirts</option>
              <option value="Sweaters">Sweaters</option>
              <option value="shoes">Shoes</option>
              <option value="trousers">Trousers</option>
              <option value="shorts">Shorts</option>
            </select>
            
            
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
      
      <div className="bg-white rounded-lg shadow p-8">
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
                    Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item Type
                  </th>

                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {inventoryItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 hover:cursor-pointer" onClick={handleClick}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.size}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.Item_type}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sizes