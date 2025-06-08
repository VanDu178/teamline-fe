// components/ThemeToggle.js
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    if (!mounted) return null; // tránh lỗi SSR

    return (
        <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 bg-gray-200 dark:bg-gray-700 rounded"
        >
            {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>
    );
}
