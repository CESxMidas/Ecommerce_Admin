import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import {
  createContext,
  useState,
} from "react";

import Header from "./components/Header";
import SideBar from "./components/SideBar";

import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";

import "./App.css";

/* ========================= */
/* CONTEXT */
/* ========================= */

const MyContext = createContext();

function App() {
  const [isSidebarOpen, setIsSidebarOpen] =
    useState(true);

  const [isLogin, setIsLogin] =
    useState(false);

  /* ========================= */
  /* ROUTER */
  /* ========================= */

  const router = createBrowserRouter([
    /* LOGIN PAGE */
    {
      path: "/login",

      element: (
        <Login setIsLogin={setIsLogin} />
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

          {/* RIGHT */}
          <div
            className={`mainContainer ${
              isSidebarOpen
                ? "sidebarOpen"
                : "sidebarClosed"
            }`}
          >
            <Header
              isSidebarOpen={
                isSidebarOpen
              }
              setIsSidebarOpen={
                setIsSidebarOpen
              }
            />

            <div className="dashboardContent">
              <Dashboard />
            </div>
          </div>
        </section>
      ),
    },
  ]);

  /* ========================= */
  /* VALUES */
  /* ========================= */

  const values = {
    isSidebarOpen,
    setIsSidebarOpen,

    isLogin,
    setIsLogin,
  };

  return (
    <>
      <MyContext.Provider
        value={values}
      >
        <RouterProvider
          router={router}
        />
      </MyContext.Provider>
    </>
  );
}

export default App;

export { MyContext };