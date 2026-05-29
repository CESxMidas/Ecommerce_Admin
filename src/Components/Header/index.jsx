import { memo, useCallback, useState } from "react";
import {
  Badge,
  Button,
  Divider,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  MdMenu,
  MdMenuOpen,
  MdOutlineLogout,
  MdOutlineNotificationsNone,
} from "react-icons/md";
import { FaRegUserCircle } from "react-icons/fa";

import { useAppContext } from "../../context/AppContext";

import "./index.css";

function Header() {
  const { isSidebarOpen, toggleSidebar } = useAppContext();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleToggleSidebar = useCallback(() => {
    toggleSidebar();
  }, [toggleSidebar]);

  const handleOpenMenu = useCallback((event) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleCloseMenu = useCallback(() => {
    setAnchorEl(null);
  }, []);

  return (
    <header className="header">
      <div className="headerLeft">
        <Button
          type="button"
          className="menuBtn"
          onClick={handleToggleSidebar}
          aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {isSidebarOpen ? <MdMenuOpen size={22} /> : <MdMenu size={22} />}
        </Button>

        <div className="headerBrand">
          <div className="logoBox" aria-hidden="true">
            S
          </div>
          <div className="headerBrandText">
            <p className="logoText">SoftKey Admin</p>
            <p className="logoSubText">Software License Dashboard</p>
          </div>
        </div>
      </div>

      <div className="headerRight">
        <div className="searchBox">
          <input
            type="search"
            placeholder="Search here..."
            aria-label="Search dashboard"
            autoComplete="off"
          />
        </div>

        <IconButton className="iconBtn" aria-label="Notifications">
          <Badge badgeContent={4} color="error">
            <MdOutlineNotificationsNone size={22} />
          </Badge>
        </IconButton>

        <IconButton
          className="iconBtn"
          onClick={handleOpenMenu}
          aria-label="User menu"
          aria-controls={open ? "user-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
        >
          <FaRegUserCircle size={24} />
        </IconButton>

        <Menu
          id="user-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleCloseMenu}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          slotProps={{
            paper: { className: "headerUserMenu" },
            list: {
              className: "headerUserMenu__list",
              disablePadding: true,
              "aria-labelledby": "user-menu",
            },
          }}
        >
          <MenuItem
            disableRipple
            disabled
            className="headerUserMenu__profile"
            tabIndex={-1}
          >
            <span className="headerUserMenu__avatar" aria-hidden="true">
              <FaRegUserCircle size={28} />
            </span>
            <span className="headerUserMenu__profileText">
              <span className="headerUserMenu__name">Hoàng Đỗ</span>
              <span className="headerUserMenu__role">Administrator</span>
            </span>
          </MenuItem>

          <Divider component="li" className="headerUserMenu__divider" />

          <MenuItem onClick={handleCloseMenu} className="headerUserMenu__item">
            <span className="headerUserMenu__icon" aria-hidden="true">
              <FaRegUserCircle size={20} />
            </span>
            <span className="headerUserMenu__label">Profile</span>
          </MenuItem>

          <MenuItem onClick={handleCloseMenu} className="headerUserMenu__item">
            <span className="headerUserMenu__icon" aria-hidden="true">
              <MdOutlineLogout size={20} />
            </span>
            <span className="headerUserMenu__label">Sign Out</span>
          </MenuItem>
        </Menu>
      </div>
    </header>
  );
}

export default memo(Header);
