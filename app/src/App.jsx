import React from "react";
import { ThemeContextProvider } from "../src/ThemeContext.jsx";
import Nav from "../src/Layout/Navbar.jsx";
import Footer from "../src/Layout/Footor.jsx";
import Home from "../src/Pages/Home.jsx";
import { CreateRouter } from "../../mjs/AppRouter.jsx";
import { Box } from "@mui/material";

// Layout component that wraps the routes with Nav and Footer
const Layout = ({ children }) => {
  const [currentCategory, setCurrentCategory] = React.useState('images');
  
  return (
    <ThemeContextProvider>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
        }}
      >
        <Nav 
          onCategoryChange={setCurrentCategory} 
          currentCategory={currentCategory} 
        />
        
        <Box
          component="main"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
            ml: { sm: 0, md: '250px' },
          }}
        >
          {/* Pass the currentCategory to the children if needed */}
          {React.cloneElement(children, { type: currentCategory })}
        </Box>
        
        <Footer />
      </Box>
    </ThemeContextProvider>
  );
};

// Wrap your routes with the Layout component
export default CreateRouter([
  {
    path: "/",
    element: (
      <Layout>
        <Home />
      </Layout>
    ),
  }
]);