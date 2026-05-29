import { lazy, Suspense, useMemo, useState } from "react";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";

import AdminLayout from "./layouts/AdminLayout";
import { AppContext } from "./context/AppContext";
import { useSidebar } from "./hooks/useSidebar";

import "./App.css";

const Dashboard = lazy(() => import("./Pages/DashBoard"));
const Products = lazy(() => import("./Pages/Products"));
const Login = lazy(() => import("./Pages/Login"));

function PageLoader() {
  return (
    <div className="page-loader" role="status" aria-live="polite">
      <span className="page-loader__spinner" aria-hidden="true" />
      <span>Loading…</span>
    </div>
  );
}

function App() {
  const [isLogin, setIsLogin] = useState(false);
  const sidebar = useSidebar();

  const router = useMemo(
    () =>
      createBrowserRouter([
        {
          path: "/login",
          element: (
            <Suspense fallback={<PageLoader />}>
              <Login setIsLogin={setIsLogin} />
            </Suspense>
          ),
        },
        {
          element: <AdminLayout />,
          children: [
            {
              index: true,
              element: (
                <Suspense fallback={<PageLoader />}>
                  <Dashboard />
                </Suspense>
              ),
            },
            {
              path: "product",
              element: (
                <Suspense fallback={<PageLoader />}>
                  <Products />
                </Suspense>
              ),
            },
          ],
        },
        {
          path: "*",
          element: <Navigate to="/" replace />,
        },
      ]),
    []
  );

  const contextValue = useMemo(
    () => ({
      isSidebarOpen: sidebar.isSidebarOpen,
      isCompact: sidebar.isCompact,
      isMobile: sidebar.isMobile,
      setIsSidebarOpen: sidebar.setIsSidebarOpen,
      toggleSidebar: sidebar.toggleSidebar,
      closeSidebar: sidebar.closeSidebar,
      isLogin,
      setIsLogin,
    }),
    [sidebar, isLogin]
  );

  return (
    <AppContext.Provider value={contextValue}>
      <RouterProvider router={router} />
    </AppContext.Provider>
  );
}

export default App;
