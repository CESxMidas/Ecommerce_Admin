import { useState } from "react";

import Header from "./components/Header";
import SideBar from "./components/SideBar";
import Dashboard from "./pages/Dashboard";

import "./App.css";

function App() {
  const [isSidebarOpen, setIsSidebarOpen] =
    useState(true);

  return (
    <div className="mainLayout">
      {/* SIDEBAR */}
      <SideBar
        isSidebarOpen={isSidebarOpen}
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
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={
            setIsSidebarOpen
          }
        />

        <div className="dashboardContent">
          <Dashboard />
        </div>
      </div>
    </div>
  );
}

export default App;