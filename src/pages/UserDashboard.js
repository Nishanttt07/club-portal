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
  const [allClubs, setAllClubs] = useState([]);
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

        // Fetch all available clubs
        const { data: allClubsData } = await supabase
          .from("clubs")
          .select("*");
        setAllClubs(allClubsData || []);

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

  const joinClub = async (clubId) => {
    try {
      const { data, error } = await supabase
        .from("memberships")
        .insert([{ user_id: user.id, club_id: clubId }]);
      
      if (error) throw error;
      
      // Refresh clubs after joining
      const { data: memberships } = await supabase
        .from("memberships")
        .select("club_id")
        .eq("user_id", user.id);
      
      if (memberships && memberships.length > 0) {
        const clubIds = memberships.map(m => m.club_id);
        const { data: clubData } = await supabase
          .from("clubs")
          .select("*")
          .in("id", clubIds);
        
        setClubs(clubData || []);
        
        // Also update events and announcements
        await Promise.all([
          fetchEvents(clubIds),
          fetchAnnouncements(clubIds)
        ]);
      }
      
      return { success: true };
    } catch (error) {
      console.error("Error joining club:", error);
      return { success: false, error };
    }
  };

  return {
    clubs,
    events,
    announcements,
    allClubs,
    loading,
    fetchEvents,
    fetchAnnouncements,
    joinClub
  };
}

// Feed Item Component
function FeedItem({ item, type }) {
  const [expanded, setExpanded] = useState(false);
  
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
                {formatDate(item.date)}
              </span>
              {item.time && (
                <span className="detail">
                  {formatTime(item.time)}
                </span>
              )}
              {item.venue && (
                <span className="detail">
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
                    Entry: ${item.entry_fee}
                  </span>
                )}
                {item.prize_pool && (
                  <span className="stat">
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

// AI Assistant Component
function AIAssistant({ events, announcements }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  
  const handleQuerySubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setLoading(true);
    
    try {
      // Prepare context from events and announcements
      const eventsContext = events.map(e => 
        `Event: ${e.title} on ${e.date} at ${e.time || 'TBA'}. ${e.description || ''}`
      ).join('\n');
      
      const announcementsContext = announcements.map(a => 
        `Announcement: ${a.title}. ${a.message || ''}`
      ).join('\n');
      
      const context = `Events:\n${eventsContext}\n\nAnnouncements:\n${announcementsContext}`;
      
      // Call OpenAI API
      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer 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`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: `You are a helpful assistant for a club management platform. 
              Use the following information about events and announcements to answer the user's question.
              If the information isn't in the provided context, say so politely.
              
              Context:
              ${context}`
            },
            {
              role: "user",
              content: query
            }
          ]
        })
      });
      
      const data = await openaiResponse.json();
      setResponse(data.choices[0].message.content);
    } catch (error) {
      console.error("Error calling OpenAI API:", error);
      setResponse("Sorry, I'm having trouble connecting to the assistant. Please try again later.");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <>
      <button 
        className="ai-assistant-btn"
        onClick={() => setIsOpen(true)}
      >
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
              <div className="message-content">
                <p>Hi there! How can I help you with your clubs and events today?</p>
              </div>
            </div>
            
            {response && (
              <div className="ai-response">
                <p>{response}</p>
              </div>
            )}
            
            <form onSubmit={handleQuerySubmit} className="ai-input-area">
              <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask me anything about clubs and events..."
                className="ai-input"
                disabled={loading}
              />
              <button 
                type="submit" 
                className="ai-send-btn"
                disabled={loading}
              >
                {loading ? "Processing..." : "Send"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

// Clubs Explorer Component
function ClubsExplorer({ clubs, onJoinClub, userClubs }) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      <button 
        className="clubs-explorer-btn"
        onClick={() => setIsOpen(true)}
      >
        Explore Clubs
      </button>
      
      {isOpen && (
        <div className="clubs-explorer-modal">
          <div className="modal-header">
            <h3>Available Clubs</h3>
            <button className="close-btn" onClick={() => setIsOpen(false)}>
              ×
            </button>
          </div>
          <div className="modal-content">
            {clubs.length > 0 ? (
              <div className="clubs-list">
                {clubs.map(club => {
                  const isMember = userClubs.some(c => c.id === club.id);
                  
                  return (
                    <div key={club.id} className="club-item">
                      <div className="club-info">
                        <h4>{club.name}</h4>
                        <p>{club.description || "No description available"}</p>
                      </div>
                      <button 
                        className={`join-btn ${isMember ? 'joined' : ''}`}
                        onClick={() => !isMember && onJoinClub(club.id)}
                        disabled={isMember}
                      >
                        {isMember ? 'Joined' : 'Join Club'}
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p>No clubs available at the moment.</p>
            )}
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
    allClubs,
    loading: dataLoading,
    joinClub
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
              Feed
            </button>
            <button 
              className={`nav-tab ${activeView === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveView('profile')}
            >
              Profile
            </button>
          </nav>
        </div>
        
        <div className="header-right">
          <ClubsExplorer 
            clubs={allClubs} 
            userClubs={clubs}
            onJoinClub={joinClub}
          />
          <AIAssistant events={events} announcements={announcements} />
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
            {clubs.length === 0 ? (
              <div className="empty-feed">
                <h3>Welcome to ClubHub!</h3>
                <p>You haven't joined any clubs yet. Explore clubs and join to see events and announcements.</p>
              </div>
            ) : (
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
                    <h3>No activities yet</h3>
                    <p>When clubs you're in post events or announcements, they'll appear here.</p>
                  </div>
                )}
              </div>
            )}
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