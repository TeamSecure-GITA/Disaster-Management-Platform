import React, { useEffect, useState } from "react";

function Profile() {
  const [userData, setUserData] = useState({
    name: "",
    email: ""
  });

  useEffect(() => {
    const savedUser = localStorage.getItem("registeredUser");

    if (savedUser) {
      setUserData(JSON.parse(savedUser));
    }
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>My Profile</h2>

      <div style={{ marginBottom: "15px" }}>
        <label>Full Name</label>
        <br />
        <input
          type="text"
          value={userData.name}
          placeholder="Enter your full name"
          readOnly
        />
      </div>

      <div style={{ marginBottom: "15px" }}>
        <label>Email</label>
        <br />
        <input
          type="email"
          value={userData.email}
          placeholder="Enter your email"
          readOnly
        />
      </div>
    </div>
  );
}

export default Profile;