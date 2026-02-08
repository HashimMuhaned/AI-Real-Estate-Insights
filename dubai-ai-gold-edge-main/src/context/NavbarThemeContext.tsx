// components/navbar/NavbarThemeContext.tsx
"use client";

import { createContext, useContext } from "react";

type NavbarTheme = "light" | "dark";

const NavbarThemeContext = createContext<NavbarTheme>("light");

export const NavbarThemeProvider = ({
  value,
  children,
}: {
  value: NavbarTheme;
  children: React.ReactNode;
}) => {
  return (
    <NavbarThemeContext.Provider value={value}>
      {children}
    </NavbarThemeContext.Provider>
  );
};

export const useNavbarTheme = () => useContext(NavbarThemeContext);
