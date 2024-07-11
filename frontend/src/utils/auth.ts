import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export const LogOut = async (navigate: ReturnType<typeof useNavigate>) => {
  await axios.post(`${import.meta.env.VITE_BE_DOMAIN_NAME}/logout`, {}, {
    withCredentials: true 
  });
  navigate('/login', { replace: true });
};