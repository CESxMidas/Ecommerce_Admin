import { memo, useCallback, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  MdKeyboardArrowDown,
  MdKeyboardArrowRight,
} from "react-icons/md";

import { NAV_ITEMS } from "../../config/navigation";
import { useAppContext } from "../../context/AppContext";

import "./index.css";

function SideBar({ isSidebarOpen }) {
  const { closeSidebar, isCompact } = useAppContext();
  const location = useLocation();
  const [openSubmenuId, setOpenSubmenuId] = useState(null);

  const toggleSubMenu = useCallback(
    (id) => {
      if (!isSidebarOpen) return;
      setOpenSubmenuId((current) => (current === id ? null : id));
    },
    [isSidebarOpen]
  );

  const handleNavClick = useCallback(() => {
    if (isCompact) closeSidebar();
  }, [closeSidebar, isCompact]);

  const sidebarClassName = `sidebar ${isSidebarOpen ? "open" : "close"}`;

  const renderSubmenuChild = (child) => {
    if (typeof child === "object" && child.type === "link") {
      return (
        <li key={child.to}>
          <NavLink
            to={child.to}
            className={({ isActive }) => (isActive ? "active" : "")}
            onClick={handleNavClick}
          >
            {child.label}
          </NavLink>
        </li>
      );
    }

    return <li key={child}>{child}</li>;
  };

  return (
    <aside className={sidebarClassName} aria-label="Main navigation">
      <div className="logoWrapper">
        <img
          src="https://cdn-icons-png.flaticon.com/512/1055/1055687.png"
          alt="Admin logo"
          className="logoImg"
        />
      </div>

      <ul className="menuList">
        {NAV_ITEMS.map((item) => {
          if (item.type === "link") {
            const isActive = item.matchPath
              ? location.pathname === item.matchPath
              : undefined;
            const Icon = item.icon;

            return (
              <li key={item.label}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive: routeActive }) =>
                    `menuItem menuItem--link ${
                      routeActive || isActive ? "active" : ""
                    }`
                  }
                  onClick={handleNavClick}
                >
                  <div className="menuLeft">
                    <Icon />
                    <span>{item.label}</span>
                  </div>
                </NavLink>
              </li>
            );
          }

          if (item.type === "static") {
            const Icon = item.icon;
            return (
              <li key={item.label}>
                <div className="menuItem menuItem--static">
                  <div className="menuLeft">
                    <Icon />
                    <span>{item.label}</span>
                  </div>
                </div>
              </li>
            );
          }

          if (item.type === "submenu") {
            const Icon = item.icon;
            const isOpen = openSubmenuId === item.id;

            return (
              <li key={item.id}>
                <button
                  type="button"
                  className={`menuItem menuItem--button ${isOpen ? "opened" : ""}`}
                  onClick={() => toggleSubMenu(item.id)}
                  aria-expanded={isOpen}
                >
                  <div className="menuLeft">
                    <Icon />
                    <span>{item.label}</span>
                  </div>
                  <div className="arrowIcon" aria-hidden="true">
                    {isOpen ? <MdKeyboardArrowDown /> : <MdKeyboardArrowRight />}
                  </div>
                </button>

                <div className={`subMenuWrapper ${isOpen ? "show" : ""}`}>
                  <ul className="subMenu">
                    {item.children.map(renderSubmenuChild)}
                  </ul>
                </div>
              </li>
            );
          }

          return null;
        })}
      </ul>
    </aside>
  );
}

export default memo(SideBar);
