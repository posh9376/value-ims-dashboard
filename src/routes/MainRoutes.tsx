import { Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Dashboard from '../pages/dash/Dashboard';
import Inventory from '../pages/inventory/Inventory';
import Users from '../pages/users/Users';
import Overview from '../pages/finance/Overview';
import Transactions from '../pages/finance/Transactions';
import Analytics from '../pages/analytics/Analytics';
import Sales from '../pages/orders/Sales';
import Sizes from '../pages/sizes/Sizes';
import Schools from '../pages/schools/Schools';

const MainRoutes = () => {
  return (
    <>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/sales" element={<Sales />} />
        <Route path="/users" element={<Users />} />
        <Route path="/finance/overview" element={<Overview />} />
        <Route path="/finance/transactions" element={<Transactions />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path='/sizes' element={<Sizes />} />
        <Route path='/schools' element={<Schools />} />
      </Route>
    </>
  );
};

export default MainRoutes;
