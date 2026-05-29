import { memo } from "react";
import { FiPlus } from "react-icons/fi";

import { useProducts } from "../../../context/ProductsContext";


function DashboardWelcome() {
  const { addProductFromForm } = useProducts();
  

  return (
    <>
      <section className="dashboard__welcome">
        <div
          className="dashboard__circle dashboard__circle--1"
          aria-hidden="true"
        />
        <div
          className="dashboard__circle dashboard__circle--2"
          aria-hidden="true"
        />

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
          <button
            type="button"
            className="dashboard__btn"
          
          >
            <FiPlus />
            Add Product
          </button>
        </div>

        <div className="dashboard__welcome-img">
          <img
            src="https://cdn-icons-png.flaticon.com/512/2331/2331970.png"
            alt="Dashboard illustration"
          />
        </div>
      </section>
    </>
  );
}

export default memo(DashboardWelcome);
