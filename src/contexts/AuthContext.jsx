
import { createContext, useState, useContext, useEffect } from "react";
import Cookies from "js-cookie";
import axiosInstance from "../configs/axiosInstance";
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userId, setUserId] = useState(() => {
        const storedUserId = Cookies.get('userID');
        return storedUserId ? storedUserId : null;
    });
    const [isCheckingLogin, setIsCheckingLogin] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        return Cookies.get("isLoggedIn") ? true : false;
    });

    useEffect(() => {
        const isLoggedIn = Cookies.get("isLoggedIn");
        if (!isLoggedIn) {
            const userID = Cookies.get("userID");
            if (isLoggedIn && userID) {
                setIsAuthenticated(true);
            }
        }
        setIsCheckingLogin(false);
    }, [isAuthenticated]);

    const loggedIn = (userData) => {
        console.log("loggedIn", userData);
        Cookies.set("isLoggedIn", "isAuthenticated", { expires: 7 });
        Cookies.set("userID", userData._id, { expires: 365 });
        setUser(userData);
        setIsAuthenticated(true);
    };

    const logout = async () => {
        await axiosInstance.post("/auth/logout");
        setUser(null);
        setIsAuthenticated(false);
        Cookies.remove("isLoggedIn");
        Cookies.remove("userID");
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, loggedIn, logout, isCheckingLogin, userId, setUserId }}>
            {children}
        </AuthContext.Provider>
    );
};


export const useAuth = () => useContext(AuthContext);