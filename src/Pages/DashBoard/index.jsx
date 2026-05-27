import React, { useState } from "react";
import Progress from "../../Components/Progress";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import {
  FaChevronDown,
  FaChevronUp,
  FaEdit,
  FaTrash,
  FaStar,
} from "react-icons/fa";

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Collapse,
  Box,
  TablePagination,
} from "@mui/material";

import "./index.css";

/* ================= DATA ================= */

const products = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
    name: "Nike Air Max",
    category: "Shoes",
    subCategory: "Sneakers",
    price: "$120",
    sales: 230,
    stock: 70,
    rating: 4.5,
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
    name: "Apple Watch",
    category: "Electronics",
    subCategory: "Smartwatch",
    price: "$540",
    sales: 120,
    stock: 45,
    rating: 4.8,
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
    name: "Headphone",
    category: "Audio",
    subCategory: "Wireless",
    price: "$89",
    sales: 310,
    stock: 90,
    rating: 4.2,
  },
];

const ordersData = [
  {
    id: "#ORD-1025",
    paymentId: "PAY-784512",
    name: "John Carter",
    phone: "+1 234 567 890",
    address: "New York, USA",
    total: "$420.00",
    status: "Completed",
    products: [
      {
        image: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5",
        name: "Gaming Headset",
        qty: 1,
        price: "$120",
      },
      {
        image: "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae",
        name: "Mechanical Keyboard",
        qty: 2,
        price: "$300",
      },
    ],
  },
];

const chartData = [
  {
    name: "Page A",
    uv: 4000,
    pv: 2400,
    amt: 2400,
  },
  {
    name: "Page B",
    uv: 3000,
    pv: 1398,
    amt: 2210,
  },
  {
    name: "Page C",
    uv: 2000,
    pv: 9800,
    amt: 2290,
  },
  {
    name: "Page D",
    uv: 2780,
    pv: 3908,
    amt: 2000,
  },
  {
    name: "Page E",
    uv: 1890,
    pv: 4800,
    amt: 2181,
  },
  {
    name: "Page F",
    uv: 2390,
    pv: 3800,
    amt: 2500,
  },
  {
    name: "Page G",
    uv: 3490,
    pv: 4300,
    amt: 2100,
  },
];
// #endregion

/* ================= COMPONENT ================= */

const DashBoard = () => {
  const [openRow, setOpenRow] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const toggleRow = (i) => setOpenRow(openRow === i ? null : i);
  const [chart1Data, setChar1tData] = useState(chartData);
  return (
    <div className="dashboard">
      {/* ================= WELCOME ================= */}
      <section className="dashboard__welcome">
        <div className="dashboard__circle dashboard__circle--1" />
        <div className="dashboard__circle dashboard__circle--2" />

        <div className="dashboard__welcome-info">
          <span className="dashboard__badge">Ecommerce Dashboard</span>

          <h2 className="dashboard__title">
            Good Morning,
            <br /> Admin 👋
          </h2>

          <p className="dashboard__desc">
            Overview of your store performance today
          </p>

          <button className="dashboard__btn">+ Add Product</button>
        </div>

        <div className="dashboard__welcome-img">
          <img
            src="https://cdn-icons-png.flaticon.com/512/2331/2331970.png"
            alt=""
          />
        </div>
      </section>

      {/* ================= PRODUCTS ================= */}
      <section className="dashboard__card">
        {/* ================= HEADER CONTROLS ================= */}
        <div className="dashboard__tableHeader">
          {/* LEFT: TITLE */}
          <div>
            <h3 className="dashboard__title-sm">Recent Products</h3>
            <p className="dashboard__subtitle">
              Manage your products, filter and search easily
            </p>
          </div>

          {/* RIGHT: CONTROLS */}
          <div className="dashboard__controls">
            {/* SEARCH */}
            <input
              type="text"
              placeholder="Search product..."
              className="dashboard__search"
            />

            {/* CATEGORY */}
            <select className="dashboard__select">
              <option>Category By</option>
              <option>Shoes</option>
              <option>Electronics</option>
              <option>Audio</option>
            </select>

            {/* SUB CATEGORY */}
            <select className="dashboard__select">
              <option>Sub Category By</option>
              <option>Sneakers</option>
              <option>Smartwatch</option>
              <option>Wireless</option>
            </select>

            {/* THIRD CATEGORY */}
            <select className="dashboard__select">
              <option>Third Level Sub Category By</option>
              <option>Premium</option>
              <option>Basic</option>
              <option>Pro</option>
            </select>

            {/* ADD BUTTON */}
            <button className="dashboard__addBtn">+ Add Product</button>
          </div>
        </div>

        {/* ================= TABLE ================= */}
        <TableContainer
          component={Paper}
          className="dashboard__table"
          sx={{
            background: "transparent",
            boxShadow: "none",
          }}
        >
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Product</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Sub</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Sales</TableCell>
                <TableCell>Stock</TableCell>
                <TableCell>Rating</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {products
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((p) => (
                  <TableRow key={p.id} hover>
                    <TableCell>
                      <div className="dashboard__product">
                        <input
                          type="checkbox"
                          className="dashboard__checkbox"
                        />

                        <img src={p.image} />

                        <div>
                          <h4>{p.name}</h4>
                          <p>ID #{p.id}</p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className="dashboard__badge">{p.category}</span>
                    </TableCell>

                    <TableCell>{p.subCategory}</TableCell>

                    <TableCell className="dashboard__price">
                      {p.price}
                    </TableCell>

                    <TableCell>{p.sales}</TableCell>

                    <TableCell>
                      <Progress value={p.stock} />
                    </TableCell>

                    <TableCell>
                      <div className="dashboard__rating">
                        <FaStar /> {p.rating}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="dashboard__actions">
                        <button>
                          <FaEdit />
                        </button>
                        <button>
                          <FaTrash />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* PAGINATION */}
        <TablePagination
          component="div"
          count={products.length}
          page={page}
          onPageChange={(e, v) => setPage(v)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(+e.target.value);
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 20]}
          className="dashboard__pagination"
        />
      </section>

      {/* ================= ORDERS ================= */}
      <section className="dashboard__card">
        <h3 className="dashboard__title-sm">Recent Orders</h3>
        <TableContainer
          component={Paper}
          className="dashboard__table"
          sx={{
            background: "transparent",
            boxShadow: "none",
          }}
        >
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Action</TableCell>
                <TableCell>ID</TableCell>
                <TableCell>Payment</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Address</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {ordersData.map((o, i) => (
                <React.Fragment key={i}>
                  <TableRow hover>
                    <TableCell>
                      <button
                        className="dashboard__expand"
                        onClick={() => toggleRow(i)}
                      >
                        {openRow === i ? <FaChevronUp /> : <FaChevronDown />}
                      </button>
                    </TableCell>

                    <TableCell>{o.id}</TableCell>
                    <TableCell>{o.paymentId}</TableCell>
                    <TableCell>{o.name}</TableCell>
                    <TableCell>{o.phone}</TableCell>
                    <TableCell>{o.address}</TableCell>

                    <TableCell className="dashboard__price">
                      {o.total}
                    </TableCell>

                    <TableCell>
                      <span className="dashboard__status">{o.status}</span>
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell colSpan={8} className="dashboard__collapse-cell">
                      <Collapse in={openRow === i}>
                        <Box className="dashboard__collapse">
                          <div className="dashboard__collapse-head">
                            <span>ID</span>
                            <span>Product</span>
                            <span>Image</span>
                            <span>Qty</span>
                            <span>Price</span>
                            <span>Total</span>
                          </div>

                          {o.products.map((p, idx) => (
                            <div key={idx} className="dashboard__collapse-row">
                              <span>PRD-001</span>
                              <span>{p.name}</span>
                              <img src={p.image} />
                              <span>x{p.qty}</span>
                              <span>{p.price}</span>

                              <span>
                                $
                                {(
                                  Number(p.price.replace("$", "")) * p.qty
                                ).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </section>

    <div className="dashboard__card">
  <ResponsiveContainer width="100%" height={400}>
    <LineChart
      data={chart1Data}
      margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
    >
      {/* GRID: nhẹ để không bị rối */}
      <CartesianGrid
        stroke="rgba(255,255,255,0.08)"
        strokeDasharray="4 4"
      />

      {/* AXIS: trắng rõ */}
      <XAxis
        dataKey="name"
        stroke="rgba(255,255,255,0.8)"
        tick={{ fill: "rgba(255,255,255,0.8)" }}
      />

      <YAxis
        width={65}
        stroke="rgba(255,255,255,0.8)"
        tick={{ fill: "rgba(255,255,255,0.8)" }}
      />

      {/* TOOLTIP: sáng + dễ đọc */}
      <Tooltip
        cursor={{ stroke: "rgba(255,255,255,0.2)" }}
        contentStyle={{
          backgroundColor: "rgba(255,255,255,0.95)",
          border: "1px solid rgba(0,0,0,0.1)",
          borderRadius: "10px",
          color: "#000",
        }}
      />

      <Legend />

      {/* LINE 1 - xanh dương sáng */}
      <Line
        type="monotone"
        dataKey="pv"
        name="Page Views"
        stroke="#3b82f6"
        strokeWidth={3}
        dot={{ fill: "#fff", stroke: "#3b82f6", strokeWidth: 2, r: 4 }}
        activeDot={{ r: 7 }}
      />

      {/* LINE 2 - xanh lá sáng */}
      <Line
        type="monotone"
        dataKey="uv"
        name="User Visits"
        stroke="#22c55e"
        strokeWidth={3}
        dot={{ fill: "#fff", stroke: "#22c55e", strokeWidth: 2, r: 4 }}
        activeDot={{ r: 7 }}
      />
    </LineChart>
  </ResponsiveContainer>
</div>
    </div>
  );
};

export default DashBoard;
