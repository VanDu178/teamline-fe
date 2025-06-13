import { createContext, useState, useContext, useEffect } from "react";
const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const storageKey = "theme_default";
    const [isDarkMode, setIsDarkMode] = useState(true);
    // const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const savedTheme = localStorage.getItem(storageKey);
        const darkMode = savedTheme ? savedTheme === "dark" : true;
        setIsDarkMode(darkMode);
        document.documentElement.setAttribute("data-theme", darkMode ? "dark" : "light");

        // setTimeout(() => {
        //     setIsLoading(false); 
        // }, 100); 
    }, []);

    const toggleTheme = () => {
        const newTheme = !isDarkMode;
        setIsDarkMode(newTheme);
        document.documentElement.setAttribute("data-theme", newTheme ? "dark" : "light");
        localStorage.setItem(storageKey, newTheme ? "dark" : "light");
    };

    // if (isLoading) {
    //     return <Skeleton />
    // }

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
