import React, { createContext, useState, useEffect } from 'react';
import { isMockAuth, auth, googleProvider } from '../services/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail, 
  signInWithPopup, 
  onAuthStateChanged 
} from 'firebase/auth';
import api from '../services/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync token to api client
  const setToken = (token) => {
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  };

  useEffect(() => {
    if (!isMockAuth && auth) {
      // Live Firebase Listener
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          try {
            const token = await firebaseUser.getIdToken();
            setToken(token);
            
            // Sync with backend database and get user profile details
            const response = await api.get('/auth/me');
            setUser(response.data);
          } catch (error) {
            console.error("Auth Listener Sync Error:", error);
            // If backend is not running or sync fails, fallback to simple client details
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName || firebaseUser.email.split('@')[0],
              role: 'candidate'
            });
          }
        } else {
          setUser(null);
          setToken(null);
        }
        setLoading(false);
      });
      return unsubscribe;
    } else {
      // Mock Auth Initialization
      const savedToken = localStorage.getItem('authToken');
      const savedUser = localStorage.getItem('mock_user_profile');
      
      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      }
      setLoading(false);
    }
  }, []);

  // ----------------------------------------------------
  // REGISTER ACTION
  // ----------------------------------------------------
  const register = async (email, password, displayName) => {
    setLoading(true);
    try {
      if (!isMockAuth && auth) {
        // Firebase Live Register
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const fbUser = userCredential.user;
        const token = await fbUser.getIdToken();
        setToken(token);
        
        // Sync profile data to backend
        const response = await api.post('/auth/sync', {
          displayName,
          email,
          role: 'candidate'
        });
        setUser(response.data);
        return response.data;
      } else {
        // Mock Register
        const mockUid = `mock-uid-${Date.now()}`;
        const newUser = {
          uid: mockUid,
          email,
          displayName,
          role: email === 'admin@hiringagent.com' ? 'admin' : 'candidate'
        };
        
        // Save to mock users list in local storage
        const mockUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
        if (mockUsers.some(u => u.email === email)) {
          throw new Error("Email already registered.");
        }
        mockUsers.push({ email, password, displayName, uid: mockUid });
        localStorage.setItem('mock_users', JSON.stringify(mockUsers));
        
        const token = `mock-token-${mockUid}`;
        setToken(token);
        setUser(newUser);
        localStorage.setItem('mock_user_profile', JSON.stringify(newUser));
        return newUser;
      }
    } catch (error) {
      setLoading(false);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------
  // LOGIN ACTION
  // ----------------------------------------------------
  const login = async (email, password) => {
    setLoading(true);
    try {
      if (!isMockAuth && auth) {
        // Firebase Live Login
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const fbUser = userCredential.user;
        const token = await fbUser.getIdToken();
        setToken(token);
        
        const response = await api.get('/auth/me');
        setUser(response.data);
        return response.data;
      } else {
        // Mock Login
        // Pre-seeded Admin Credentials
        if (email === 'admin@hiringagent.com' && password === 'admin123') {
          const adminUser = {
            uid: 'mock-admin-uid',
            email: 'admin@hiringagent.com',
            displayName: 'ch karthik',
            role: 'admin'
          };
          const token = 'mock-token-mock-admin-uid';
          setToken(token);
          setUser(adminUser);
          localStorage.setItem('mock_user_profile', JSON.stringify(adminUser));
          return adminUser;
        }
        
        // Regular candidate login check
        const mockUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
        const found = mockUsers.find(u => u.email === email && u.password === password);
        if (!found) {
          throw new Error("Invalid email or password. Use admin@hiringagent.com / admin123 for Admin Panel.");
        }
        
        const candidateUser = {
          uid: found.uid,
          email: found.email,
          displayName: found.displayName,
          role: 'candidate'
        };
        const token = `mock-token-${found.uid}`;
        setToken(token);
        setUser(candidateUser);
        localStorage.setItem('mock_user_profile', JSON.stringify(candidateUser));
        return candidateUser;
      }
    } catch (error) {
      setLoading(false);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------
  // GOOGLE LOGIN ACTION
  // ----------------------------------------------------
  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      if (!isMockAuth && auth && googleProvider) {
        const userCredential = await signInWithPopup(auth, googleProvider);
        const fbUser = userCredential.user;
        const token = await fbUser.getIdToken();
        setToken(token);
        
        const response = await api.post('/auth/sync', {
          displayName: fbUser.displayName || fbUser.email.split('@')[0],
          email: fbUser.email,
          role: 'candidate'
        });
        setUser(response.data);
        return response.data;
      } else {
        // Mock Google Login
        const googleUser = {
          uid: 'mock-google-uid',
          email: 'googleuser@hiringagent.com',
          displayName: 'Google Candidate',
          role: 'candidate'
        };
        const token = 'mock-token-mock-candidate-uid';
        setToken(token);
        setUser(googleUser);
        localStorage.setItem('mock_user_profile', JSON.stringify(googleUser));
        return googleUser;
      }
    } catch (error) {
      setLoading(false);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------
  // LOGOUT ACTION
  // ----------------------------------------------------
  const logout = async () => {
    setLoading(true);
    try {
      if (!isMockAuth && auth) {
        await signOut(auth);
      }
      setUser(null);
      setToken(null);
      localStorage.removeItem('mock_user_profile');
    } catch (error) {
      console.error("Logout Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------
  // FORGOT PASSWORD ACTION
  // ----------------------------------------------------
  const resetPassword = async (email) => {
    if (!isMockAuth && auth) {
      await sendPasswordResetEmail(auth, email);
    } else {
      // Mock Password Reset
      console.log(`Mock reset password email sent to: ${email}`);
      return true;
    }
  };

  const val = {
    user,
    loading,
    login,
    register,
    loginWithGoogle,
    logout,
    resetPassword,
    isMock: isMockAuth
  };

  return (
    <AuthContext.Provider value={val}>
      {children}
    </AuthContext.Provider>
  );
};
