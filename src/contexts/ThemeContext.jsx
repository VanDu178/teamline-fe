import React, { createContext, useState, useContext, useEffect } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const storageKey = "theme_default";
    const savedTheme = localStorage.getItem(storageKey);

    const [isDarkMode, setIsDarkMode] = useState(savedTheme ? savedTheme === "dark" : true);

    const toggleTheme = () => {
        const newTheme = !isDarkMode;
        setIsDarkMode(newTheme);
        document.documentElement.setAttribute("data-theme", newTheme ? "dark" : "light");
        localStorage.setItem(storageKey, newTheme ? "dark" : "light");
    };

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", isDarkMode ? "dark" : "light");
        localStorage.setItem(storageKey, isDarkMode ? "dark" : "light");
    }, [isDarkMode, storageKey]);

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);