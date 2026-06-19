import { useState } from "react";

import {
  Button,
  IconButton,
  Menu,
  MenuItem,
  Badge,
  Divider,
} from "@mui/material";

import {
  MdMenuOpen,
  MdMenu,
  MdOutlineNotificationsNone,
  MdOutlineLogout,
} from "react-icons/md";

import { FaRegUserCircle } from "react-icons/fa";

import "./index.css";

const Header = ({
  isSidebarOpen,
  setIsSidebarOpen,
}) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const open = Boolean(anchorEl);

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  return (
    <header className="header px-3 md:px-5 lg:px-7">
      {/* LEFT */}
      <div className="headerLeft">
        <Button
          className="menuBtn"
          onClick={handleToggleSidebar}
        >
          {isSidebarOpen ? (
            <MdMenuOpen size={22} />
          ) : (
            <MdMenu size={22} />
          )}
        </Button>

        <div className="flex items-center gap-3">
          <div className="logoBox">
            S
          </div>

          <div className="hidden md:block">
            <h1 className="logoText">
              SoftKey Admin
            </h1>

            <p className="logoSubText">
              Software License Dashboard
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT */}
      <div className="headerRight">
        <div className="searchBox hidden lg:flex">
          <input
            type="text"
            placeholder="Search here..."
          />
        </div>

        {/* NOTIFICATION */}
        <IconButton className="iconBtn">
          <Badge
            badgeContent={4}
            color="error"
          >
            <MdOutlineNotificationsNone
              size={22}
            />
          </Badge>
        </IconButton>

        {/* USER */}
        <div>
          <IconButton
            className="iconBtn"
            onClick={handleOpenMenu}
          >
            <FaRegUserCircle size={24} />
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleCloseMenu}
          >
            <div className="userInfo">
              <div className="userAvatar">
                <FaRegUserCircle size={30} />
              </div>

              <div>
                <h3>Hoàng Đỗ</h3>

                <p>Administrator</p>
              </div>
            </div>

            <Divider />

            <MenuItem
              onClick={handleCloseMenu}
            >
              <FaRegUserCircle size={20} />
              &nbsp; Profile
            </MenuItem>

            <MenuItem
              onClick={handleCloseMenu}
            >
              <MdOutlineLogout size={22} />
              &nbsp; Sign Out
            </MenuItem>
          </Menu>
        </div>
      </div>
    </header>
  );
};

export default Header;