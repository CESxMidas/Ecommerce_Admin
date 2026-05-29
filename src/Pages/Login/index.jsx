import React from "react";
import "./index.css";

import { FaGoogle, FaSteam, FaXbox } from "react-icons/fa";

import { MdVpnKey, MdSecurity } from "react-icons/md";

const Login = ({ setIsLogin }) => {
  return (
    <section className="loginPage">
      {/* LEFT */}
      <div className="loginLeft">
        <div className="leftContent">
          {/* LOGO */}
          <div className="logoRow">
            <div className="logoBox">
              <MdVpnKey />
            </div>
            <span>KeyStore</span>
          </div>
          {/* TITLE */}
          <h1>
            Buy Premium
            <br />
            Game & Software Keys
          </h1>
          <p>
            Instant delivery for Steam, Windows, Office, Xbox, Playstation and
            more digital products.
          </p>
          {/* SOCIAL */}
          <div className="socialRow">
            <button>
              <FaSteam />
              Continue with Steam
            </button>
            <button>
              <FaGoogle />
              Continue with Google
            </button>
          </div>
          {/* FORM */}
          <div className="loginForm">
            <div className="inputGroup">
              <label htmlFor="login-email">Email</label>
              <input
                id="login-email"
                type="email"
                placeholder="Enter your email"
                autoComplete="email"
              />
            </div>
            <div className="inputGroup">
              <label htmlFor="login-password">Password</label>
              <input
                id="login-password"
                type="password"
                placeholder="Enter your password"
                autoComplete="current-password"
              />
            </div>


            {/* CHECK */}
            <div className="checkRow">
              <label>
                <input type="checkbox" />
                Remember me
              </label>

              <button>Forgot Password?</button>
            </div>

            {/* BUTTON */}
            <button
              type="button"
              className="loginBtn"
              onClick={() => setIsLogin?.(true)}
            >
              Access Dashboard
            </button>

            <p className="bottomText">
              Don’t have an account?
              <span> Sign Up</span>
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT */}
      <div className="loginRight">
        <div className="heroContent">
          <h1>The easiest way to manage your digital key business.</h1>

          <p>
            Track orders, manage inventory, monitor sales and deliver game keys
            instantly.
          </p>

          {/* DASHBOARD MOCKUP */}
          <div className="dashboardPreview">
            {/* TOP */}
            <div className="previewTop">
              <div className="miniCard">
                <span>Total Sales</span>
                <h3>$24,820</h3>

                <p>+28.4% this month</p>
              </div>

              <div className="miniCard">
                <span>Keys Sold</span>
                <h3>12,430</h3>

                <p>+14.2% this month</p>
              </div>
            </div>

            {/* MAIN */}
            <div className="previewMain">
              <div className="chartBox">
                <div className="chartLine one"></div>

                <div className="chartLine two"></div>
              </div>

              <div className="activityBox">
                <h4>Recent Orders</h4>

                <div className="activityItem">
                  <FaSteam />
                  Steam Wallet $50
                </div>

                <div className="activityItem">
                  <FaXbox />
                  Xbox Game Pass
                </div>

                <div className="activityItem">
                  <MdSecurity />
                  Windows 11 Pro Key
                </div>
              </div>
            </div>

            {/* FLOAT */}
            <div className="floatingCard">
              <h5>Top Product</h5>
              <strong>Office 365 License</strong>
              <span>+42% sales boost</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Login;
