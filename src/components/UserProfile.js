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
      // ✅ Use getSession instead of getUser
      const { data, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !data.session) {
        navigate("/login");
        return;
      }

      const user = data.session.user;
      setUser(user);

      try {
        // Get memberships
        const { data: memberships, error: membershipsError } = await supabase
          .from("memberships")
          .select("club_id, joined_at")
          .eq("user_id", user.id);

        if (membershipsError) throw membershipsError;

        if (!memberships || memberships.length === 0) {
          setClubs([]);
          setLoading(false);
          return;
        }

        const clubIds = memberships.map((m) => m.club_id);

        // Get club details
        const { data: clubsData, error: clubsError } = await supabase
          .from("clubs")
          .select("id, name, description, logo_url")
          .in("id", clubIds);

        if (clubsError) throw clubsError;

        // Merge club + membership data
        const merged = clubsData.map((club) => {
          const membership = memberships.find((m) => m.club_id === club.id);
          return {
            ...club,
            joined_at: membership.joined_at,
          };
        });

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
