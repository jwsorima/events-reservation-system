import { useState, useEffect, startTransition } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import axios from 'axios';
import { LoadingAdmin } from '../../components/Loading';

const ProtectedRoute = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const checkAuthentication = async () => {
      try {
        await axios.get(`${import.meta.env.VITE_BE_DOMAIN_NAME}/auth-status`, { withCredentials: true });
        setIsLoggedIn(true);
      } catch (error) {
        setIsLoggedIn(false);
      } finally {
        setTimeout(() => {
          startTransition(() => {
            setIsLoading(false);
          })
        }, 1000)
      }
    };

    checkAuthentication();

    return () => clearTimeout(timeoutId);
  }, []);

  if (isLoading) {
    return <LoadingAdmin />;
  }

  return isLoggedIn ? (
    <Outlet/>
  ) : (
    <Navigate to="/login" replace />
  );
};

export default ProtectedRoute;