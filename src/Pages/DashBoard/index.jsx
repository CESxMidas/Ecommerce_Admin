import DashboardAnalyticsChart from "./components/DashboardAnalyticsChart";
import DashboardOrdersTable from "./components/DashboardOrdersTable";
import DashboardProductsTable from "./components/DashboardProductsTable";
import DashboardWelcome from "./components/DashboardWelcome";
import DashboardBoxes from "../../Components/DashboardBox";

import "./index.css";

function Dashboard() {
  return (
    <div className="dashboard">
      <DashboardWelcome />
      <DashboardBoxes />
      <DashboardProductsTable />
      <DashboardOrdersTable />
      <DashboardAnalyticsChart />
    </div>
  );
}

export default Dashboard;
