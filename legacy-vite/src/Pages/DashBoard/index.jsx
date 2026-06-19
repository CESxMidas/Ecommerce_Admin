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

import {
  dashboardChartMock,
  dashboardOrdersMock,
  dashboardProductsMock,
} from "../../data/mocks/dashboard";

import "./index.css";

const products = dashboardProductsMock;
const ordersData = dashboardOrdersMock;
const chartData = dashboardChartMock;

const DashBoard = () => {
  const [openRow, setOpenRow] = useState(null);

  const [page, setPage] = useState(0);

  const [rowsPerPage, setRowsPerPage] = useState(5);

  const toggleRow = (i) => {
    setOpenRow(openRow === i ? null : i);
  };

  return (
    <div className="dashboard">
      {/* ================= WELCOME ================= */}

      <section className="dashboard__welcome">
        <div className="dashboard__circle dashboard__circle--1"></div>

        <div className="dashboard__circle dashboard__circle--2"></div>

        <div className="dashboard__welcome-info">
          <span className="dashboard__badge">Ecommerce Dashboard</span>

          <h2 className="dashboard__title">
            Good Morning,
            <br />
            Admin 👋
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
        <div className="dashboard__tableHeader">
          <div>
            <h3 className="dashboard__title-sm">Recent Products</h3>

            <p className="dashboard__subtitle">Manage your products easily</p>
          </div>

          <div className="dashboard__controls">
            <input
              type="text"
              placeholder="Search product..."
              className="dashboard__search"
            />

            <select className="dashboard__select">
              <option>Category</option>
              <option>Shoes</option>
              <option>Electronics</option>
              <option>Audio</option>
            </select>

            <button className="dashboard__addBtn">+ Add Product</button>
          </div>
        </div>

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
                <TableCell>Sub Category</TableCell>
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

                        <img src={p.image} alt="" />

                        <div>
                          <h4>{p.name}</h4>

                          <p>ID #{p.id}</p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className="dashboard__categoryBadge">
                        {p.category}
                      </span>
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
                        <FaStar />

                        {p.rating}
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
        <div className="dashboard__tableHeader">
          <div>
            <h3 className="dashboard__title-sm">Recent Orders</h3>

            <p className="dashboard__subtitle">Latest customer orders</p>
          </div>
        </div>

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

                              <img src={p.image} alt="" />

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

      {/* ================= CHART ================= */}

      <section className="dashboard__card dashboard__chartCard">
        <div className="dashboard__tableHeader">
          <div>
            <h3 className="dashboard__title-sm">Analytics Overview</h3>

            <p className="dashboard__subtitle">Sales & visitors statistics</p>
          </div>
        </div>

        <div className="dashboard__chartWrapper">
          <ResponsiveContainer width="100%" height={420}>
            <LineChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 10,
                bottom: 10,
              }}
            >
              {/* GRID */}
              <CartesianGrid
                stroke="rgba(255,255,255,0.05)"
                strokeDasharray="3 3"
                vertical={false}
              />

              {/* X AXIS */}
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tick={{
                  fill: "rgba(255,255,255,0.7)",
                  fontSize: 13,
                  fontWeight: 500,
                }}
              />

              {/* Y AXIS */}
              <YAxis
                width={60}
                tickLine={false}
                axisLine={false}
                tick={{
                  fill: "rgba(255,255,255,0.6)",
                  fontSize: 13,
                }}
              />

              {/* TOOLTIP */}
              <Tooltip
                cursor={{
                  stroke: "rgba(255,255,255,0.15)",
                  strokeWidth: 1,
                }}
                contentStyle={{
                  background: "rgba(15,23,42,0.96)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: "18px",
                  backdropFilter: "blur(10px)",
                  color: "#fff",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
                }}
                labelStyle={{
                  color: "#fff",
                  marginBottom: "10px",
                  fontWeight: 700,
                }}
              />

              {/* LEGEND */}
              <Legend
                verticalAlign="bottom"
                height={50}
                iconType="circle"
                wrapperStyle={{
                  color: "#fff",
                  paddingTop: "20px",
                }}
              />

              {/* PAGE VIEW */}
              <Line
                type="monotone"
                dataKey="pv"
                name="Page Views"
                stroke="#3b82f6"
                strokeWidth={4}
                dot={{
                  r: 5,
                  strokeWidth: 3,
                  fill: "#0f172a",
                }}
                activeDot={{
                  r: 8,
                  stroke: "#3b82f6",
                  strokeWidth: 3,
                  fill: "#fff",
                }}
              />

              {/* USER VISITS */}
              <Line
                type="monotone"
                dataKey="uv"
                name="User Visits"
                stroke="#00e676"
                strokeWidth={4}
                dot={{
                  r: 5,
                  strokeWidth: 3,
                  fill: "#0f172a",
                }}
                activeDot={{
                  r: 8,
                  stroke: "#00e676",
                  strokeWidth: 3,
                  fill: "#fff",
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
};

export default DashBoard;
