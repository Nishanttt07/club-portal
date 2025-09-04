// Navbar.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch current user on mount
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      if (user && user.user_metadata?.isAdmin) {
        setIsAdmin(true);
      }
    };
    getUser();

    // Listen to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsAdmin(session?.user?.user_metadata?.isAdmin || false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Redirect based on role (profile)
  const handleProfileClick = () => {
    if (isAdmin) {
      navigate("/admin-profile");
    } else {
      navigate("/user-profile");
    }
  };

  // Redirect based on role (dashboard)
  const handleDashboardClick = () => {
    if (isAdmin) {
      navigate("/admin-dashboard");
    } else {
      navigate("/UserProfile");
    }
  };

  const handleNotificationsClick = () => {
    console.log("Notifications clicked");
  };

  const handleChatbotClick = () => {
    console.log("Chatbot clicked");
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
      {user && (
        <>
          {/* Left side - Profile + Dashboard */}
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <button
              onClick={handleProfileClick}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                fontWeight: "bold",
              }}
            >
              👤 Profile
            </button>

            <button
              onClick={handleDashboardClick}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                fontWeight: "bold",
              }}
            >
              📊 Dashboard
            </button>
          </div>

          {/* Right side - Notifications + Chatbot */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              onClick={handleNotificationsClick}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                fontSize: "20px",
              }}
              title="Notifications"
            >
              🔔
            </button>

            {!isAdmin && (
              <button
                onClick={handleChatbotClick}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "20px",
                }}
                title="Chatbot"
              >
                🤖
              </button>
            )}
          </div>
        </>
      )}
    </nav>
  );
}
