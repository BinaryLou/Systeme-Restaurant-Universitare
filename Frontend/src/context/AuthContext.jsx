import { createContext, useEffect, useMemo, useState } from "react";
import {
  loginStudent,
  loginAdmin,
  logoutApi,
  refreshToken,
} from "../api/authApi";
import { setAccessToken, clearAccessToken } from "../api/axiosClient";

export const AuthContext = createContext(null);

const STORAGE_KEY = "ru_auth";

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState({
    user: null,
    token: null,
    role: null,
    isAuthenticated: false,
  });

  useEffect(() => {
    const savedAuth = localStorage.getItem(STORAGE_KEY);

    if (savedAuth) {
      try {
        const parsedAuth = JSON.parse(savedAuth);

        if (parsedAuth.token) {
          setAccessToken(parsedAuth.token);
        }

        setAuth({
          user: parsedAuth.user || null,
          token: parsedAuth.token || null,
          role: parsedAuth.role || null,
          isAuthenticated: Boolean(parsedAuth.token),
        });
      } catch {
        localStorage.removeItem(STORAGE_KEY);
        clearAccessToken();
      }
    }
  }, []);

  const saveAuth = ({ user, token, role }) => {
    const authData = {
      user,
      token,
      role,
      isAuthenticated: true,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(authData));
    setAccessToken(token);
    setAuth(authData);
  };

  const loginAsStudent = async (credentials) => {
    const response = await loginStudent(credentials);
    const data = response.data?.data;

    saveAuth({
      user: data.user,
      token: data.accessToken,
      role: data.user?.role || "USER",
    });

    return data;
  };

  const loginAsAdmin = async (credentials) => {
    const response = await loginAdmin(credentials);

    const data = response.data?.data || response.data;

    const admin = data?.admin;
    const token = data?.accessToken;

    if (!admin || !token) {
      throw new Error("Réponse login admin invalide.");
    }

    saveAuth({
      user: admin,
      token: token,
      role: admin.role || "ADMIN",
    });

    return data;
  };

  const refreshAccessToken = async () => {
    const response = await refreshToken();
    const data = response.data?.data;

    const newAuth = {
      ...auth,
      token: data.accessToken,
      isAuthenticated: true,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(newAuth));
    setAccessToken(data.accessToken);
    setAuth(newAuth);

    return data.accessToken;
  };

  const logout = async () => {
    try {
      await logoutApi();
    } catch {
      // même si logout API échoue, on nettoie côté frontend
    }

    localStorage.removeItem(STORAGE_KEY);
    clearAccessToken();

    setAuth({
      user: null,
      token: null,
      role: null,
      isAuthenticated: false,
    });
  };

  const value = useMemo(
    () => ({
      user: auth.user,
      token: auth.token,
      role: auth.role,
      isAuthenticated: auth.isAuthenticated,
      loginAsStudent,
      loginAsAdmin,
      refreshAccessToken,
      logout,
    }),
    [auth],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
