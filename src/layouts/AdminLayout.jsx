import { useEffect } from "react";
import { Outlet } from "react-router-dom";

import Header from "../Components/Header";
import SideBar from "../Components/SideBar";
import { ProductsProvider } from "../context/ProductsContext";
import { useAppContext } from "../context/AppContext";

import "../App.css";

function AdminLayoutContent() {
  const { isSidebarOpen, isCompact, closeSidebar } = useAppContext();

  const mainClassName = `mainContainer ${
    isSidebarOpen ? "sidebarOpen" : "sidebarClosed"
  }`;

  const layoutClassName = `mainLayout admin-layout${
    isCompact ? " mainLayout--compact" : ""
  }`;

  useEffect(() => {
    const shouldLock = isCompact && isSidebarOpen;
    document.body.classList.toggle("admin-drawer-open", shouldLock);

    return () => {
      document.body.classList.remove("admin-drawer-open");
    };
  }, [isCompact, isSidebarOpen]);

  return (
    <section className={layoutClassName}>
      <SideBar isSidebarOpen={isSidebarOpen} />

      {isSidebarOpen && isCompact && (
        <button
          type="button"
          className="sidebarOverlay"
          onClick={closeSidebar}
          aria-label="Close sidebar"
        />
      )}

      <div className={mainClassName}>
        <Header />

        <main className="dashboardContent" id="main-content">
          <Outlet />
        </main>
      </div>
    </section>
  );
}

export default function AdminLayout() {
  return (
    <ProductsProvider>
      <AdminLayoutContent />
    </ProductsProvider>
  );
}
