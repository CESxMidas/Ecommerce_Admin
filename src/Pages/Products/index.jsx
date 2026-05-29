import React from "react";
import {
  FiSearch,
  FiFilter,
  FiGrid,
  FiEdit2,
  FiEye,
  FiTrash2,
  FiUpload,
  FiPlus,
} from "react-icons/fi";

import { FaStar } from "react-icons/fa";

import Progress from "../../Components/Progress";

import "./index.css";

const productData = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1512436991641-6745cdb1723f",
    name: "Tasty Metal Shirt",
    category: "Books",
    sku: "SKU-52442",
    stock: 30,
    price: "$410.00",
    rating: 3.5,
    reviews: 14,
    status: "Pending",
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab",
    name: "Modern Gloves",
    category: "Kids",
    sku: "SKU-98424",
    stock: 0,
    price: "$340.00",
    rating: 4.5,
    reviews: 9,
    status: "Draft",
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
    name: "Rustic Steel Computer",
    category: "Games",
    sku: "SKU-78192",
    stock: 50,
    price: "$948.00",
    rating: 3.8,
    reviews: 19,
    status: "Draft",
  },
  {
    id: 4,
    image:
      "https://images.unsplash.com/photo-1585386959984-a4155224a1ad",
    name: "Licensed Concrete Cheese",
    category: "Electronics",
    sku: "SKU-86229",
    stock: 0,
    price: "$853.00",
    rating: 2.5,
    reviews: 5,
    status: "Pending",
  },
  {
    id: 5,
    image:
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c",
    name: "Electronic Rubber Table",
    category: "Books",
    sku: "SKU-89762",
    stock: 18,
    price: "$881.00",
    rating: 4,
    reviews: 12,
    status: "Publish",
  },
];

const Products = () => {
  return (
    <section className="productsPage">
      {/* TOP */}
      <div className="productsPage_top">
        <div className="productsPage_top_left">
          <h1>Products</h1>

          <div className="productsPage_breadcrumb">
            <span>E-Commerce</span>
            <span>•</span>
            <span>Products</span>
            <span>•</span>
            <span>List</span>
          </div>
        </div>

        <div className="productsPage_top_right">
          <button className="productsPage_btn productsPage_btn_outline">
            <FiUpload />
            Export
          </button>

          <button className="productsPage_btn productsPage_btn_primary">
            <FiPlus />
            Add Product
          </button>
        </div>
      </div>

      {/* FILTER */}
      <div className="productsPage_filter">
        <div className="productsPage_search">
          <FiSearch />

          <input
            type="text"
            placeholder="Search by product name..."
          />
        </div>

        <div className="productsPage_filter_actions">
          <button className="productsPage_btn productsPage_btn_outline">
            <FiFilter />
            Filters
          </button>

          <button className="productsPage_icon_btn">
            <FiGrid />
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="productsPage_table_wrapper">
        <table className="productsPage_table">
          <thead>
            <tr>
              <th>
                <input type="checkbox" />
              </th>

              <th>PRODUCT</th>
              <th>SKU</th>
              <th>STOCK</th>
              <th>PRICE</th>
              <th>RATING</th>
              <th>STATUS</th>
              <th>ACTION</th>
            </tr>
          </thead>

          <tbody>
            {productData.map((item) => (
              <tr key={item.id}>
                <td>
                  <input type="checkbox" />
                </td>

                {/* PRODUCT */}
                <td>
                  <div className="productsPage_product">
                    <div className="productsPage_product_img">
                      <img
                        src={item.image}
                        alt={item.name}
                      />
                    </div>

                    <div className="productsPage_product_info">
                      <h4>{item.name}</h4>

                      <p>{item.category}</p>
                    </div>
                  </div>
                </td>

                {/* SKU */}
                <td>
                  <span className="productsPage_sku">
                    {item.sku}
                  </span>
                </td>

                {/* STOCK */}
                <td>
                  <div className="productsPage_stock">
                    <Progress value={item.stock} />

                    <p>
                      {item.stock === 0
                        ? "Out of stock"
                        : `${item.stock} in stock`}
                    </p>
                  </div>
                </td>

                {/* PRICE */}
                <td>
                  <span className="productsPage_price">
                    {item.price}
                  </span>
                </td>

                {/* RATING */}
                <td>
                  <div className="productsPage_rating">
                    <span className="productsPage_rating_value">
                      {item.rating}
                    </span>

                    <div className="productsPage_rating_stars">
                      {[...Array(5)].map((_, index) => (
                        <FaStar
                          key={index}
                          className={
                            index <
                            Math.floor(item.rating)
                              ? "active"
                              : ""
                          }
                        />
                      ))}
                    </div>

                    <p>({item.reviews})</p>
                  </div>
                </td>

                {/* STATUS */}
                <td>
                  <span
                    className={`productsPage_status ${item.status.toLowerCase()}`}
                  >
                    {item.status}
                  </span>
                </td>

                {/* ACTION */}
                <td>
                  <div className="productsPage_actions">
                    <button className="editBtn">
                      <FiEdit2 />
                    </button>

                    <button className="viewBtn">
                      <FiEye />
                    </button>

                    <button className="deleteBtn">
                      <FiTrash2 />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default Products;