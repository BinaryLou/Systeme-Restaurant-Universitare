import { useState } from "react";
import {
  loginStudent,
  loginAdmin,
  logoutApi,
  refreshToken,
} from "../api/authApi";
import { setAccessToken, clearAccessToken } from "../api/axiosClient";
import { AuthContext } from "./auth-context";

const STORAGE_KEY = "ru_auth";

const getInitialAuth = () => {
  const savedAuth = localStorage.getItem(STORAGE_KEY);

  if (!savedAuth) {
    return {
      user: null,
      token: null,
      role: null,
      isAuthenticated: false,
    };
  }

  try {
    const parsedAuth = JSON.parse(savedAuth);

    if (parsedAuth.token) {
      setAccessToken(parsedAuth.token);
    }

    return {
      user: parsedAuth.user || null,
      token: parsedAuth.token || null,
      role: parsedAuth.role || null,
      isAuthenticated: Boolean(parsedAuth.token),
    };
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    clearAccessToken();

    return {
      user: null,
      token: null,
      role: null,
      isAuthenticated: false,
    };
  }
};

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(getInitialAuth);

  const saveAuth = ({ user, token, role }) => {
    const authData = {
      user,
      token,
      role,
      isAuthenticated: true,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(authData));
    localStorage.setItem("user", JSON.stringify(user));
    setAccessToken(token);
    setAuth(authData);
  };

  const updateUser = (updatedUserData) => {
    setAuth((prevAuth) => {
      const baseUser = prevAuth.user || JSON.parse(localStorage.getItem("user") || "null");
      const updatedUserObj = baseUser
        ? {
            ...baseUser,
            ...updatedUserData,
          }
        : {
            ...updatedUserData,
          };

      const updatedAuth = {
        ...prevAuth,
        user: updatedUserObj,
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAuth));
      localStorage.setItem("user", JSON.stringify(updatedUserObj));
      return updatedAuth;
    });
  };

  const loginAsStudent = async (credentials) => {
    const response = await loginStudent(credentials);
    const data = response.data?.data || response.data;

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
      token,
      role: admin.role || "ADMIN",
    });

    return data;
  };

  const refreshAccessToken = async () => {
    const response = await refreshToken();
    const data = response.data?.data || response.data;

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
    localStorage.removeItem("user");
    clearAccessToken();

    setAuth({
      user: null,
      token: null,
      role: null,
      isAuthenticated: false,
    });
  };

  const value = {
    user: auth.user,
    token: auth.token,
    role: auth.role,
    isAuthenticated: auth.isAuthenticated,
    loginAsStudent,
    loginAsAdmin,
    refreshAccessToken,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}