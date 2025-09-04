import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import "./UserDashboard.css";

// Custom hook for authentication state
function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return { user, loading };
}

// Custom hook for user data (memberships, events, announcements)
function useUserData(user) {
  const [memberships, setMemberships] = useState([]);
  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchUserData = async () => {
      try {
        // Fetch user's memberships
        const { data: membershipsData } = await supabase
          .from("memberships")
          .select("club_id")
          .eq("user_id", user.id);

        if (!membershipsData || membershipsData.length === 0) {
          setLoading(false);
          return;
        }

        const clubIds = membershipsData.map(m => m.club_id);

        // Fetch events and announcements from user's clubs
        await Promise.all([
          fetchEvents(clubIds),
          fetchAnnouncements(clubIds)
        ]);
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  const fetchEvents = async (clubIds) => {
    let { data } = await supabase
      .from("events")
      .select("*")
      .in("club_id", clubIds)
      .order("date", { ascending: false });
    setEvents(data || []);
  };

  const fetchAnnouncements = async (clubIds) => {
    let { data } = await supabase
      .from("announcements")
      .select("*")
      .in("club_id", clubIds)
      .order("created_at", { ascending: false });
    setAnnouncements(data || []);
  };

  return {
    memberships,
    events,
    announcements,
    loading,
    fetchEvents,
    fetchAnnouncements
  };
}

// Event Post Component
function EventPost({ event }) {
  return (
    <div className="post-card event-post">
      <div className="post-header">
        <h3 className="post-title">{event.title}</h3>
        <span className="post-date">{new Date(event.date).toLocaleDateString()}</span>
      </div>
      {event.image_url && (
        <img src={event.image_url} alt={event.title} className="post-image" />
      )}
      <div className="post-content">
        <p className="post-details">
          {event.time && <span>Time: {event.time}</span>}
          {event.venue && <span>Venue: {event.venue}</span>}
          {event.entry_fee && <span>Entry Fee: ${event.entry_fee}</span>}
        </p>
        {event.description && <p className="post-description">{event.description}</p>}
        {event.prize_pool && <p className="post-prize">Prize Pool: {event.prize_pool}</p>}
        {event.registration_link && (
          <a href={event.registration_link} target="_blank" rel="noopener noreferrer" className="post-link">
            Register Here
          </a>
        )}
      </div>
    </div>
  );
}

// Announcement Post Component
function AnnouncementPost({ announcement }) {
  return (
    <div className="post-card announcement-post">
      <div className="post-header">
        <h3 className="post-title">{announcement.title}</h3>
        <span className="post-date">{new Date(announcement.created_at).toLocaleDateString()}</span>
      </div>
      {announcement.image_url && (
        <img src={announcement.image_url} alt={announcement.title} className="post-image" />
      )}
      <div className="post-content">
        <p className="post-message">{announcement.message}</p>
        {announcement.link && (
          <a href={announcement.link} target="_blank" rel="noopener noreferrer" className="post-link">
            Learn More
          </a>
        )}
      </div>
    </div>
  );
}

// Logout Confirmation Modal
function LogoutModal({ show, onCancel, onConfirm }) {
  if (!show) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Confirm Logout</h3>
          <button className="modal-close" onClick={onCancel}>×</button>
        </div>
        <div className="modal-body">
          <p>Are you sure you want to log out?</p>
          <div className="modal-buttons">
            <button className="modal-button cancel" onClick={onCancel}>
              Cancel
            </button>
            <button className="modal-button confirm" onClick={onConfirm}>
              Log Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main UserDashboard Component
export default function UserDashboard() {
  const { user, loading: authLoading } = useAuth();
  const {
    events,
    announcements,
    loading: dataLoading,
    memberships
  } = useUserData(user);
  
  const [activeTab, setActiveTab] = useState("events");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  if (authLoading || dataLoading) {
    return (
      <div className="dashboard-container loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <LogoutModal
        show={showLogoutConfirm}
        onCancel={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
      />

      <div className="dashboard-header">
        <h1>ClubHub Feed</h1>
        <div className="user-controls">
          <button className="logout-btn" onClick={() => setShowLogoutConfirm(true)}>
            Logout
          </button>
        </div>
      </div>

      {memberships.length === 0 ? (
        <div className="no-memberships">
          <h2>Welcome to ClubHub!</h2>
          <p>You haven't joined any clubs yet. Explore clubs and join to see events and announcements.</p>
          <button className="explore-btn" onClick={() => navigate("/clubs")}>
            Explore Clubs
          </button>
        </div>
      ) : (
        <>
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
                  <EventPost key={event.id} event={event} />
                ))
              ) : (
                <p className="no-data">No events yet.</p>
              ))}

            {activeTab === "announcements" &&
              (announcements.length > 0 ? (
                announcements.map((a) => (
                  <AnnouncementPost key={a.id} announcement={a} />
                ))
              ) : (
                <p className="no-data">No announcements yet.</p>
              ))}
          </div>
        </>
      )}
    </div>
  );
}