import DashboarBoxes from "../../Components/DashboardBox";
import "./index.css";

const DashBoard = () => {
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
    </div>
  );
};

export default DashBoard;
