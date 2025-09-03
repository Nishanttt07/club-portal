import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        // fetch role from profiles table
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();
        setRole(profile?.role || "user");
      }
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
    navigate("/login");
  };

  return (
    <nav
      style={{
        padding: "10px 20px",
        background: "#f5f5f5",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div>
        {/* <Link to="/" style={{ marginRight: "15px" }}>
          Home
        </Link> */}
        {user && (
          <Link
            to={role === "admin" ? "/admin-dashboard" : "/user-dashboard"}
            style={{ marginRight: "15px" }}
          >
            Dashboard
          </Link>
        )}
      </div>

      <div>
        {/* {!user ? (
          <Link to="/login">Login</Link>
        ) : (
          <button
            onClick={handleLogout}
            style={{
              background: "red",
              color: "white",
              border: "none",
              padding: "6px 12px",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          > */}
          <button>
            Logout
          </button>
        {/* )} */}
      </div>
    </nav>
  );
}
