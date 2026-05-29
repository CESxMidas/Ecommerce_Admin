import { memo, useEffect, useMemo, useState } from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
} from "@mui/material";
import { FaEdit, FaStar, FaTrash } from "react-icons/fa";
import { FiPlus } from "react-icons/fi";

import AdminCard from "../../../Components/ui/AdminCard";
import Progress from "../../../Components/Progress";
import TableScrollPanel from "../../../Components/TableScrollPanel";
import { useProducts } from "../../../context/ProductsContext";

import { transparentTablePaperSx } from "../../../constants/muiTable";

function DashboardProductsTable() {
  const { dashboardItems, addProductFromForm } = useProducts();
 

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    setPage(0);
  }, [dashboardItems.length]);

  const visibleProducts = useMemo(
    () =>
      dashboardItems.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
      ),
    [dashboardItems, page, rowsPerPage]
  );

  const headerActions = (
    <>
      <input
        type="search"
        placeholder="Search product..."
        className="admin-input dashboard__search"
        aria-label="Search products"
      />
      <select
        className="admin-select dashboard__select"
        defaultValue="Category"
        aria-label="Filter by category"
      >
        <option>Category</option>
        <option>Shoes</option>
        <option>Electronics</option>
        <option>Audio</option>
      </select>
      <button
        type="button"
        className="admin-btn admin-btn--primary"
      >
        <FiPlus />
        Add Product
      </button>
    </>
  );

  return (
    <>
      <AdminCard
        className="dashboard__card"
        title="Recent Products"
        subtitle="Manage your products easily"
        actions={headerActions}
      >
        <TableScrollPanel>
          <TableContainer
            component={Paper}
            className="dashboard__table dashboard__table--products admin-mui-table"
            sx={transparentTablePaperSx}
          >
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell className="dashboard__col--hide-tablet">
                    Sub Category
                  </TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell className="dashboard__col--hide-mobile">
                    Sales
                  </TableCell>
                  <TableCell>Stock</TableCell>
                  <TableCell className="dashboard__col--hide-mobile">
                    Rating
                  </TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {visibleProducts.map((product) => (
                  <TableRow key={product.id} hover>
                    <TableCell>
                      <div className="dashboard__product">
                        <input
                          type="checkbox"
                          className="dashboard__checkbox"
                          aria-label={`Select ${product.name}`}
                        />
                        <img
                          src={product.image}
                          alt={product.name}
                          loading="lazy"
                          width={60}
                          height={60}
                        />
                        <div>
                          <h4>{product.name}</h4>
                          <p>ID #{product.id}</p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className="admin-badge admin-badge--neutral">
                        {product.category}
                      </span>
                    </TableCell>

                    <TableCell className="dashboard__col--hide-tablet">
                      {product.subCategory}
                    </TableCell>

                    <TableCell className="dashboard__price">
                      {product.price}
                    </TableCell>

                    <TableCell className="dashboard__col--hide-mobile">
                      {product.sales}
                    </TableCell>

                    <TableCell>
                      <Progress value={product.stock} />
                    </TableCell>

                    <TableCell className="dashboard__col--hide-mobile">
                      <div className="dashboard__rating">
                        <FaStar aria-hidden="true" />
                        {product.rating}
                      </div>
                    </TableCell>

                    <TableCell align="right">
                      <div className="dashboard__actions">
                        <button
                          type="button"
                          className="dashboard__action-btn dashboard__action-btn--edit"
                          aria-label={`Edit ${product.name}`}
                        >
                          <FaEdit />
                        </button>
                        <button
                          type="button"
                          className="dashboard__action-btn dashboard__action-btn--delete"
                          aria-label={`Delete ${product.name}`}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TableScrollPanel>

        <TablePagination
          component="div"
          count={dashboardItems.length}
          page={page}
          onPageChange={(_, nextPage) => setPage(nextPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(Number(event.target.value));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 20]}
          className="admin-pagination dashboard__pagination"
        />
      </AdminCard>

     
    </>
  );
}

export default memo(DashboardProductsTable);
