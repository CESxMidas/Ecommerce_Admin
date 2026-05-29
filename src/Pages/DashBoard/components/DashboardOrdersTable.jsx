import { Fragment, memo, useCallback, useState } from "react";
import {
  Box,
  Collapse,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

import AdminCard from "../../../Components/ui/AdminCard";
import TableScrollPanel from "../../../Components/TableScrollPanel";
import { transparentTablePaperSx } from "../../../constants/muiTable";
import { dashboardOrders } from "../../../data/dashboardData";
import { formatCurrency, parsePrice } from "../../../utils/format";

function DashboardOrdersTable() {
  const [openRow, setOpenRow] = useState(null);

  const toggleRow = useCallback((index) => {
    setOpenRow((current) => (current === index ? null : index));
  }, []);

  return (
    <AdminCard
      className="dashboard__card"
      title="Recent Orders"
      subtitle="Latest customer orders"
    >
      <TableScrollPanel>
        <TableContainer
          component={Paper}
          className="dashboard__table dashboard__table--orders admin-mui-table"
          sx={transparentTablePaperSx}
        >
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell>Action</TableCell>
                <TableCell>ID</TableCell>
                <TableCell>Payment</TableCell>
                <TableCell>Name</TableCell>
                <TableCell className="dashboard__col--hide-mobile">Phone</TableCell>
                <TableCell className="dashboard__col--hide-tablet">Address</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {dashboardOrders.map((order, index) => (
                <Fragment key={order.id}>
                  <TableRow hover>
                    <TableCell>
                      <button
                        type="button"
                        className="dashboard__expand"
                        onClick={() => toggleRow(index)}
                        aria-expanded={openRow === index}
                        aria-label="Toggle order details"
                      >
                        {openRow === index ? <FaChevronUp /> : <FaChevronDown />}
                      </button>
                    </TableCell>
                    <TableCell>{order.id}</TableCell>
                    <TableCell>{order.paymentId}</TableCell>
                    <TableCell>{order.name}</TableCell>
                    <TableCell className="dashboard__col--hide-mobile">
                      {order.phone}
                    </TableCell>
                    <TableCell className="dashboard__col--hide-tablet">
                      {order.address}
                    </TableCell>
                    <TableCell className="dashboard__price">{order.total}</TableCell>
                    <TableCell>
                      <span className="admin-badge admin-badge--success">
                        {order.status}
                      </span>
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell colSpan={8} className="dashboard__collapse-cell">
                      <Collapse in={openRow === index} timeout="auto" unmountOnExit>
                        <Box className="dashboard__collapse">
                          <div className="dashboard__collapse-head">
                            <span>ID</span>
                            <span>Product</span>
                            <span>Image</span>
                            <span>Qty</span>
                            <span>Price</span>
                            <span>Total</span>
                          </div>

                          {order.products.map((product, productIndex) => (
                            <div
                              key={`${product.name}-${productIndex}`}
                              className="dashboard__collapse-row"
                            >
                              <span>PRD-00{productIndex + 1}</span>
                              <span>{product.name}</span>
                              <img
                                src={product.image}
                                alt={product.name}
                                loading="lazy"
                                width={60}
                                height={60}
                              />
                              <span>x{product.qty}</span>
                              <span>{product.price}</span>
                              <span>
                                {formatCurrency(
                                  parsePrice(product.price) * product.qty
                                )}
                              </span>
                            </div>
                          ))}
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TableScrollPanel>
    </AdminCard>
  );
}

export default memo(DashboardOrdersTable);
