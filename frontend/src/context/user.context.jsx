// context/user.context.jsx
import React, { createContext, useState, useEffect } from 'react';
import axios from '../config/axios'

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    async function bootstrap() {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('[useBootstrapUser] no token found');
        setInitializing(false);
        return;
      }

      // if you have a custom API base URL, make sure it’s set:
      // axios.defaults.baseURL = process.env.REACT_APP_API_URL;

      // 1️⃣ Attach the header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      try {
        // 2️⃣ Fire the request
        const { data } = await axios.get('/users/profile')
        setUser(data.user);
      } catch (err) {
        console.error('[useBootstrapUser] token validation failed:', err.response || err);
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setInitializing(false);
      }
    }

    bootstrap();
  }, [setUser]);

  // While we’re checking the token, hold off on rendering children
  if (initializing) {
    return <div>Loading user session…</div>;
  }

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};
