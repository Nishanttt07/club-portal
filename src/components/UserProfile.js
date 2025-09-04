// UserProfile.js
import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

export default function UserProfile() {
  const [user, setUser] = useState(null);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserAndData = async () => {
      // ✅ Get current session
      const { data, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !data.session) {
        navigate("/login");
        return;
      }

      const authUser = data.session.user;
      setUser(authUser);

      try {
        // ✅ Fetch memberships + related club info
        const { data: memberships, error: membershipsError } = await supabase
          .from("memberships")
          .select(
            `
            id,
            role,
            joined_at,
            clubs (
              id,
              name,
              description,
              logo_url,
              admin_user_id
            )
          `
          )
          .eq("user_id", authUser.id);

        if (membershipsError) throw membershipsError;

        if (!memberships || memberships.length === 0) {
          setClubs([]);
          setLoading(false);
          return;
        }

        // ✅ Flatten memberships so each has club info
        const merged = memberships.map((m) => ({
          membership_id: m.id,
          role: m.role,
          joined_at: m.joined_at,
          ...m.clubs, // spread club fields
        }));

        setClubs(merged);
      } catch (err) {
        console.error("Error loading memberships:", err);
        setError("Failed to load your clubs. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndData();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/login");
    } catch (err) {
      console.error("Error logging out:", err);
      alert("Error signing out. Please try again.");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getInitial = (email) => {
    return email ? email.charAt(0).toUpperCase() : "U";
  };

  return (
    <div className="profile-page">
      {user && (
        <>
          {/* Profile Header */}
          <div className="profile-header">
            <div className="avatar">{getInitial(user.email)}</div>
            <div className="profile-info">
              <h2>{user.email}</h2>
              <p>Joined: {formatDate(user.created_at)}</p>
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>

          {/* Memberships */}
          <div className="clubs-section">
            <h3>My Clubs</h3>

            {loading && <p>Loading clubs...</p>}
            {error && <p className="error">{error}</p>}
            {!loading && clubs.length === 0 && (
              <p>You have not joined any clubs yet.</p>
            )}

            <div className="clubs-container">
              {clubs.map((club) => (
                <div key={club.id} className="club-card">
                  <div className="club-logo">
                    {club.logo_url ? (
                      <img
                        src={club.logo_url}
                        alt={club.name}
                        width="40"
                        height="40"
                      />
                    ) : (
                      "🏢"
                    )}
                  </div>
                  <div className="club-info">
                    <h4>{club.name}</h4>
                    <p>{club.description || "No description available"}</p>
                    <div className="joined-date">
                      Joined: {formatDate(club.joined_at)}
                    </div>
                    <div className="role">Role: {club.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
