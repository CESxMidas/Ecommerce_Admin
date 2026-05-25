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
    MdOutlineNotificationsNone,
    MdOutlineLogout,
} from "react-icons/md";

import { FaRegUserCircle } from "react-icons/fa";

import "./index.css";

const Header = () => {
    const [anchorEl, setAnchorEl] = useState(null);

    const open = Boolean(anchorEl);

    const handleOpenMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
    };

    return (
        <header
            className="
        header
        px-3
        md:px-5
        lg:px-7
      "
        >
            {/* LEFT */}
            <div className="headerLeft">
                <Button className="menuBtn">
                    <MdMenuOpen size={22} />
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
                {/* SEARCH */}
                <div className="searchBox hidden lg:flex">
                    <input
                        type="text"
                        placeholder="Search here..."
                    />
                </div>

                {/* NOTIFICATION */}
                <IconButton className="iconBtn">
                    <Badge badgeContent={4} color="error">
                        <MdOutlineNotificationsNone size={22} />
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

                    <Menu className="profileMenu"
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleCloseMenu}
                    >
                        {/* USER INFO */}
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

                        {/* PROFILE */}
                        <MenuItem
                            className="menuItem"
                            onClick={handleCloseMenu}
                        >
                            <FaRegUserCircle size={20} />

                            Profile
                        </MenuItem>

                        {/* LOGOUT */}
                        <MenuItem
                            className="menuItem"
                            onClick={handleCloseMenu}
                        >
                            <MdOutlineLogout size={22} />

                            Sign Out
                        </MenuItem>
                    </Menu>
                </div>
            </div>
        </header>
    );
};

export default Header;