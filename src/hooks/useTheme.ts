import { useState, useEffect } from 'react';

export function useTheme() {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const checkTheme = () => {
            const stored = localStorage.getItem('theme');
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const shouldBeDark = stored === 'dark' || (!stored && prefersDark);
            setIsDark(shouldBeDark);
            document.documentElement.classList.toggle('dark', shouldBeDark);
        };

        checkTheme();

        window.addEventListener('theme-changed', checkTheme);
        window.addEventListener('storage', (e) => {
            if (e.key === 'theme') checkTheme();
        });

        return () => {
            window.removeEventListener('theme-changed', checkTheme);
            window.removeEventListener('storage', checkTheme);
        };
    }, []);

    const toggle = () => {
        const next = !isDark;
        setIsDark(next);
        localStorage.setItem('theme', next ? 'dark' : 'light');
        document.documentElement.classList.toggle('dark', next);
        window.dispatchEvent(new Event('theme-changed'));
    };

    return { isDark, toggle };
}
