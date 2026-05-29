import {
  MdCategory,
  MdDashboard,
  MdLogout,
  MdOutlineImage,
  MdOutlineLayers,
  MdOutlineShoppingBag,
  MdPeople,
} from "react-icons/md";
import { FaBloggerB, FaProductHunt } from "react-icons/fa";

export const NAV_ITEMS = [
  {
    type: "link",
    to: "/",
    end: true,
    label: "Dashboard",
    icon: MdDashboard,
  },
  {
    type: "submenu",
    id: "home-slides",
    label: "Home Slides",
    icon: MdOutlineImage,
    children: ["Home slide list", "Add home banner slide"],
  },
  {
    type: "submenu",
    id: "category",
    label: "Category",
    icon: MdCategory,
    children: [
      "Category List",
      "Add Category",
      "Sub Category",
      "Add Sub Category",
    ],
  },
  {
    type: "submenu",
    id: "products",
    label: "Products",
    icon: FaProductHunt,
    children: [
      { type: "link", to: "/product", label: "Product List" },
      "Product Upload",
      "Product Reviews",
    ],
  },
  {
    type: "static",
    label: "Users",
    icon: MdPeople,
  },
  {
    type: "static",
    label: "Orders",
    icon: MdOutlineShoppingBag,
  },
  {
    type: "submenu",
    id: "banners",
    label: "Banners",
    icon: FaProductHunt,
    children: ["All Banners", "Add Banner", "Banner Settings"],
  },
  {
    type: "submenu",
    id: "blogs",
    label: "Blogs",
    icon: FaBloggerB,
    children: ["All Blogs", "Add Blog", "Blog Category"],
  },
  {
    type: "static",
    label: "Manage Logo",
    icon: MdOutlineLayers,
  },
  {
    type: "link",
    to: "/login",
    label: "Logout",
    icon: MdLogout,
    matchPath: "/login",
  },
];
