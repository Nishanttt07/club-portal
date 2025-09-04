// import React, { useEffect, useState } from "react";
// import { supabase } from "../supabaseClient";
// import { useNavigate } from "react-router-dom";
// import "./UserDashboard.css";

// // Custom hook for authentication state
// function useAuth() {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const getSession = async () => {
//       const { data: { session } } = await supabase.auth.getSession();
//       setUser(session?.user ?? null);
//       setLoading(false);
//     };

//     getSession();

//     const { data: { subscription } } = supabase.auth.onAuthStateChange(
//       async (event, session) => {
//         setUser(session?.user ?? null);
//         setLoading(false);
//       }
//     );

//     return () => subscription.unsubscribe();
//   }, []);

//   return { user, loading };
// }

// // Custom hook for user data (memberships, events, announcements)
// function useUserData(user) {
//   const [memberships, setMemberships] = useState([]);
//   const [events, setEvents] = useState([]);
//   const [announcements, setAnnouncements] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (!user) return;

//     const fetchUserData = async () => {
//       try {
//         // Fetch user's memberships
//         const { data: membershipsData } = await supabase
//           .from("memberships")
//           .select("club_id")
//           .eq("user_id", user.id);

//         if (!membershipsData || membershipsData.length === 0) {
//           setLoading(false);
//           return;
//         }

//         const clubIds = membershipsData.map(m => m.club_id);

//         // Fetch events and announcements from user's clubs
//         await Promise.all([
//           fetchEvents(clubIds),
//           fetchAnnouncements(clubIds)
//         ]);
        
//         setLoading(false);
//       } catch (error) {
//         console.error("Error fetching user data:", error);
//         setLoading(false);
//       }
//     };

//     fetchUserData();
//   }, [user]);

//   const fetchEvents = async (clubIds) => {
//     let { data } = await supabase
//       .from("events")
//       .select("*")
//       .in("club_id", clubIds)
//       .order("date", { ascending: false });
//     setEvents(data || []);
//   };

//   const fetchAnnouncements = async (clubIds) => {
//     let { data } = await supabase
//       .from("announcements")
//       .select("*")
//       .in("club_id", clubIds)
//       .order("created_at", { ascending: false });
//     setAnnouncements(data || []);
//   };

//   return {
//     memberships,
//     events,
//     announcements,
//     loading,
//     fetchEvents,
//     fetchAnnouncements
//   };
// }

// // Event Post Component
// function EventPost({ event }) {
//   return (
//     <div className="post-card event-post">
//       <div className="post-header">
//         <h3 className="post-title">{event.title}</h3>
//         <span className="post-date">{new Date(event.date).toLocaleDateString()}</span>
//       </div>
//       {event.image_url && (
//         <img src={event.image_url} alt={event.title} className="post-image" />
//       )}
//       <div className="post-content">
//         <p className="post-details">
//           {event.time && <span>Time: {event.time}</span>}
//           {event.venue && <span>Venue: {event.venue}</span>}
//           {event.entry_fee && <span>Entry Fee: ${event.entry_fee}</span>}
//         </p>
//         {event.description && <p className="post-description">{event.description}</p>}
//         {event.prize_pool && <p className="post-prize">Prize Pool: {event.prize_pool}</p>}
//         {event.registration_link && (
//           <a href={event.registration_link} target="_blank" rel="noopener noreferrer" className="post-link">
//             Register Here
//           </a>
//         )}
//       </div>
//     </div>
//   );
// }

// // Announcement Post Component
// function AnnouncementPost({ announcement }) {
//   return (
//     <div className="post-card announcement-post">
//       <div className="post-header">
//         <h3 className="post-title">{announcement.title}</h3>
//         <span className="post-date">{new Date(announcement.created_at).toLocaleDateString()}</span>
//       </div>
//       {announcement.image_url && (
//         <img src={announcement.image_url} alt={announcement.title} className="post-image" />
//       )}
//       <div className="post-content">
//         <p className="post-message">{announcement.message}</p>
//         {announcement.link && (
//           <a href={announcement.link} target="_blank" rel="noopener noreferrer" className="post-link">
//             Learn More
//           </a>
//         )}
//       </div>
//     </div>
//   );
// }

// // Logout Confirmation Modal
// function LogoutModal({ show, onCancel, onConfirm }) {
//   if (!show) return null;

//   return (
//     <div className="modal-overlay" onClick={onCancel}>
//       <div className="modal-content" onClick={(e) => e.stopPropagation()}>
//         <div className="modal-header">
//           <h3>Confirm Logout</h3>
//           <button className="modal-close" onClick={onCancel}>×</button>
//         </div>
//         <div className="modal-body">
//           <p>Are you sure you want to log out?</p>
//           <div className="modal-buttons">
//             <button className="modal-button cancel" onClick={onCancel}>
//               Cancel
//             </button>
//             <button className="modal-button confirm" onClick={onConfirm}>
//               Log Out
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// // Main UserDashboard Component
// export default function UserDashboard() {
//   const { user, loading: authLoading } = useAuth();
//   const {
//     events,
//     announcements,
//     loading: dataLoading,
//     memberships
//   } = useUserData(user);
  
//   const [activeTab, setActiveTab] = useState("events");
//   const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
//   const navigate = useNavigate();

//   useEffect(() => {
//     if (!authLoading && !user) {
//       navigate("/login");
//     }
//   }, [user, authLoading, navigate]);

//   const handleLogout = async () => {
//     await supabase.auth.signOut();
//     navigate("/login");
//   };

//   if (authLoading || dataLoading) {
//     return (
//       <div className="dashboard-container loading">
//         <div className="loading-spinner"></div>
//         <p>Loading dashboard...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="dashboard-container">
//       <LogoutModal
//         show={showLogoutConfirm}
//         onCancel={() => setShowLogoutConfirm(false)}
//         onConfirm={handleLogout}
//       />

//       <div className="dashboard-header">
//         <h1>ClubHub Feed</h1>
//         <div className="user-controls">
//           <button className="logout-btn" onClick={() => setShowLogoutConfirm(true)}>
//             Logout
//           </button>
//         </div>
//       </div>

//       {memberships.length === 0 ? (
//         <div className="no-memberships">
//           <h2>Welcome to ClubHub!</h2>
//           <p>You haven't joined any clubs yet. Explore clubs and join to see events and announcements.</p>
//           <button className="explore-btn" onClick={() => navigate("/clubs")}>
//             Explore Clubs
//           </button>
//         </div>
//       ) : (
//         <>
//           {/* Tabs */}
//           <div className="tabs">
//             <button
//               className={`tab-btn ${activeTab === "events" ? "active" : ""}`}
//               onClick={() => setActiveTab("events")}
//             >
//               Events
//             </button>
//             <button
//               className={`tab-btn ${activeTab === "announcements" ? "active" : ""}`}
//               onClick={() => setActiveTab("announcements")}
//             >
//               Announcements
//             </button>
//           </div>

//           {/* Feed */}
//           <div className="feed">
//             {activeTab === "events" &&
//               (events.length > 0 ? (
//                 events.map((event) => (
//                   <EventPost key={event.id} event={event} />
//                 ))
//               ) : (
//                 <p className="no-data">No events yet.</p>
//               ))}

//             {activeTab === "announcements" &&
//               (announcements.length > 0 ? (
//                 announcements.map((a) => (
//                   <AnnouncementPost key={a.id} announcement={a} />
//                 ))
//               ) : (
//                 <p className="no-data">No announcements yet.</p>
//               ))}
//           </div>
//         </>
//       )}
//     </div>
//   );
// }

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

// Custom hook for user data
function useUserData(user) {
  const [clubs, setClubs] = useState([]);
  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchUserData = async () => {
      try {
        // Fetch user's clubs
        const { data: memberships } = await supabase
          .from("memberships")
          .select("club_id")
          .eq("user_id", user.id);

        if (memberships && memberships.length > 0) {
          const clubIds = memberships.map(m => m.club_id);
          
          // Fetch club details
          const { data: clubData } = await supabase
            .from("clubs")
            .select("*")
            .in("id", clubIds);
          
          setClubs(clubData || []);

          // Fetch events and announcements from user's clubs
          await Promise.all([
            fetchEvents(clubIds),
            fetchAnnouncements(clubIds)
          ]);
        }
        
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
      .select("*, clubs(name)")
      .in("club_id", clubIds)
      .order("created_at", { ascending: false });
    setEvents(data || []);
  };

  const fetchAnnouncements = async (clubIds) => {
    let { data } = await supabase
      .from("announcements")
      .select("*, clubs(name)")
      .in("club_id", clubIds)
      .order("created_at", { ascending: false });
    setAnnouncements(data || []);
  };

  return {
    clubs,
    events,
    announcements,
    loading,
    fetchEvents,
    fetchAnnouncements
  };
}

// Feed Item Component
function FeedItem({ item, type }) {
  const [expanded, setExpanded] = useState(false);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="feed-item">
      <div className="feed-item-header">
        <div className="club-info">
          {item.clubs && <div className="club-name">@{item.clubs.name}</div>}
          <span className="post-time">{formatDate(item.created_at)}</span>
        </div>
        <button className="more-options">⋯</button>
      </div>
      
      {type === 'event' ? (
        <>
          {item.image_url && (
            <div className="feed-image">
              <img src={item.image_url} alt={item.title} />
            </div>
          )}
          
          <div className="feed-content">
            <h3 className="event-title">{item.title}</h3>
            <p className="event-details">
              <span className="detail">
                <i className="icon calendar"></i>
                {formatDate(item.date)}
              </span>
              {item.time && (
                <span className="detail">
                  <i className="icon clock"></i>
                  {formatTime(item.time)}
                </span>
              )}
              {item.venue && (
                <span className="detail">
                  <i className="icon location"></i>
                  {item.venue}
                </span>
              )}
            </p>
            
            {item.description && (
              <p className={`event-description ${expanded ? 'expanded' : ''}`}>
                {item.description}
                {item.description.length > 150 && (
                  <button 
                    className="read-more" 
                    onClick={() => setExpanded(!expanded)}
                  >
                    {expanded ? 'Show less' : 'Read more'}
                  </button>
                )}
              </p>
            )}
            
            {(item.entry_fee || item.prize_pool) && (
              <div className="event-stats">
                {item.entry_fee && (
                  <span className="stat">
                    <i className="icon ticket"></i>
                    Entry: ${item.entry_fee}
                  </span>
                )}
                {item.prize_pool && (
                  <span className="stat">
                    <i className="icon trophy"></i>
                    Prize: {item.prize_pool}
                  </span>
                )}
              </div>
            )}
            
            {item.registration_link && (
              <a 
                href={item.registration_link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="registration-btn"
              >
                Register Now
              </a>
            )}
          </div>
        </>
      ) : (
        <>
          {item.image_url && (
            <div className="feed-image">
              <img src={item.image_url} alt={item.title} />
            </div>
          )}
          
          <div className="feed-content">
            <h3 className="announcement-title">{item.title}</h3>
            <p className={`announcement-message ${expanded ? 'expanded' : ''}`}>
              {item.message}
              {item.message.length > 150 && (
                <button 
                  className="read-more" 
                  onClick={() => setExpanded(!expanded)}
                >
                  {expanded ? 'Show less' : 'Read more'}
                </button>
              )}
            </p>
            
            {item.link && (
              <a 
                href={item.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="announcement-link"
              >
                Learn more
              </a>
            )}
          </div>
        </>
      )}
      
      <div className="feed-actions">
        <button 
          className={`action-btn ${liked ? 'liked' : ''}`}
          onClick={() => setLiked(!liked)}
        >
          <i className="icon heart">{liked ? '❤️' : '🤍'}</i>
          {liked ? 'Liked' : 'Like'}
        </button>
        
        <button className="action-btn">
          <i className="icon comment">💬</i>
          Comment
        </button>
        
        <button 
          className={`action-btn ${saved ? 'saved' : ''}`}
          onClick={() => setSaved(!saved)}
        >
          <i className="icon save">{saved ? '🔖' : '📑'}</i>
          {saved ? 'Saved' : 'Save'}
        </button>
        
        <button className="action-btn share">
          <i className="icon share">📤</i>
          Share
        </button>
      </div>
    </div>
  );
}

// Profile Section Component
function ProfileSection({ user, clubs, onLogout }) {
  const [activeTab, setActiveTab] = useState('clubs');
  
  return (
    <div className="profile-section">
      <div className="profile-header">
        <div className="profile-avatar">
          {user.email ? user.email[0].toUpperCase() : 'U'}
        </div>
        <div className="profile-info">
          <h2 className="profile-name">{user.email}</h2>
          <p className="profile-stats">
            <span>{clubs.length} Clubs</span>
            <span>•</span>
            <span>Member since {new Date(user.created_at).toLocaleDateString()}</span>
          </p>
        </div>
        <button className="logout-btn" onClick={onLogout}>
          Logout
        </button>
      </div>
      
      <div className="profile-tabs">
        <button 
          className={`tab ${activeTab === 'clubs' ? 'active' : ''}`}
          onClick={() => setActiveTab('clubs')}
        >
          My Clubs
        </button>
        <button 
          className={`tab ${activeTab === 'activity' ? 'active' : ''}`}
          onClick={() => setActiveTab('activity')}
        >
          My Activity
        </button>
      </div>
      
      <div className="tab-content">
        {activeTab === 'clubs' ? (
          <div className="clubs-grid">
            {clubs.map(club => (
              <div key={club.id} className="club-card">
                <div className="club-logo">
                  {club.logo_url ? (
                    <img src={club.logo_url} alt={club.name} />
                  ) : (
                    <div className="club-initials">
                      {club.name ? club.name[0].toUpperCase() : 'C'}
                    </div>
                  )}
                </div>
                <h3 className="club-name">{club.name}</h3>
                <p className="club-description">
                  {club.description || 'No description available'}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="activity-list">
            <p className="empty-state">Your activity will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
}

// AI Assistant Button Component
function AIAssistantButton() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      <button 
        className="ai-assistant-btn"
        onClick={() => setIsOpen(true)}
      >
        <i className="ai-icon">🤖</i>
        AI Assistant
      </button>
      
      {isOpen && (
        <div className="ai-assistant-modal">
          <div className="ai-modal-header">
            <h3>ClubHub AI Assistant</h3>
            <button className="close-btn" onClick={() => setIsOpen(false)}>
              ×
            </button>
          </div>
          <div className="ai-modal-content">
            <div className="ai-message">
              <div className="ai-avatar">AI</div>
              <div className="message-content">
                <p>Hi there! How can I help you with your clubs and events today?</p>
              </div>
            </div>
            
            <div className="suggested-questions">
              <button className="suggestion-chip">
                Suggest upcoming events I might like
              </button>
              <button className="suggestion-chip">
                Help me create a new event
              </button>
              <button className="suggestion-chip">
                Find clubs matching my interests
              </button>
            </div>
            
            <div className="ai-input-area">
              <input 
                type="text" 
                placeholder="Ask me anything about clubs and events..."
                className="ai-input"
              />
              <button className="ai-send-btn">
                <i className="send-icon">📤</i>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Main UserDashboard Component
export default function UserDashboard() {
  const { user, loading: authLoading } = useAuth();
  const {
    clubs,
    events,
    announcements,
    loading: dataLoading,
    fetchEvents,
    fetchAnnouncements
  } = useUserData(user);
  
  const [activeView, setActiveView] = useState('feed');
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

  // Combine events and announcements into a single feed and sort by date
  const feedItems = [...events.map(item => ({ ...item, type: 'event' })), 
                    ...announcements.map(item => ({ ...item, type: 'announcement' }))]
                    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  if (authLoading || dataLoading) {
    return (
      <div className="user-dashboard loading">
        <div className="loading-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="user-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <h1 className="app-logo">ClubHub</h1>
          <nav className="nav-tabs">
            <button 
              className={`nav-tab ${activeView === 'feed' ? 'active' : ''}`}
              onClick={() => setActiveView('feed')}
            >
              <i className="nav-icon">🏠</i>
              Feed
            </button>
            <button 
              className={`nav-tab ${activeView === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveView('profile')}
            >
              <i className="nav-icon">👤</i>
              Profile
            </button>
          </nav>
        </div>
        
        <div className="header-right">
          <AIAssistantButton />
          <div className="user-menu">
            <div className="user-avatar">
              {user.email ? user.email[0].toUpperCase() : 'U'}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        {activeView === 'feed' ? (
          <div className="feed-container">
            <div className="stories-bar">
              <div className="story">
                <div className="story-avatar">
                  <div className="add-story">+</div>
                </div>
                <span className="story-name">Your Story</span>
              </div>
              
              {clubs.map(club => (
                <div key={club.id} className="story">
                  <div className="story-avatar">
                    {club.logo_url ? (
                      <img src={club.logo_url} alt={club.name} />
                    ) : (
                      <div className="club-avatar">
                        {club.name ? club.name[0].toUpperCase() : 'C'}
                      </div>
                    )}
                  </div>
                  <span className="story-name">{club.name}</span>
                </div>
              ))}
            </div>
            
            <div className="feed">
              {feedItems.length > 0 ? (
                feedItems.map(item => (
                  <FeedItem 
                    key={`${item.type}-${item.id}`} 
                    item={item} 
                    type={item.type} 
                  />
                ))
              ) : (
                <div className="empty-feed">
                  <i className="empty-icon">📋</i>
                  <h3>No activities yet</h3>
                  <p>When clubs you're in post events or announcements, they'll appear here.</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <ProfileSection user={user} clubs={clubs} onLogout={() => setShowLogoutConfirm(true)} />
        )}
      </main>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="modal-overlay">
          <div className="modal-content confirm-modal">
            <h3>Confirm Logout</h3>
            <p>Are you sure you want to log out of ClubHub?</p>
            <div className="modal-actions">
              <button 
                className="modal-btn cancel"
                onClick={() => setShowLogoutConfirm(false)}
              >
                Cancel
              </button>
              <button 
                className="modal-btn confirm"
                onClick={handleLogout}
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}