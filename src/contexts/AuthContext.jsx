
import React, { createContext, useState, useContext, useEffect } from "react";
import axiosInstance from "../configs/axiosInstance";
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        checkAuth();
    }, []);
    //Hàm để set thông in current user và trạng thái đăng nhập 
    const loggedIn = (userData) => {
        setUser(userData);
        setIsAuthenticated(true);
    };

    const logout = async () => {
        await axiosInstance.post("/auth/logout");
        setUser(null);
        setIsAuthenticated(false);
    };

    const checkAuth = async () => {
        try {
            const res = await axiosInstance.get("/auth/me");
            loggedIn(res.data.user);
        } catch (err) {
            setUser(null);
            setIsAuthenticated(false);
        }
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, loggedIn, logout }}>
            {children}
        </AuthContext.Provider>
    );
};


export const useAuth = () => useContext(AuthContext);