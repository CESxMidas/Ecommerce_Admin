import "./App.css";

import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import Header from "./Components/Header";
import SideBar from "./Components/SideBar";

function DashboardLayout() {
  return (
    <section className="mainLayout">
      {/* SIDEBAR */}
      <SideBar />

      {/* RIGHT SIDE */}
      <div className="contentRight">
        <Header />

        <div className="dashboardContent">
          <h1 className="text-white text-4xl font-bold">
            Dashboard
          </h1>
        </div>
      </div>
    </section>
  );
}

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <DashboardLayout />,
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;