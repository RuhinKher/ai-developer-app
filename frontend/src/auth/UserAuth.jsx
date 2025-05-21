import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/user.context';

const UserAuth = ({ children }) => {
  const { user } = useContext(UserContext);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // No token? Redirect
    if (!token) {
      navigate('/login');
      return;
    }

    // Token is there, wait for user to load
    if (token && !user) {
      // Simulate small wait for user loading (you can replace with actual user fetching logic)
      setTimeout(() => {
        setLoading(false);
        if (!user) {
          navigate('/login');
        }
      }, 500); // small delay to give context time to update
    }

    if (user) {
      setLoading(false);
    }
  }, [token, user, navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
};

export default UserAuth;
