'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider, useTheme } from 'next-themes';

export function ThemeProvider({
	children,
	...props
}: React.ComponentProps<typeof NextThemesProvider>) {
	return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

export function useThemeContext() {
	const { theme, setTheme, systemTheme } = useTheme();
	const isDarkMode = theme === 'dark' || (theme === 'system' && systemTheme === 'dark');
	return { theme, setTheme, systemTheme, isDarkMode };
}
