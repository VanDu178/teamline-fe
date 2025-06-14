
import { createContext, useState, useContext, useEffect } from "react";
import Cookies from "js-cookie";
import axiosInstance from "../configs/axiosInstance";
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isCheckingLogin, setIsCheckingLogin] = useState(true);
    const [userId, setUserId] = useState(() => {
        // const storedUserId = Cookies.get('userID');
        // return storedUserId ? storedUserId : null;
        return Cookies.get('userID');
    });
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        return Cookies.get("isLoggedIn") ? true : false;
    });
    const [user, setUser] = useState(() => {
        const userCookie = Cookies.get("user");
        return userCookie ? JSON.parse(userCookie) : null;
    });


    useEffect(() => {
        if (!userId || !isAuthenticated || !user) {
            checkAuth();
        }
        setIsCheckingLogin(false);
    }, [userId, isAuthenticated, user])

    const checkAuth = async () => {
        try {
            const response = await axiosInstance.get("/auth/me");
            if (response?.data?.user) {
                loggedIn(response?.data?.user);
            }
        }
        catch (error) {
            return;
        }
        finally {
            setIsCheckingLogin(false);
        }
    }

    const loggedIn = (userData) => {
        console.log()
        Cookies.set("isLoggedIn", "isAuthenticated", { expires: 7 });
        Cookies.set("userID", userData._id, { expires: 365 });
        Cookies.set("user", JSON.stringify(userData), { expires: 365 });
        setIsAuthenticated(true);
        setUser(userData);
        setUserId(userData._id);
    };

    const logout = async () => {
        await axiosInstance.post("/auth/logout");
        setIsAuthenticated(false);
        setUser(null);
        setUserId(null);
        Cookies.remove("isLoggedIn");
        Cookies.remove("userID");
        Cookies.remove("user");
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, loggedIn, logout, isCheckingLogin, userId, setUserId, setUser }}>
            {children}
        </AuthContext.Provider>
    );
};


export const useAuth = () => useContext(AuthContext);