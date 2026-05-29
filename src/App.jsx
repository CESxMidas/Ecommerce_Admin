import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import {
  createContext,
  useEffect,
  useState,
} from "react";

import Header from "./components/Header";
import SideBar from "./components/SideBar";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";

import "./App.css";
import Products from "./Pages/Products";

/* ========================= */
/* CONTEXT */
/* ========================= */

const MyContext = createContext();

/* ========================= */
/* APP */
/* ========================= */

function App() {
  const [isSidebarOpen, setIsSidebarOpen] =
    useState(
      window.innerWidth > 768
    );

  const [isLogin, setIsLogin] =
    useState(false);

  /* ========================= */
  /* AUTO RESPONSIVE SIDEBAR */
  /* ========================= */

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    window.addEventListener(
      "resize",
      handleResize
    );

    return () =>
      window.removeEventListener(
        "resize",
        handleResize
      );
  }, []);

  /* ========================= */
  /* ROUTER */
  /* ========================= */

  const router = createBrowserRouter([
    /* LOGIN */
    {
      path: "/login",

      element: (
        <Login
          setIsLogin={setIsLogin}
        />
      ),
    },
    /* DASHBOARD */
    {
      path: "/",

      element: (
        <section className="mainLayout">
          {/* SIDEBAR */}
          <SideBar
            isSidebarOpen={
              isSidebarOpen
            }
          />

          {/* MOBILE OVERLAY */}
          {isSidebarOpen &&
            window.innerWidth <=
              768 && (
              <div
                className="sidebarOverlay"
                onClick={() =>
                  setIsSidebarOpen(
                    false
                  )
                }
              />
            )}

          {/* RIGHT SIDE */}
          <div
            className={`mainContainer ${
              isSidebarOpen
                ? "sidebarOpen"
                : "sidebarClosed"
            }`}
          >
            {/* HEADER */}
            <Header
              isSidebarOpen={
                isSidebarOpen
              }
              setIsSidebarOpen={
                setIsSidebarOpen
              }
            />

            {/* CONTENT */}
            <main className="dashboardContent">
              <Dashboard />
            </main>
          </div>
        </section>
      ),
    },
    /* PRODUCTS */
    {
      path: "/product",

      element: (
        <section className="mainLayout">
          {/* SIDEBAR */}
          <SideBar
            isSidebarOpen={
              isSidebarOpen
            }
          />

          {/* MOBILE OVERLAY */}
          {isSidebarOpen &&
            window.innerWidth <=
              768 && (
              <div
                className="sidebarOverlay"
                onClick={() =>
                  setIsSidebarOpen(
                    false
                  )
                }
              />
            )}

          {/* RIGHT SIDE */}
          <div
            className={`mainContainer ${
              isSidebarOpen
                ? "sidebarOpen"
                : "sidebarClosed"
            }`}
          >
            {/* HEADER */}
            <Header
              isSidebarOpen={
                isSidebarOpen
              }
              setIsSidebarOpen={
                setIsSidebarOpen
              }
            />

            {/* CONTENT */}
            <main className="dashboardContent">
              <Products />
            </main>
          </div>
        </section>
      ),
    },
  ]);
  
  /* ========================= */
  /* CONTEXT VALUES */
  /* ========================= */

  const values = {
    isSidebarOpen,
    setIsSidebarOpen,

    isLogin,
    setIsLogin,
  };

  return (
    <MyContext.Provider
      value={values}
    >
      <RouterProvider router={router} />
    </MyContext.Provider>
  );
}

export default App;

export { MyContext };