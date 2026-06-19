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
import { productListMock } from "../../data/mocks/productList";

import "./index.css";

const Products = () => {
  return (
    <section className="productsPage">
      <div className="productsPage__top">
        <div className="productsPage__titleWrap">
          <h1>Products</h1>

          <div className="productsPage__breadcrumb">
            <span>E-Commerce</span>
            <span>•</span>
            <span>Products</span>
            <span>•</span>
            <span>List</span>
          </div>
        </div>

        <div className="productsPage__actions">
          <button className="productsPage__outlineBtn">
            <FiUpload />
            Export
          </button>

          <button className="productsPage__primaryBtn">
            <FiPlus />
            Add Product
          </button>
        </div>
      </div>

      <div className="productsPage__filterBar">
        <div className="productsPage__search">
          <FiSearch />

          <input
            type="text"
            placeholder="Search by product name..."
          />
        </div>

        <div className="productsPage__filterActions">
          <button className="productsPage__outlineBtn">
            <FiFilter />
            Filters
          </button>

          <button className="productsPage__iconBtn">
            <FiGrid />
          </button>
        </div>
      </div>

      <div className="productsPage__tableWrapper">
        <table className="productsPage__table">
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
            {productListMock.map((item) => (
              <tr key={item.id}>
                <td>
                  <input type="checkbox" />
                </td>

                <td>
                  <div className="productsPage__product">
                    <img src={item.image} alt={item.name} />

                    <div className="productsPage__productInfo">
                      <h4>{item.name}</h4>
                      <p>{item.category}</p>
                    </div>
                  </div>
                </td>

                <td>
                  <span className="productsPage__sku">{item.sku}</span>
                </td>

                <td>
                  <div className="productsPage__stock">
                    <Progress value={item.stock} />

                    <p>
                      {item.stock === 0
                        ? "Out of stock"
                        : `${item.stock} in stock`}
                    </p>
                  </div>
                </td>

                <td>
                  <span className="productsPage__price">{item.price}</span>
                </td>

                <td>
                  <div className="productsPage__rating">
                    <span>{item.rating}</span>

                    <div className="productsPage__stars">
                      {[...Array(5)].map((_, i) => (
                        <FaStar
                          key={i}
                          className={
                            i < Math.floor(item.rating) ? "active" : ""
                          }
                        />
                      ))}
                    </div>

                    <p>({item.reviews})</p>
                  </div>
                </td>

                <td>
                  <span
                    className={`productsPage__status ${item.status.toLowerCase()}`}
                  >
                    {item.status}
                  </span>
                </td>

                <td>
                  <div className="productsPage__tableActions">
                    <button className="edit">
                      <FiEdit2 />
                    </button>

                    <button className="view">
                      <FiEye />
                    </button>

                    <button className="delete">
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
