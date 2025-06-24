import React from "react";
import "./custom-navbar.css";

const Top = () => (
  <div style={{
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    zIndex: 1000,
    background: "#23233a",
    color: "#fff",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0.2rem 2rem 0.2rem 1.2rem",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    height: "60px"
  }}>
    <div style={{ display: "flex", alignItems: "center", height: "100%" }}>
      <img src="VSTN_logo.png" alt="VSTN Consultancy Logo" style={{ height: 38, marginRight: 18, display: "block" }} />
    </div>
  </div>
);

export default Top;
