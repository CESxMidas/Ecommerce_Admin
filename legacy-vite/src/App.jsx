import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { createContext, useEffect, useState } from "react";

import AdminLayout from "./layouts/AdminLayout";
import Dashboard from "./Pages/DashBoard";
import Login from "./Pages/Login";
import Products from "./Pages/Products";

import "./App.css";

const MyContext = createContext();

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(
    window.innerWidth > 768
  );
  const [isLogin, setIsLogin] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth > 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const router = createBrowserRouter([
    {
      path: "/login",
      element: <Login setIsLogin={setIsLogin} />,
    },
    {
      element: <AdminLayout />,
      children: [
        { path: "/", element: <Dashboard /> },
        { path: "/product", element: <Products /> },
      ],
    },
  ]);

  const values = {
    isSidebarOpen,
    setIsSidebarOpen,
    isLogin,
    setIsLogin,
  };

  return (
    <MyContext.Provider value={values}>
      <RouterProvider router={router} />
    </MyContext.Provider>
  );
}

export default App;
export { MyContext };
