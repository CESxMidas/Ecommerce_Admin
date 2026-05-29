import { memo } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import AdminCard from "../../../Components/ui/AdminCard";
import {
  chartTooltipStyle,
  lineChartAxisTick,
  lineChartYAxisTick,
} from "../../../constants/charts";
import { dashboardChartData } from "../../../data/dashboardData";

function DashboardAnalyticsChart() {
  return (
    <AdminCard
      className="dashboard__card dashboard__chartCard"
      title="Analytics Overview"
      subtitle="Sales & visitors statistics"
    >
      <div className="dashboard__chartWrapper">
        <ResponsiveContainer width="100%" height="100%" minHeight={320}>
          <LineChart
            data={dashboardChartData}
            margin={{ top: 20, right: 24, left: 4, bottom: 8 }}
          >
            <CartesianGrid
              stroke="rgba(255,255,255,0.05)"
              strokeDasharray="3 3"
              vertical={false}
            />

            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tick={lineChartAxisTick}
            />

            <YAxis
              width={52}
              tickLine={false}
              axisLine={false}
              tick={lineChartYAxisTick}
            />

            <Tooltip
              cursor={{
                stroke: "rgba(255,255,255,0.15)",
                strokeWidth: 1,
              }}
              contentStyle={chartTooltipStyle}
              labelStyle={{
                color: "#fff",
                marginBottom: 8,
                fontWeight: 700,
              }}
            />

            <Legend
              verticalAlign="bottom"
              height={48}
              iconType="circle"
              wrapperStyle={{
                color: "#fff",
                paddingTop: 16,
              }}
            />

            <Line
              type="monotone"
              dataKey="pv"
              name="Page Views"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 2, fill: "#0f172a" }}
              activeDot={{ r: 7, stroke: "#3b82f6", strokeWidth: 2, fill: "#fff" }}
            />

            <Line
              type="monotone"
              dataKey="uv"
              name="User Visits"
              stroke="#00e676"
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 2, fill: "#0f172a" }}
              activeDot={{ r: 7, stroke: "#00e676", strokeWidth: 2, fill: "#fff" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </AdminCard>
  );
}

export default memo(DashboardAnalyticsChart);
