import "./index.css";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

import {
  FaChartLine,
  FaShoppingCart,
  FaUsers,
  FaWallet,
} from "react-icons/fa";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

const chartData = [
  { value: 30 },
  { value: 80 },
  { value: 45 },
  { value: 90 },
  { value: 60 },
  { value: 110 },
  { value: 70 },
];

const DashboardBoxes = () => {
  const dashboardData = [
    {
      id: 1,
      icon: <FaWallet />,
      title: "New Orders",
      amount: "$38,786",
      percent: "+18.40%",
      description: "Increased last month",
    },

    {
      id: 2,
      icon: <FaShoppingCart />,
      title: "New Orders",
      amount: "1,390",
      percent: "+32.40%",
      description: "Increased last month",
    },

    {
      id: 3,
      icon: <FaUsers />,
      title: "Total Users",
      amount: "4,892",
      percent: "-5.12%",
      description: "Decreased last month",
    },

    {
      id: 4,
      icon: <FaChartLine />,
      title: "Revenue",
      amount: "$89,120",
      percent: "+25.10%",
      description: "Increased last month",
    },
  ];

  return (
    <div className="dashboardBoxes">
      <Swiper
        spaceBetween={20}
        slidesPerView={4}
        breakpoints={{
          320: {
            slidesPerView: 1,
          },

          768: {
            slidesPerView: 2,
          },

          1200: {
            slidesPerView: 3,
          },
        }}
      >
        {dashboardData.map((item) => {
          return (
            <SwiperSlide key={item.id}>
              <div className="dashboardBox mt-10">
                {/* TOP */}
                <div className="topSection">
                  <div className="leftSide">
                    <div className="iconBox">
                      {item.icon}
                    </div>

                    <div className="content">
                      <h4>{item.title}</h4>

                      <h2>{item.amount}</h2>
                    </div>
                  </div>

                  {/* CHART */}
                  <div className="chartWrapper">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={chartData}
                        margin={{
                          top: 0,
                          right: 0,
                          left: 0,
                          bottom: 0,
                        }}
                        barCategoryGap={6}
                      >
                        <Bar
                          dataKey="value"
                          fill="#3b82f6"
                          radius={[30, 30, 30, 30]}
                          barSize={5}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* BOTTOM */}
                <div className="bottomSection mt-5">
                  <span
                    className={`percent ${item.percent.includes("-")
                      ? "down"
                      : "up"
                      }`}
                  >
                    {item.percent}
                  </span>

                  <p>{item.description}</p>
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
};
export default DashboardBoxes;