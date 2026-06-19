import { useContext } from "react";
import { Outlet } from "react-router-dom";

import Header from "../Components/Header";
import SideBar from "../Components/SideBar";
import { MyContext } from "../App";

const AdminLayout = () => {
  const { isSidebarOpen, setIsSidebarOpen } = useContext(MyContext);

  return (
    <div className="mainLayout">
      <SideBar isSidebarOpen={isSidebarOpen} />

      {isSidebarOpen && (
        <button
          type="button"
          className="sidebarOverlay md:hidden"
          aria-label="Close sidebar"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <main
        className={`mainContainer ${
          isSidebarOpen ? "sidebarOpen" : "sidebarClosed"
        }`}
      >
        <Header
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />

        <div className="dashboardContent">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
