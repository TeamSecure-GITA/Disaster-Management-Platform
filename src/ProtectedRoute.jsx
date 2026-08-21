import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  // Replace 'token' with your actual state/localStorage key used for auth
  const token = localStorage.getItem('token'); 

  // If user is not authenticated, send them directly to /login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated, allow access to nested routes
  return <Outlet />;
};

export default ProtectedRoute;