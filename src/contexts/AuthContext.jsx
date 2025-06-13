
import { createContext, useState, useContext, useEffect } from "react";
import Cookies from "js-cookie";
import axiosInstance from "../configs/axiosInstance";
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isCheckingLogin, setIsCheckingLogin] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        return Cookies.get("isLoggedIn") ? true : false;
    });
    useEffect(() => {
        const isLoggedIn = Cookies.get("isLoggedIn");
        if (!isLoggedIn) {
            setIsAuthenticated(true);
        }
        setIsCheckingLogin(false);
    }, [isAuthenticated]);


    const loggedIn = (userData) => {
        Cookies.set("isLoggedIn", "isAuthenticated", { expires: 7 });
        Cookies.set("userData", userData)
        setUser(userData);
        setIsAuthenticated(true);
    };

    const logout = async () => {
        await axiosInstance.post("/auth/logout");
        setUser(null);
        setIsAuthenticated(false);
        Cookies.remove("isLoggedIn");
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, loggedIn, logout, isCheckingLogin }}>
            {children}
        </AuthContext.Provider>
    );
};


export const useAuth = () => useContext(AuthContext);