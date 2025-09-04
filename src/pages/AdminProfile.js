import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import "./AdminProfile.css"; // optional custom styles

export default function AdminProfile() {
  const [user, setUser] = useState(null);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Redirect if not admin
  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        console.error("Auth error:", error.message);
        navigate("/login");
        return;
      }

      if (!user) {
        navigate("/login");
        return;
      }

      setUser(user);

      // Check role
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError.message);
        navigate("/login");
        return;
      }

      if (profile?.role !== "admin") {
        navigate("/user-dashboard");
        return;
      }

      fetchClubs(user.id);
    };

    init();
  }, [navigate]);

  // Fetch clubs managed by admin
  const fetchClubs = async (adminId) => {
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("clubs")
      .select("*")
      .eq("admin_id", adminId);

    if (error) {
      console.error("Error fetching clubs:", error.message);
      setError("Failed to load clubs.");
    } else {
      setClubs(data || []);
    }

    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div className="admin-profile-container">
      <header className="admin-header">
        <h1>👑 Admin Dashboard</h1>
        <div className="admin-controls">
          <span>Welcome, {user.email}</span>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <section className="admin-details">
        <h2>Admin Profile</h2>
        <p>Email: {user.email}</p>
        <p>Joined: {formatDate(user.created_at)}</p>
      </section>

      <section className="admin-clubs">
        <h2>Managed Clubs</h2>
        {loading && <p>Loading clubs...</p>}
        {error && <p className="error">{error}</p>}
        {!loading && clubs.length === 0 && <p>You don’t manage any clubs yet.</p>}
        <div className="clubs-list">
          {clubs.map((club) => (
            <div key={club.id} className="club-card">
              <div className="club-logo">
                {club.logo_url ? (
                  <img src={club.logo_url} alt={club.name} />
                ) : (
                  "🏫"
                )}
              </div>
              <div className="club-info">
                <h3>{club.name}</h3>
                <p>{club.description || "No description available"}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
