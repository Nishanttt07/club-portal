import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import "./UserProfile.css";

export default function UserProfile() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserAndData = async () => {
      // ✅ Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        navigate("/login");
        return;
      }

      setUser(user);

      try {
        // ✅ Fetch profile row (from "profiles" table)
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("id, email, role, created_at")
          .eq("id", user.id)
          .single();

        if (profileError) throw profileError;
        setProfile(profileData);

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
              logo_url
            )
          `
          )
          .eq("user_id", user.id);

        if (membershipsError) throw membershipsError;

        const merged =
          memberships?.map((m) => ({
            membership_id: m.id,
            role: m.role,
            joined_at: m.joined_at,
            ...m.clubs,
          })) || [];

        setClubs(merged);
      } catch (err) {
        console.error("Error loading profile or memberships:", err);
        setError("Failed to load your profile data.");
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
      {profile && (
        <>
          {/* Profile Header */}
          <div className="profile-header">
            <div className="avatar">{getInitial(profile.email)}</div>
            <div className="profile-info">
              <h2>{profile.email}</h2>
              <p>Role: {profile.role}</p>
              <p>Joined: {formatDate(profile.created_at)}</p>
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
