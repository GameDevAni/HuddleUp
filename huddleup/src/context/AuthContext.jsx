import { createContext, useContext, useEffect, useState } from 'react';
import pb from '../services/pocketbaseService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(pb.authStore.model);

  useEffect(() => {
    return pb.authStore.onChange(() => {
      setUser(pb.authStore.model);
    });
  }, []);

  const login = async (email, password) => {
    await pb.collection('users').authWithPassword(email, password);
  };

  const signup = async (email, password, name) => {
    try {
      await pb.collection('users').create({
        email,
        password,
        passwordConfirm: password,
        name,
      });
      await login(email, password); // auto login
    } catch (err) {
      console.error("Signup failed:", err.response);
      throw err;
    }
  };


  const logout = () => pb.authStore.clear();

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);