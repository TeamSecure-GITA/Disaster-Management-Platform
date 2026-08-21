import React from "react";
import LogoutButton from "../components/LogoutButton";

const AdminDashboard = () => {
  return (
    <div style={{ padding: "20px", color: "#fff" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h1>Admin Dashboard</h1>
        <LogoutButton />
      </div>
      <p>Welcome to the admin area.</p>
    </div>
  );
};

export default AdminDashboard;