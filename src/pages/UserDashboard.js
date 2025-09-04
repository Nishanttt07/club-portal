import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import "./UserDashboard.css"; // Custom CSS for Instagram-like styling

export default function UserDashboard() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("events");
  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      try {
        // ✅ safer than getUser()
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Error fetching session:", error.message);
          setLoading(false);
          return;
        }

        const sessionUser = data?.session?.user;
        console.log("Dashboard session user:", sessionUser);

        if (!sessionUser) {
          navigate("/login");
          return;
        }

        setUser(sessionUser);
        await fetchEvents();
        await fetchAnnouncements();
      } catch (err) {
        console.error("Unexpected error in init:", err);
      } finally {
        setLoading(false);
      }
    };

    init();

    // ✅ Redirect if user logs out or session expires
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        console.log("Auth change event:", _event, session);
        if (!session) {
          navigate("/login");
        } else {
          setUser(session.user);
        }
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [navigate]);

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("date", { ascending: false });
    if (!error) setEvents(data || []);
  };

  const fetchAnnouncements = async () => {
    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setAnnouncements(data || []);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  if (loading) return <p>Loading dashboard...</p>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>ClubHub Feed</h1>
        <div className="user-controls">
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab-btn ${activeTab === "events" ? "active" : ""}`}
          onClick={() => setActiveTab("events")}
        >
          Events
        </button>
        <button
          className={`tab-btn ${activeTab === "announcements" ? "active" : ""}`}
          onClick={() => setActiveTab("announcements")}
        >
          Announcements
        </button>
      </div>

      {/* Feed */}
      <div className="feed">
        {activeTab === "events" &&
          (events.length > 0 ? (
            events.map((event) => (
              <EventPost key={event.id} event={event} userId={user?.id} />
            ))
          ) : (
            <p className="no-data">No events yet.</p>
          ))}

        {activeTab === "announcements" &&
          (announcements.length > 0 ? (
            announcements.map((a) => (
              <AnnouncementPost
                key={a.id}
                announcement={a}
                userId={user?.id}
              />
            ))
          ) : (
            <p className="no-data">No announcements yet.</p>
          ))}
      </div>
    </div>
  );
}
