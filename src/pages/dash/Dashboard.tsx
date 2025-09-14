import Dashdiv from "../../components/Dashdiv";
import { LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart, Pie, Cell,Legend} from "recharts";

const data = [
  { month: "Jan", sales: 50000 },
  { month: "Feb", sales: 30000 },
  { month: "Mar", sales: 50000 },
  { month: "Apr", sales: 70000 },
  { month: "May", sales: 60000 },
  { month: "Jun", sales: 80000 },
];

const Inventory = [
  { name: "Shoes", value: 400 },
  { name: "Shirts", value: 300 },
  { name: "Sweaters", value: 900 },
  { name: "Socks", value: 800},
  { name: "Ties", value: 800},
];

const COLORS = ["#3DAEE9", "#D0FF00", "#FF7A59", "#9B59B6", "#E74C3C"];

function Dashboard() {
  const companyName = import.meta.env.VITE_COMPANY_NAME;
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome to {companyName} Admin Dashboard</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Sample dashboard cards */}
        <Dashdiv heading="Total Sales for the month" text="Ksh 240,500" footer="+12.5% from last month" color="text-yellow-600" route="/sales"/>
        <Dashdiv heading="Sales Today" text="Ksh 50,460" footer="+5% from yesterday" color="text-[#3DAEE9]" route="/sales"/>
        <Dashdiv heading="Profit this month" text="Ksh 94,500" footer="+8% from last month" color="text-green-600" route="/sales"/>
        <Dashdiv heading="Low Stock Items" text="23" footer="Needs attention" color="text-yellow-600" route="/inventory"/>
        <Dashdiv heading="Out of Stock Items" text="23" footer="Needs attention" color="text-red-600" route="/inventory"/>

      </div>
     
        <div className=" grid grid-cols-2 lg:grid-cols-2 md:grid-cols-1 gap-6">
          
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Sales Overview per month
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
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

          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Inventory Overview</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={Inventory}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    innerRadius={40} // <- remove this if you want a full pie instead of a donut
                    paddingAngle={4}
                  >
                    {data.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>  
    </div>
  );
}

export default Dashboard