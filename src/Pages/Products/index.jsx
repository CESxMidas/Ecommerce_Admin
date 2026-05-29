import { memo } from "react";
import {
  FiEdit2,
  FiEye,
  FiFilter,
  FiGrid,
  FiPlus,
  FiSearch,
  FiTrash2,
  FiUpload,
} from "react-icons/fi";


import Progress from "../../Components/Progress";
import TableScrollPanel from "../../Components/TableScrollPanel";
import PageHeader from "../../Components/ui/PageHeader";
import StarRating from "../../Components/ui/StarRating";
import { useProducts } from "../../context/ProductsContext";


import "./index.css";

function Products() {
  const { products, addProductFromForm } = useProducts();
  

  const breadcrumb = (
    <>
      <span>E-Commerce</span>
      <span aria-hidden="true">•</span>
      <span>Products</span>
      <span aria-hidden="true">•</span>
      <span aria-current="page">List</span>
    </>
  );

  const headerActions = (
    <>
      <button type="button" className="admin-btn admin-btn--ghost">
        <FiUpload />
        Export
      </button>
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
    <section className="productsPage">
      <PageHeader
        title="Products"
        breadcrumb={breadcrumb}
        actions={headerActions}
      />

      <div className="productsPage__filterBar">
        <div className="productsPage__search">
          <FiSearch aria-hidden="true" />
          <input
            type="search"
            className="productsPage__searchInput"
            placeholder="Search by product name..."
            aria-label="Search products"
          />
        </div>

        <div className="productsPage__filterActions">
          <button type="button" className="admin-btn admin-btn--ghost">
            <FiFilter />
            Filters
          </button>
          <button
            type="button"
            className="productsPage__iconBtn"
            aria-label="Grid view"
          >
            <FiGrid />
          </button>
        </div>
      </div>

      <div className="productsPage__tableOuter">
        <TableScrollPanel hint="Swipe to view all product columns">
          <table className="productsPage__table">
            <thead>
              <tr>
                <th scope="col">
                  <input type="checkbox" aria-label="Select all products" />
                </th>
                <th scope="col">PRODUCT</th>
                <th scope="col">SKU</th>
                <th scope="col">STOCK</th>
                <th scope="col">PRICE</th>
                <th scope="col">RATING</th>
                <th scope="col">STATUS</th>
                <th scope="col">ACTION</th>
              </tr>
            </thead>

            <tbody>
              {products.map((item) => (
                <tr key={item.id}>
                  <td data-label="Select">
                    <input
                      type="checkbox"
                      aria-label={`Select ${item.name}`}
                    />
                  </td>

                  <td data-label="Product">
                    <div className="productsPage__product">
                      <img
                        src={item.image}
                        alt={item.name}
                        loading="lazy"
                        width={58}
                        height={58}
                      />
                      <div className="productsPage__productInfo">
                        <h4>{item.name}</h4>
                        <p>{item.category}</p>
                      </div>
                    </div>
                  </td>

                  <td data-label="SKU">
                    <span className="productsPage__sku">{item.sku}</span>
                  </td>

                  <td data-label="Stock">
                    <div className="productsPage__stock">
                      <Progress value={item.stock} />
                      <p>
                        {item.stock === 0
                          ? "Out of stock"
                          : `${item.stock} in stock`}
                      </p>
                    </div>
                  </td>

                  <td data-label="Price">
                    <span className="productsPage__price">{item.price}</span>
                  </td>

                  <td data-label="Rating">
                    <StarRating rating={item.rating} reviews={item.reviews} />
                  </td>

                  <td data-label="Status">
                    <span
                      className={`productsPage__status productsPage__status--${item.status.toLowerCase()}`}
                    >
                      {item.status}
                    </span>
                  </td>

                  <td data-label="Action">
                    <div className="productsPage__tableActions">
                      <button
                        type="button"
                        className="productsPage__tableActions-btn productsPage__tableActions-btn--edit"
                        aria-label={`Edit ${item.name}`}
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        type="button"
                        className="productsPage__tableActions-btn productsPage__tableActions-btn--view"
                        aria-label={`View ${item.name}`}
                      >
                        <FiEye />
                      </button>
                      <button
                        type="button"
                        className="productsPage__tableActions-btn productsPage__tableActions-btn--delete"
                        aria-label={`Delete ${item.name}`}
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableScrollPanel>
      </div>


    </section>
  );
}

export default memo(Products);
