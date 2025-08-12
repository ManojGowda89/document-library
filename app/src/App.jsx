// src/App.js (or your main entry file)
import React, { useState, useEffect } from "react";
import { ThemeContextProvider } from "./ThemeContext.jsx";
import Nav from "./Layout/Navbar.jsx";
import Footer from "./Layout/Footor.jsx";
import Home from "./Pages/Home.jsx";
import Login from "./Pages/Login.jsx";
import { Box } from "@mui/material";

const Layout = ({ children }) => {
  const [currentCategory, setCurrentCategory] = useState("images");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const loggedIn = sessionStorage.getItem("isLoggedIn") === "true";
    setIsLoggedIn(loggedIn);
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("isLoggedIn");
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) {
    return (
      <ThemeContextProvider>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            minHeight: "100vh",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Login onLogin={setIsLoggedIn} />
          <Footer />
        </Box>
      </ThemeContextProvider>
    );
  }

  return (
    <ThemeContextProvider>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
        <Nav
          onCategoryChange={setCurrentCategory}
          currentCategory={currentCategory}
          isLoggedIn={isLoggedIn}
          onLogout={handleLogout}
        />

        <Box
          component="main"
          sx={{
            display: "flex",
            flexDirection: "column",
            flexGrow: 1,
            ml: { sm: 0, md: "250px" },
          }}
        >
          {React.cloneElement(children, { type: currentCategory })}
        </Box>

        <Footer />
      </Box>
    </ThemeContextProvider>
  );
};

export default function App() {
  return (
    <Layout>
      <Home />
    </Layout>
  );
}
