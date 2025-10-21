import './App.css';
import { SidebarProvider } from './context/SideBarContext';
import { AuthProvider } from './context/AuthContext';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/auth/Login';
import MainRoutes from './routes/MainRoutes';

import { Bounce, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const getFallbackPath = () => {
    // You can customize this logic based on your auth requirements
    return '/auth/login';
  };

  return (
    <AuthProvider>
      <SidebarProvider>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={Bounce}
      />
      <Routes>
        <Route element={<ProtectedRoute fallbackPath={getFallbackPath()} />}>
          {MainRoutes()}
        </Route>

        {/* Public Routes */}
        <Route path="/auth/login" element={<Login />} />
      </Routes>
      </SidebarProvider>
    </AuthProvider>
  );
}

export default App;
