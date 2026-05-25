import React, { useState } from "react";
import DashboarBoxes from "../../Components/DashboardBox";
import "./index.css";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
const ordersData = [
  {
    id: "#ORD-1025",
    paymentId: "PAY-784512",
    name: "John Carter",
    phone: "+1 234 567 890",
    address: "New York, USA",
    pincode: "10001",
    total: "$420.00",
    email: "john@gmail.com",
    userId: "USR-001",
    status: "Completed",

    products: [
      {
        image:
          "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?q=80&w=800&auto=format&fit=crop",
        name: "Gaming Headset",
        qty: 1,
        price: "$120",
      },

      {
        image:
          "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?q=80&w=800&auto=format&fit=crop",
        name: "Mechanical Keyboard",
        qty: 2,
        price: "$300",
      },
    ],
  },
];
const DashBoard = () => {
  const [openRow, setOpenRow] = useState(null);
  return (
    <div>
      <div className="dashboardBoxes w-full">
        <div
          className="
          welcomeBox
          flex
          items-center
          justify-between
          rounded-[30px]
          overflow-hidden
          relative
        "
        >
          {/* CIRCLE BG */}
          <div className="circleOne"></div>
          <div className="circleTwo"></div>

          {/* LEFT */}
          <div className="info relative z-10">
            <span className="badge">Ecommerce Dashboard</span>

            <h2 className="title">
              Good Morning,
              <br />
              Cameron 👋
            </h2>

            <p className="desc">
              Here’s what happening on your store today. See the statistics at
              once.
            </p>

            <button className="addBtn">+ Add Product</button>
          </div>

          {/* RIGHT */}
          <div className="imageWrapper relative z-10">
            <img
              src="https://cdn-icons-png.flaticon.com/512/2331/2331970.png"
              alt=""
            />
          </div>
        </div>
      </div>
      <DashboarBoxes />


      <div className="ordersTable card mx-3 overflow-hidden">
        {/* HEADER */}
        <div className="ordersHeader">
          <div>
            <h2>Recent Orders</h2>
            <p>Latest customer purchases</p>
          </div>

          <button className="viewAllBtn">
            View All
          </button>
        </div>

        {/* TABLE */}
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[1700px]">
            <thead>
              <tr>
                <th>ACTION</th>
                <th>ORDER ID</th>
                <th>PAYMENT ID</th>
                <th>NAME</th>
                <th>PHONE</th>
                <th>ADDRESS</th>
                <th>PINCODE</th>
                <th>TOTAL</th>
                <th>EMAIL</th>
                <th>USER ID</th>
                <th>STATUS</th>
              </tr>
            </thead>

            <tbody>
              {ordersData.map((order, index) => (
                <React.Fragment key={index}>
                  {/* MAIN ROW */}
                  <tr className="mainRow">
                    <td>
                      <button
                        onClick={() =>
                          setOpenRow(
                            openRow === index
                              ? null
                              : index
                          )
                        }
                        className="actionBtn"
                      >
                        {openRow === index ? (
                          <FaChevronUp size={12} />
                        ) : (
                          <FaChevronDown size={12} />
                        )}
                      </button>
                    </td>

                    <td className="orderId">
                      {order.id}
                    </td>

                    <td>{order.paymentId}</td>

                    <td className="text-white">
                      {order.name}
                    </td>

                    <td>{order.phone}</td>

                    <td>{order.address}</td>

                    <td>{order.pincode}</td>

                    <td className="totalPrice">
                      {order.total}
                    </td>

                    <td>{order.email}</td>

                    <td>{order.userId}</td>

                    <td>
                      <span className="statusBadge">
                        {order.status}
                      </span>
                    </td>
                  </tr>

                  {/* PRODUCT DETAIL */}
                  {openRow === index && (
                    <tr>
                      <td
                        colSpan="11"
                        className="productDetailTd"
                      >
                        <div className="productWrapper">
                          {/* PRODUCT HEADER */}
                          <div className="productHeader">
                            <h4>PRODUCT ID</h4>
                            <h4>PRODUCT</h4>
                            <h4>IMAGE</h4>
                            <h4>QTY</h4>
                            <h4>PRICE</h4>
                            <h4>TOTAL</h4>
                          </div>

                          {/* PRODUCT ITEMS */}
                          {order.products.map(
                            (product, i) => (
                              <div
                                key={i}
                                className="productItem"
                              >
                                <div className="productId">
                                  PRD-102
                                </div>

                                <div className="productInfo">
                                  <h5>
                                    {product.name}
                                  </h5>

                                  <p>
                                    Premium Product
                                  </p>
                                </div>

                                <div>
                                  <img
                                    src={
                                      product.image
                                    }
                                    alt=""
                                    className="productImage"
                                  />
                                </div>

                                <div className="productQty">
                                  x{product.qty}
                                </div>

                                <div className="productPrice">
                                  {product.price}
                                </div>

                                <div className="productTotal">
                                  $
                                  {(
                                    Number(
                                      product.price.replace(
                                        "$",
                                        ""
                                      )
                                    ) *
                                    product.qty
                                  ).toFixed(2)}
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashBoard;
