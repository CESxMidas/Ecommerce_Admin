import { useState } from "react";

import {
  MdDashboard,
  MdKeyboardArrowDown,
  MdKeyboardArrowRight,
  MdCategory,
  MdPeople,
  MdOutlineShoppingBag,
  MdLogout,
  MdOutlineLayers,
  MdOutlineImage,
} from "react-icons/md";

import {
  FaBloggerB,
  FaProductHunt,
} from "react-icons/fa";

import "./index.css";

const SideBar = ({ isSidebarOpen }) => {
  const [subMenuIndex, setSubMenuIndex] =
    useState(null);

  const isOpenSubMenu = (index) => {
    if (!isSidebarOpen) return;

    setSubMenuIndex((prev) =>
      prev === index ? null : index
    );
  };

  return (
    <aside
      className={`sidebar ${
        isSidebarOpen ? "open" : "close"
      }`}
    >
      {/* LOGO */}
      <div className="logoWrapper">
        <img
          src="https://cdn-icons-png.flaticon.com/512/1055/1055687.png"
          alt="logo"
          className="logoImg"
        />
      </div>

      {/* MENU */}
      <ul className="menuList">
        {/* DASHBOARD */}
        <li className="menuItem active">
          <div className="menuLeft">
            <MdDashboard />
            <span>Dashboard</span>
          </div>
        </li>

        {/* HOME SLIDES */}
        <li>
          <div
            className={`menuItem ${
              subMenuIndex === 0
                ? "opened"
                : ""
            }`}
            onClick={() =>
              isOpenSubMenu(0)
            }
          >
            <div className="menuLeft">
              <MdOutlineImage />
              <span>Home Slides</span>
            </div>

            <div className="arrowIcon">
              {subMenuIndex === 0 ? (
                <MdKeyboardArrowDown />
              ) : (
                <MdKeyboardArrowRight />
              )}
            </div>
          </div>

          <div
            className={`subMenuWrapper ${
              subMenuIndex === 0
                ? "show"
                : ""
            }`}
          >
            <ul className="subMenu">
              <li>Home slide list</li>

              <li>
                Add home banner slide
              </li>
            </ul>
          </div>
        </li>

        {/* CATEGORY */}
        <li>
          <div
            className={`menuItem ${
              subMenuIndex === 1
                ? "opened"
                : ""
            }`}
            onClick={() =>
              isOpenSubMenu(1)
            }
          >
            <div className="menuLeft">
              <MdCategory />
              <span>Category</span>
            </div>

            <div className="arrowIcon">
              {subMenuIndex === 1 ? (
                <MdKeyboardArrowDown />
              ) : (
                <MdKeyboardArrowRight />
              )}
            </div>
          </div>

          <div
            className={`subMenuWrapper ${
              subMenuIndex === 1
                ? "show"
                : ""
            }`}
          >
            <ul className="subMenu">
              <li>Category List</li>
              <li>Add Category</li>
              <li>Sub Category</li>
              <li>Add Sub Category</li>
            </ul>
          </div>
        </li>

        {/* PRODUCTS */}
        <li>
          <div
            className={`menuItem ${
              subMenuIndex === 2
                ? "opened"
                : ""
            }`}
            onClick={() =>
              isOpenSubMenu(2)
            }
          >
            <div className="menuLeft">
              <FaProductHunt />
              <span>Products</span>
            </div>

            <div className="arrowIcon">
              {subMenuIndex === 2 ? (
                <MdKeyboardArrowDown />
              ) : (
                <MdKeyboardArrowRight />
              )}
            </div>
          </div>

          <div
            className={`subMenuWrapper ${
              subMenuIndex === 2
                ? "show"
                : ""
            }`}
          >
            <ul className="subMenu">
              <li>Product List</li>
              <li>Product Upload</li>
              <li>Product Reviews</li>
            </ul>
          </div>
        </li>

        {/* USERS */}
        <li className="menuItem">
          <div className="menuLeft">
            <MdPeople />
            <span>Users</span>
          </div>
        </li>

        {/* ORDERS */}
        <li className="menuItem">
          <div className="menuLeft">
            <MdOutlineShoppingBag />
            <span>Orders</span>
          </div>
        </li>

        {/* BANNERS */}
        <li>
          <div
            className={`menuItem ${
              subMenuIndex === 3
                ? "opened"
                : ""
            }`}
            onClick={() =>
              isOpenSubMenu(3)
            }
          >
            <div className="menuLeft">
              <FaProductHunt />
              <span>Banners</span>
            </div>

            <div className="arrowIcon">
              {subMenuIndex === 3 ? (
                <MdKeyboardArrowDown />
              ) : (
                <MdKeyboardArrowRight />
              )}
            </div>
          </div>

          <div
            className={`subMenuWrapper ${
              subMenuIndex === 3
                ? "show"
                : ""
            }`}
          >
            <ul className="subMenu">
              <li>All Banners</li>
              <li>Add Banner</li>
              <li>Banner Settings</li>
            </ul>
          </div>
        </li>

        {/* BLOGS */}
        <li>
          <div
            className={`menuItem ${
              subMenuIndex === 4
                ? "opened"
                : ""
            }`}
            onClick={() =>
              isOpenSubMenu(4)
            }
          >
            <div className="menuLeft">
              <FaBloggerB />
              <span>Blogs</span>
            </div>

            <div className="arrowIcon">
              {subMenuIndex === 4 ? (
                <MdKeyboardArrowDown />
              ) : (
                <MdKeyboardArrowRight />
              )}
            </div>
          </div>

          <div
            className={`subMenuWrapper ${
              subMenuIndex === 4
                ? "show"
                : ""
            }`}
          >
            <ul className="subMenu">
              <li>All Blogs</li>
              <li>Add Blog</li>
              <li>Blog Category</li>
            </ul>
          </div>
        </li>

        {/* MANAGE LOGO */}
        <li className="menuItem">
          <div className="menuLeft">
            <MdOutlineLayers />
            <span>Manage Logo</span>
          </div>
        </li>

        {/* LOGOUT */}
        <li className="menuItem">
          <div className="menuLeft">
            <MdLogout />
            <span>Logout</span>
          </div>
        </li>
      </ul>
    </aside>
  );
};

export default SideBar;