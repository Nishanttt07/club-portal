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

// // Custom hook for user data
// function useUserData(user) {
//   const [clubs, setClubs] = useState([]);
//   const [events, setEvents] = useState([]);
//   const [announcements, setAnnouncements] = useState([]);
//   const [allClubs, setAllClubs] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (!user) return;

//     const fetchUserData = async () => {
//       try {
//         // Fetch user's clubs
//         const { data: memberships, error: membershipsError } = await supabase
//           .from("memberships")
//           .select("club_id")
//           .eq("user_id", user.id);

//         if (membershipsError) throw membershipsError;

//         // Fetch all available clubs
//         const { data: allClubsData, error: allClubsError } = await supabase
//           .from("clubs")
//           .select("*");
        
//         if (allClubsError) throw allClubsError;
//         setAllClubs(allClubsData || []);

//         if (memberships && memberships.length > 0) {
//           const clubIds = memberships.map(m => m.club_id);
          
//           // Fetch club details
//           const { data: clubData, error: clubError } = await supabase
//             .from("clubs")
//             .select("*")
//             .in("id", clubIds);
          
//           if (clubError) throw clubError;
//           setClubs(clubData || []);

//           // Fetch events and announcements from user's clubs
//           await Promise.all([
//             fetchEvents(clubIds),
//             fetchAnnouncements(clubIds)
//           ]);
//         }
        
//         setLoading(false);
//       } catch (error) {
//         console.error("Error fetching user data:", error);
//         setLoading(false);
//       }
//     };

//     fetchUserData();
//   }, [user]);

//   const fetchEvents = async (clubIds) => {
//     try {
//       let { data, error } = await supabase
//         .from("events")
//         .select("*, clubs(name)")
//         .in("club_id", clubIds)
//         .order("created_at", { ascending: false });
      
//       if (error) throw error;
//       setEvents(data || []);
//     } catch (error) {
//       console.error("Error fetching events:", error);
//     }
//   };

//   const fetchAnnouncements = async (clubIds) => {
//     try {
//       let { data, error } = await supabase
//         .from("announcements")
//         .select("*, clubs(name)")
//         .in("club_id", clubIds)
//         .order("created_at", { ascending: false });
      
//       if (error) throw error;
//       setAnnouncements(data || []);
//     } catch (error) {
//       console.error("Error fetching announcements:", error);
//     }
//   };

//   const joinClub = async (clubId) => {
//     try {
//       const { error } = await supabase
//         .from("memberships")
//         .insert([{ user_id: user.id, club_id: clubId }]);
      
//       if (error) throw error;
      
//       // Refresh clubs after joining
//       const { data: memberships, error: membershipsError } = await supabase
//         .from("memberships")
//         .select("club_id")
//         .eq("user_id", user.id);
      
//       if (membershipsError) throw membershipsError;
      
//       if (memberships && memberships.length > 0) {
//         const clubIds = memberships.map(m => m.club_id);
//         const { data: clubData, error: clubError } = await supabase
//           .from("clubs")
//           .select("*")
//           .in("id", clubIds);
        
//         if (clubError) throw clubError;
//         setClubs(clubData || []);
        
//         // Also update events and announcements
//         await Promise.all([
//           fetchEvents(clubIds),
//           fetchAnnouncements(clubIds)
//         ]);
//       }
      
//       return { success: true };
//     } catch (error) {
//       console.error("Error joining club:", error);
//       return { success: false, error };
//     }
//   };

//   return {
//     clubs,
//     events,
//     announcements,
//     allClubs,
//     loading,
//     fetchEvents,
//     fetchAnnouncements,
//     joinClub
//   };
// }

// // Feed Item Component
// function FeedItem({ item, type }) {
//   const [expanded, setExpanded] = useState(false);
  
//   const formatDate = (dateString) => {
//     if (!dateString) return 'Date not specified';
//     try {
//       const options = { year: 'numeric', month: 'short', day: 'numeric' };
//       return new Date(dateString).toLocaleDateString(undefined, options);
//     } catch (error) {
//       return 'Invalid date';
//     }
//   };

//   const formatTime = (timeString) => {
//     if (!timeString) return '';
//     try {
//       return new Date(`2000-01-01T${timeString}`).toLocaleTimeString([], { 
//         hour: '2-digit', 
//         minute: '2-digit' 
//       });
//     } catch (error) {
//       return 'Invalid time';
//     }
//   };

//   return (
//     <div className="feed-item">
//       <div className="feed-item-header">
//         <div className="club-info">
//           {item.clubs && <div className="club-name">@{item.clubs.name}</div>}
//           <span className="post-time">{formatDate(item.created_at)}</span>
//         </div>
//       </div>
      
//       {type === 'event' ? (
//         <>
//           {item.image_url && (
//             <div className="feed-image">
//               <img 
//                 src={item.image_url} 
//                 alt={item.title} 
//                 onError={(e) => {
//                   e.target.style.display = 'none';
//                 }}
//               />
//             </div>
//           )}
          
//           <div className="feed-content">
//             <h3 className="event-title">{item.title}</h3>
//             <p className="event-details">
//               <span className="detail">
//                 {formatDate(item.date)}
//               </span>
//               {item.time && (
//                 <span className="detail">
//                   {formatTime(item.time)}
//                 </span>
//               )}
//               {item.venue && (
//                 <span className="detail">
//                   {item.venue}
//                 </span>
//               )}
//             </p>
            
//             {item.description && (
//               <p className={`event-description ${expanded ? 'expanded' : ''}`}>
//                 {item.description}
//                 {item.description.length > 150 && (
//                   <button 
//                     className="read-more" 
//                     onClick={() => setExpanded(!expanded)}
//                   >
//                     {expanded ? 'Show less' : 'Read more'}
//                   </button>
//                 )}
//               </p>
//             )}
            
//             {(item.entry_fee || item.prize_pool) && (
//               <div className="event-stats">
//                 {item.entry_fee && (
//                   <span className="stat">
//                     Entry: ${item.entry_fee}
//                   </span>
//                 )}
//                 {item.prize_pool && (
//                   <span className="stat">
//                     Prize: {item.prize_pool}
//                   </span>
//                 )}
//               </div>
//             )}
            
//             {item.registration_link && (
//               <a 
//                 href={item.registration_link} 
//                 target="_blank" 
//                 rel="noopener noreferrer"
//                 className="registration-btn"
//               >
//                 Register Now
//               </a>
//             )}
//           </div>
//         </>
//       ) : (
//         <>
//           {item.image_url && (
//             <div className="feed-image">
//               <img 
//                 src={item.image_url} 
//                 alt={item.title} 
//                 onError={(e) => {
//                   e.target.style.display = 'none';
//                 }}
//               />
//             </div>
//           )}
          
//           <div className="feed-content">
//             <h3 className="announcement-title">{item.title}</h3>
//             <p className={`announcement-message ${expanded ? 'expanded' : ''}`}>
//               {item.message}
//               {item.message.length > 150 && (
//                 <button 
//                   className="read-more" 
//                   onClick={() => setExpanded(!expanded)}
//                 >
//                   {expanded ? 'Show less' : 'Read more'}
//                 </button>
//               )}
//             </p>
            
//             {item.link && (
//               <a 
//                 href={item.link} 
//                 target="_blank" 
//                 rel="noopener noreferrer"
//                 className="announcement-link"
//               >
//                 Learn more
//               </a>
//             )}
//           </div>
//         </>
//       )}
//     </div>
//   );
// }

// // Search Bar Component
// function SearchBar({ onSearch, searchQuery, setSearchQuery }) {
//   return (
//     <div className="search-bar">
//       <input
//         type="text"
//         placeholder="Search clubs, events, announcements..."
//         value={searchQuery}
//         onChange={(e) => setSearchQuery(e.target.value)}
//         className="search-input"
//       />
//       <button 
//         className="search-btn"
//         onClick={onSearch}
//       >
//         Search
//       </button>
//       {searchQuery && (
//         <button 
//           className="clear-search-btn"
//           onClick={() => setSearchQuery('')}
//         >
//           Clear
//         </button>
//       )}
//     </div>
//   );
// }

// // Profile Modal Component
// function ProfileModal({ user, clubs, onClose, onLogout }) {
//   const [activeTab, setActiveTab] = useState('clubs');
  
//   return (
//     <div className="modal-overlay">
//       <div className="modal-content profile-modal">
//         <div className="modal-header">
//           <h2>My Profile</h2>
//           <button className="close-btn" onClick={onClose}>×</button>
//         </div>
        
//         <div className="profile-content">
//           <div className="profile-header">
//             {user.email && (
//               <>
//                 <div className="profile-avatar">
//                   {user.email[0].toUpperCase()}
//                 </div>
//                 <div className="profile-info">
//                   <h2 className="profile-name">{user.email}</h2>
//                   <p className="profile-stats">
//                     <span>{clubs.length} Clubs</span>
//                     <span>•</span>
//                     <span>Member since {new Date(user.created_at).toLocaleDateString()}</span>
//                   </p>
//                 </div>
//               </>
//             )}
//           </div>
          
//           <div className="profile-tabs">
//             <button 
//               className={`tab ${activeTab === 'clubs' ? 'active' : ''}`}
//               onClick={() => setActiveTab('clubs')}
//             >
//               My Clubs
//             </button>
//           </div>
          
//           <div className="tab-content">
//             {activeTab === 'clubs' ? (
//               <div className="clubs-grid">
//                 {clubs.map(club => (
//                   <div key={club.id} className="club-card-new">
//                     <div className="club-card-header">
//                       <div className="club-logo">
//                         {club.logo_url ? (
//                           <img src={club.logo_url} alt={club.name} />
//                         ) : (
//                           <div className="club-initials">
//                             {club.name ? club.name[0].toUpperCase() : 'C'}
//                           </div>
//                         )}
//                       </div>
//                       <h3 className="club-name">{club.name}</h3>
//                     </div>
//                     <p className="club-description">
//                       {club.description || 'No description available'}
//                     </p>
//                     <div className="club-meta">
//                       <span className="club-members">123 members</span>
//                       <span className="club-events">5 upcoming events</span>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <div className="activity-list">
//                 <p className="empty-state">Your activity will appear here</p>
//               </div>
//             )}
//           </div>
          
//           <button className="logout-btn" onClick={onLogout}>
//             Logout
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// // AI Assistant Modal Component
// function AIAssistantModal({ events, announcements, onClose }) {
//   const [query, setQuery] = useState("");
//   const [response, setResponse] = useState("");
//   const [loading, setLoading] = useState(false);
  
//   const handleQuerySubmit = async (e) => {
//     e.preventDefault();
//     if (!query.trim()) return;
    
//     // Check if OpenAI key is configured
//     if (!process.env.REACT_APP_OPENAI_KEY) {
//       setResponse("OpenAI API key is not configured. Please contact the administrator.");
//       return;
//     }
    
//     setLoading(true);
    
//     try {
//       // Prepare context from events and announcements
//       const eventsContext = events.map(e => 
//         `Event: ${e.title} on ${e.date} at ${e.time || 'TBA'}. ${e.description || ''}`
//       ).join('\n');
      
//       const announcementsContext = announcements.map(a => 
//         `Announcement: ${a.title}. ${a.message || ''}`
//       ).join('\n');
      
//       const context = `Events:\n${eventsContext}\n\nAnnouncements:\n${announcementsContext}`;
      
//       // Call OpenAI API
//       const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_KEY}`
//         },
//         body: JSON.stringify({
//           model: "gpt-3.5-turbo",
//           messages: [
//             {
//               role: "system",
//               content: `You are a helpful assistant for a club management platform. 
//               Use the following information about events and announcements to answer the user's question.
//               If the information isn't in the provided context, say so politely.
              
//               Context:
//               ${context}`
//             },
//             {
//               role: "user",
//               content: query
//             }
//           ]
//         })
//       });
      
//       const data = await openaiResponse.json();
//       setResponse(data.choices[0].message.content);
//     } catch (error) {
//       console.error("Error calling OpenAI API:", error);
//       setResponse("Sorry, I'm having trouble connecting to the assistant. Please try again later.");
//     } finally {
//       setLoading(false);
//     }
//   };
  
//   return (
//     <div className="modal-overlay">
//       <div className="modal-content ai-modal">
//         <div className="modal-header">
//           <h2>ClubHub AI Assistant</h2>
//           <button className="close-btn" onClick={onClose}>×</button>
//         </div>
        
//         <div className="ai-modal-content">
//           <div className="ai-message">
//             <div className="message-content">
//               <p>Hi there! How can I help you with your clubs and events today?</p>
//             </div>
//           </div>
          
//           {response && (
//             <div className="ai-response">
//               <p>{response}</p>
//             </div>
//           )}
          
//           <form onSubmit={handleQuerySubmit} className="ai-input-area">
//             <input 
//               type="text" 
//               value={query}
//               onChange={(e) => setQuery(e.target.value)}
//               placeholder="Ask me anything about clubs and events..."
//               className="ai-input"
//               disabled={loading}
//             />
//             <button 
//               type="submit" 
//               className="ai-send-btn"
//               disabled={loading}
//             >
//               {loading ? "Processing..." : "Send"}
//             </button>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// }

// // Explore Section Component
// function ExploreSection({ clubs, onJoinClub, userClubs, searchQuery }) {
//   const [joining, setJoining] = useState(false);
  
//   const handleJoinClub = async (clubId) => {
//     setJoining(true);
//     const result = await onJoinClub(clubId);
//     setJoining(false);
//   };
  
//   // Filter clubs based on search query
//   const filteredClubs = clubs.filter(club => 
//     club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//     (club.description && club.description.toLowerCase().includes(searchQuery.toLowerCase()))
//   );
  
//   return (
//     <div className="explore-section">
//       <div className="section-header">
//         <h2>Explore Clubs</h2>
//         <p>Discover and join clubs that interest you</p>
//       </div>
      
//       <div className="explore-clubs-grid">
//         {filteredClubs.length > 0 ? (
//           filteredClubs.map(club => {
//             const isMember = userClubs.some(c => c.id === club.id);
            
//             return (
//               <div key={club.id} className="explore-club-card">
//                 <div className="explore-club-logo">
//                   {club.logo_url ? (
//                     <img src={club.logo_url} alt={club.name} />
//                   ) : (
//                     <div className="explore-club-initials">
//                       {club.name ? club.name[0].toUpperCase() : 'C'}
//                     </div>
//                   )}
//                 </div>
//                 <h3 className="explore-club-name">{club.name}</h3>
//                 <p className="explore-club-description">
//                   {club.description || 'No description available'}
//                 </p>
//                 <button 
//                   className={`join-btn ${isMember ? 'joined' : ''}`}
//                   onClick={() => !isMember && handleJoinClub(club.id)}
//                   disabled={isMember || joining}
//                 >
//                   {joining ? 'Joining...' : isMember ? 'Joined' : 'Join Club'}
//                 </button>
//               </div>
//             );
//           })
//         ) : (
//           <p className="empty-state">No clubs available {searchQuery ? 'matching your search' : 'at the moment'}.</p>
//         )}
//       </div>
//     </div>
//   );
// }

// // Main UserDashboard Component
// export default function UserDashboard() {
//   const { user, loading: authLoading } = useAuth();
//   const {
//     clubs,
//     events,
//     announcements,
//     allClubs,
//     loading: dataLoading,
//     joinClub
//   } = useUserData(user);
  
//   const [activeTab, setActiveTab] = useState('feed');
//   const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
//   const [showProfileModal, setShowProfileModal] = useState(false);
//   const [showAIModal, setShowAIModal] = useState(false);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [searchResults, setSearchResults] = useState({ events: [], announcements: [] });
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

//   // Handle search functionality
//   const handleSearch = () => {
//     if (!searchQuery.trim()) {
//       setSearchResults({ events: [], announcements: [] });
//       return;
//     }
    
//     const query = searchQuery.toLowerCase();
    
//     // Filter events and announcements based on search query
//     const filteredEvents = events.filter(event => 
//       event.title.toLowerCase().includes(query) ||
//       (event.description && event.description.toLowerCase().includes(query)) ||
//       (event.venue && event.venue.toLowerCase().includes(query))
//     );
    
//     const filteredAnnouncements = announcements.filter(announcement => 
//       announcement.title.toLowerCase().includes(query) ||
//       (announcement.message && announcement.message.toLowerCase().includes(query))
//     );
    
//     setSearchResults({
//       events: filteredEvents,
//       announcements: filteredAnnouncements
//     });
//   };

//   // Combine events and announcements into a single feed and sort by date
//   const feedItems = [...events.map(item => ({ ...item, type: 'event' })), 
//                     ...announcements.map(item => ({ ...item, type: 'announcement' }))]
//                     .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

//   // Create search results feed
//   const searchResultsFeed = [
//     ...searchResults.events.map(item => ({ ...item, type: 'event' })),
//     ...searchResults.announcements.map(item => ({ ...item, type: 'announcement' }))
//   ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

//   if (authLoading || dataLoading) {
//     return (
//       <div className="user-dashboard loading">
//         <div className="loading-spinner"></div>
//         <p>Loading your dashboard...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="user-dashboard">
//       {/* Header */}
//       <header className="dashboard-header">
//         <div className="header-left">
//           <h1 className="app-logo">ClubHub</h1>
//           <div className="left-buttons">
//             <button 
//               className="ai-btn"
//               onClick={() => setShowAIModal(true)}
//             >
//               AI Assistant
//             </button>
//           </div>
//         </div>
        
//         <div className="header-center">
//           <SearchBar 
//             onSearch={handleSearch}
//             searchQuery={searchQuery}
//             setSearchQuery={setSearchQuery}
//           />
//         </div>
        
//         <div className="header-right">
//           <button 
//             className="profile-btn"
//             onClick={() => setShowProfileModal(true)}
//           >
//             {user.email && (
//               <div className="user-avatar">
//                 {user.email[0].toUpperCase()}
//               </div>
//             )}
//             <span>My Profile</span>
//           </button>
//         </div>
//       </header>

//       {/* Main Content */}
//       <main className="dashboard-main">
//         {/* Navigation Tabs */}
//         <nav className="dashboard-nav">
//           <button 
//             className={`nav-tab ${activeTab === 'feed' ? 'active' : ''}`}
//             onClick={() => setActiveTab('feed')}
//           >
//             Feed
//           </button>
//           <button 
//             className={`nav-tab ${activeTab === 'explore' ? 'active' : ''}`}
//             onClick={() => setActiveTab('explore')}
//           >
//             Explore
//           </button>
//         </nav>

//         {/* Content based on active tab */}
//         {activeTab === 'feed' ? (
//           <div className="feed-container">
//             {searchQuery ? (
//               <>
//                 <div className="search-results-header">
//                   <h3>Search Results for "{searchQuery}"</h3>
//                   <button 
//                     className="clear-search-btn"
//                     onClick={() => setSearchQuery('')}
//                   >
//                     Clear Search
//                   </button>
//                 </div>
//                 {searchResultsFeed.length > 0 ? (
//                   <div className="feed">
//                     {searchResultsFeed.map(item => (
//                       <FeedItem 
//                         key={`${item.type}-${item.id}`} 
//                         item={item} 
//                         type={item.type} 
//                       />
//                     ))}
//                   </div>
//                 ) : (
//                   <div className="empty-feed">
//                     <h3>No results found</h3>
//                     <p>Try different search terms or browse all content.</p>
//                   </div>
//                 )}
//               </>
//             ) : clubs.length === 0 ? (
//               <div className="empty-feed">
//                 <h3>Welcome to ClubHub!</h3>
//                 <p>You haven't joined any clubs yet. Explore clubs and join to see events and announcements.</p>
//               </div>
//             ) : (
//               <div className="feed">
//                 {feedItems.length > 0 ? (
//                   feedItems.map(item => (
//                     <FeedItem 
//                       key={`${item.type}-${item.id}`} 
//                       item={item} 
//                       type={item.type} 
//                     />
//                   ))
//                 ) : (
//                   <div className="empty-feed">
//                     <h3>No activities yet</h3>
//                     <p>When clubs you're in post events or announcements, they'll appear here.</p>
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>
//         ) : (
//           <ExploreSection 
//             clubs={allClubs} 
//             userClubs={clubs}
//             onJoinClub={joinClub}
//             searchQuery={searchQuery}
//           />
//         )}
//       </main>

//       {/* Profile Modal */}
//       {showProfileModal && (
//         <ProfileModal 
//           user={user} 
//           clubs={clubs} 
//           onClose={() => setShowProfileModal(false)}
//           onLogout={() => setShowLogoutConfirm(true)}
//         />
//       )}

//       {/* AI Assistant Modal */}
//       {showAIModal && (
//         <AIAssistantModal 
//           events={events} 
//           announcements={announcements}
//           onClose={() => setShowAIModal(false)}
//         />
//       )}

//       {/* Logout Confirmation Modal */}
//       {showLogoutConfirm && (
//         <div className="modal-overlay">
//           <div className="modal-content confirm-modal">
//             <h3>Confirm Logout</h3>
//             <p>Are you sure you want to log out of ClubHub?</p>
//             <div className="modal-actions">
//               <button 
//                 className="modal-btn cancel"
//                 onClick={() => setShowLogoutConfirm(false)}
//               >
//                 Cancel
//               </button>
//               <button 
//                 className="modal-btn confirm"
//                 onClick={handleLogout}
//               >
//                 Log Out
//               </button>
//             </div>
//           </div>
//         </div>
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
  const [allClubs, setAllClubs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchUserData = async () => {
      try {
        // Fetch user's clubs
        const { data: memberships, error: membershipsError } = await supabase
          .from("memberships")
          .select("club_id")
          .eq("user_id", user.id);

        if (membershipsError) throw membershipsError;

        // Fetch all available clubs
        const { data: allClubsData, error: allClubsError } = await supabase
          .from("clubs")
          .select("*");
        
        if (allClubsError) throw allClubsError;
        setAllClubs(allClubsData || []);

        if (memberships && memberships.length > 0) {
          const clubIds = memberships.map(m => m.club_id);
          
          // Fetch club details
          const { data: clubData, error: clubError } = await supabase
            .from("clubs")
            .select("*")
            .in("id", clubIds);
          
          if (clubError) throw clubError;
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
    try {
      let { data, error } = await supabase
        .from("events")
        .select("*, clubs(name)")
        .in("club_id", clubIds)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  const fetchAnnouncements = async (clubIds) => {
    try {
      let { data, error } = await supabase
        .from("announcements")
        .select("*, clubs(name)")
        .in("club_id", clubIds)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      setAnnouncements(data || []);
    } catch (error) {
      console.error("Error fetching announcements:", error);
    }
  };

  const joinClub = async (clubId) => {
    try {
      const { error } = await supabase
        .from("memberships")
        .insert([{ user_id: user.id, club_id: clubId }]);
      
      if (error) throw error;
      
      // Refresh clubs after joining
      const { data: memberships, error: membershipsError } = await supabase
        .from("memberships")
        .select("club_id")
        .eq("user_id", user.id);
      
      if (membershipsError) throw membershipsError;
      
      if (memberships && memberships.length > 0) {
        const clubIds = memberships.map(m => m.club_id);
        const { data: clubData, error: clubError } = await supabase
          .from("clubs")
          .select("*")
          .in("id", clubIds);
        
        if (clubError) throw clubError;
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
    if (!dateString) return 'Date not specified';
    try {
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (error) {
      return 'Invalid date';
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    try {
      return new Date(`2000-01-01T${timeString}`).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch (error) {
      return 'Invalid time';
    }
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
              <img 
                src={item.image_url} 
                alt={item.title} 
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
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
              <img 
                src={item.image_url} 
                alt={item.title} 
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
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

// Search Bar Component
function SearchBar({ searchQuery, setSearchQuery }) {
  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Search clubs, events, announcements..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="search-input"
      />
      {searchQuery && (
        <button 
          className="clear-search-btn"
          onClick={() => setSearchQuery('')}
        >
          Clear
        </button>
      )}
    </div>
  );
}

// Profile Modal Component
function ProfileModal({ user, clubs, onClose, onLogout }) {
  const [activeTab, setActiveTab] = useState('clubs');
  
  return (
    <div className="modal-overlay">
      <div className="modal-content profile-modal">
        <div className="modal-header">
          <h2>My Profile</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="profile-content">
          <div className="profile-header">
            {user.email && (
              <>
                <div className="profile-avatar">
                  {user.email[0].toUpperCase()}
                </div>
                <div className="profile-info">
                  <h2 className="profile-name">{user.email}</h2>
                  <p className="profile-stats">
                    <span>{clubs.length} Clubs</span>
                    <span>•</span>
                    <span>Member since {new Date(user.created_at).toLocaleDateString()}</span>
                  </p>
                </div>
              </>
            )}
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
                  <div key={club.id} className="club-card-new">
                    <div className="club-card-header">
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
                    </div>
                    <p className="club-description">
                      {club.description || 'No description available'}
                    </p>
                    <div className="club-meta">
                      <span className="club-members">123 members</span>
                      <span className="club-events">5 upcoming events</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="activity-list">
                <p className="empty-state">Your activity will appear here</p>
              </div>
            )}
          </div>
          
          <button className="logout-btn" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

// AI Assistant Modal Component
function AIAssistantModal({ events, announcements, onClose }) {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  
  const handleQuerySubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    // Check if OpenAI key is configured
    if (!process.env.REACT_APP_OPENAI_KEY) {
      setResponse("OpenAI API key is not configured. Please contact the administrator.");
      return;
    }
    
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
          'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_KEY}`
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
    <div className="modal-overlay">
      <div className="modal-content ai-modal">
        <div className="modal-header">
          <h2>ClubHub AI Assistant</h2>
          <button className="close-btn" onClick={onClose}>×</button>
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
    </div>
  );
}

// Explore Section Component
function ExploreSection({ clubs, onJoinClub, userClubs, searchQuery }) {
  const [joining, setJoining] = useState(false);
  
  const handleJoinClub = async (clubId) => {
    setJoining(true);
    const result = await onJoinClub(clubId);
    setJoining(false);
  };
  
  // Filter clubs based on search query
  const filteredClubs = clubs.filter(club => 
    club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (club.description && club.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  return (
    <div className="explore-section">
      <div className="section-header">
        <h2>Explore Clubs</h2>
        <p>Discover and join clubs that interest you</p>
      </div>
      
      <div className="explore-clubs-grid">
        {filteredClubs.length > 0 ? (
          filteredClubs.map(club => {
            const isMember = userClubs.some(c => c.id === club.id);
            
            return (
              <div key={club.id} className="explore-club-card">
                <div className="explore-club-logo">
                  {club.logo_url ? (
                    <img src={club.logo_url} alt={club.name} />
                  ) : (
                    <div className="explore-club-initials">
                      {club.name ? club.name[0].toUpperCase() : 'C'}
                    </div>
                  )}
                </div>
                <h3 className="explore-club-name">{club.name}</h3>
                <p className="explore-club-description">
                  {club.description || 'No description available'}
                </p>
                <button 
                  className={`join-btn ${isMember ? 'joined' : ''}`}
                  onClick={() => !isMember && handleJoinClub(club.id)}
                  disabled={isMember || joining}
                >
                  {joining ? 'Joining...' : isMember ? 'Joined' : 'Join Club'}
                </button>
              </div>
            );
          })
        ) : (
          <p className="empty-state">No clubs available {searchQuery ? 'matching your search' : 'at the moment'}.</p>
        )}
      </div>
    </div>
  );
}

// Events Tab Component
function EventsTab({ events, searchQuery }) {
  // Filter events based on search query
  const filteredEvents = events.filter(event => 
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (event.description && event.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (event.venue && event.venue.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (event.clubs && event.clubs.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="tab-content">
      {filteredEvents.length > 0 ? (
        <div className="feed">
          {filteredEvents.map(event => (
            <FeedItem 
              key={`event-${event.id}`} 
              item={event} 
              type="event" 
            />
          ))}
        </div>
      ) : (
        <div className="empty-feed">
          <h3>{searchQuery ? 'No events found' : 'No events yet'}</h3>
          <p>
            {searchQuery 
              ? 'Try different search terms or browse all events.' 
              : 'When clubs you\'re in post events, they\'ll appear here.'
            }
          </p>
        </div>
      )}
    </div>
  );
}

// Announcements Tab Component
function AnnouncementsTab({ announcements, searchQuery }) {
  // Filter announcements based on search query
  const filteredAnnouncements = announcements.filter(announcement => 
    announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (announcement.message && announcement.message.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (announcement.clubs && announcement.clubs.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="tab-content">
      {filteredAnnouncements.length > 0 ? (
        <div className="feed">
          {filteredAnnouncements.map(announcement => (
            <FeedItem 
              key={`announcement-${announcement.id}`} 
              item={announcement} 
              type="announcement" 
            />
          ))}
        </div>
      ) : (
        <div className="empty-feed">
          <h3>{searchQuery ? 'No announcements found' : 'No announcements yet'}</h3>
          <p>
            {searchQuery 
              ? 'Try different search terms or browse all announcements.' 
              : 'When clubs you\'re in post announcements, they\'ll appear here.'
            }
          </p>
        </div>
      )}
    </div>
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
  
  const [activeTab, setActiveTab] = useState('events');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
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
          <div className="left-buttons">
            <button 
              className="ai-btn"
              onClick={() => setShowAIModal(true)}
            >
              AI Assistant
            </button>
          </div>
        </div>
        
        <div className="header-center">
          <SearchBar 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        </div>
        
        <div className="header-right">
          <button 
            className="profile-btn"
            onClick={() => setShowProfileModal(true)}
          >
            {user.email && (
              <div className="user-avatar">
                {user.email[0].toUpperCase()}
              </div>
            )}
            <span>My Profile</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Navigation Tabs */}
        <nav className="dashboard-nav">
          <button 
            className={`nav-tab ${activeTab === 'events' ? 'active' : ''}`}
            onClick={() => setActiveTab('events')}
          >
            Events
          </button>
          <button 
            className={`nav-tab ${activeTab === 'announcements' ? 'active' : ''}`}
            onClick={() => setActiveTab('announcements')}
          >
            Announcements
          </button>
          <button 
            className={`nav-tab ${activeTab === 'explore' ? 'active' : ''}`}
            onClick={() => setActiveTab('explore')}
          >
            Explore
          </button>
        </nav>

        {/* Content based on active tab */}
        <div className="tab-container">
          {activeTab === 'events' && (
            <EventsTab events={events} searchQuery={searchQuery} />
          )}
          
          {activeTab === 'announcements' && (
            <AnnouncementsTab announcements={announcements} searchQuery={searchQuery} />
          )}
          
          {activeTab === 'explore' && (
            <ExploreSection 
              clubs={allClubs} 
              userClubs={clubs}
              onJoinClub={joinClub}
              searchQuery={searchQuery}
            />
          )}
        </div>
      </main>

      {/* Profile Modal */}
      {showProfileModal && (
        <ProfileModal 
          user={user} 
          clubs={clubs} 
          onClose={() => setShowProfileModal(false)}
          onLogout={() => setShowLogoutConfirm(true)}
        />
      )}

      {/* AI Assistant Modal */}
      {showAIModal && (
        <AIAssistantModal 
          events={events} 
          announcements={announcements}
          onClose={() => setShowAIModal(false)}
        />
      )}

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