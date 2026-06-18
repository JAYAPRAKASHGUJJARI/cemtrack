import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Parameters from './pages/Parameters';
import Alerts from './pages/Alerts';
import ManualEntry from './pages/ManualEntry';
import Reports from './pages/Reports';
import AIInsights from './pages/AIInsights';
import UserManagement from './pages/UserManagement';
import { useAuth } from './context/AuthContext';

const Layout = ({ children }) => {
  const { user } = useAuth();
  return (
    <>
      {user && <Navbar />}
      {children}
    </>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <Layout>
            <Routes>
              <Route path='/login' element={<Login />} />
              <Route path='/' element={<Navigate to='/dashboard' />} />
              <Route path='/dashboard' element={
                <ProtectedRoute><Dashboard /></ProtectedRoute>
              } />
              <Route path='/parameters' element={
                <ProtectedRoute><Parameters /></ProtectedRoute>
              } />
              <Route path='/alerts' element={
                <ProtectedRoute><Alerts /></ProtectedRoute>
              } />
              <Route path='/manual-entry' element={
                <ProtectedRoute><ManualEntry /></ProtectedRoute>
              } />
              <Route path='/reports' element={
                <ProtectedRoute roles={['manager', 'admin']}><Reports /></ProtectedRoute>
              } />
              <Route path='/ai-insights' element={
                <ProtectedRoute roles={['manager', 'admin']}><AIInsights /></ProtectedRoute>
              } />
              <Route path='/user-management' element={
                <ProtectedRoute roles={['admin']}><UserManagement /></ProtectedRoute>
              } />
            </Routes>
          </Layout>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;