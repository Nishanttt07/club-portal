// import React, { useEffect, useState } from "react";
// import { supabase } from "../supabaseClient";
// import { useNavigate } from "react-router-dom";
// import "./UserDashboard.css"; // Custom CSS for Instagram-like styling

// export default function UserDashboard() {
//   const [user, setUser] = useState(null);
//   const [activeTab, setActiveTab] = useState("events"); // "events" | "announcements"
//   const [events, setEvents] = useState([]);
//   const [announcements, setAnnouncements] = useState([]);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const init = async () => {
//       const {
//         data: { user },
//       } = await supabase.auth.getUser();
//       if (!user) navigate("/login");
//       setUser(user);

//       fetchEvents();
//       fetchAnnouncements();
//     };
//     init();
//   }, [navigate]);

//   const fetchEvents = async () => {
//     let { data } = await supabase.from("events").select("*").order("date", { ascending: false });
//     setEvents(data || []);
//   };

//   const fetchAnnouncements = async () => {
//     let { data } = await supabase.from("announcements").select("*").order("created_at", { ascending: false });
//     setAnnouncements(data || []);
//   };

//   const handleLogout = async () => {
//     await supabase.auth.signOut();
//     navigate("/login");
//   };

//   return (
//     <div className="dashboard-container">
//       <div className="dashboard-header">
//         <h1>ClubHub Feed</h1>
//         <div className="user-controls">
//           <span className="welcome-text">Hi, {user?.email}</span>
//           {/* <button className="logout-btn" onClick={handleLogout}>Logout</button> */}
//         </div>
//       </div>

//       {/* Tabs */}
//       <div className="tabs">
//         <button 
//           className={`tab-btn ${activeTab === "events" ? "active" : ""}`} 
//           onClick={() => setActiveTab("events")}
//         >
//           Events
//         </button>
//         <button 
//           className={`tab-btn ${activeTab === "announcements" ? "active" : ""}`} 
//           onClick={() => setActiveTab("announcements")}
//         >
//           Announcements
//         </button>
//       </div>

//       {/* Feed */}
//       <div className="feed">
//         {activeTab === "events" &&
//           (events.length > 0 ? (
//             events.map((event) => (
//               <EventPost key={event.id} event={event} userId={user?.id} />
//             ))
//           ) : (
//             <p className="no-data">No events yet.</p>
//           ))}

//         {activeTab === "announcements" &&
//           (announcements.length > 0 ? (
//             announcements.map((a) => (
//               <AnnouncementPost key={a.id} announcement={a} userId={user?.id} />
//             ))
//           ) : (
//             <p className="no-data">No announcements yet.</p>
//           ))}
//       </div>
//     </div>
//   );
// }

// /* ------------------ EVENT POST ------------------ */
// function EventPost({ event, userId }) {
//   const [likes, setLikes] = useState(0);
//   const [userLiked, setUserLiked] = useState(false);

//   useEffect(() => {
//     fetchLikes();
//   }, [event.id, userId]);

//   const fetchLikes = async () => {
//     const { count } = await supabase
//       .from("event_likes")
//       .select("*", { count: "exact" })
//       .eq("event_id", event.id);
//     setLikes(count || 0);

//     if (userId) {
//       const { data } = await supabase
//         .from("event_likes")
//         .select("id")
//         .eq("event_id", event.id)
//         .eq("user_id", userId)
//         .maybeSingle();
//       setUserLiked(!!data);
//     }
//   };

//   const handleLike = async () => {
//     if (!userId) return;
//     if (userLiked) {
//       await supabase.from("event_likes").delete().eq("event_id", event.id).eq("user_id", userId);
//       setUserLiked(false);
//       setLikes(likes - 1);
//     } else {
//       await supabase.from("event_likes").insert([{ event_id: event.id, user_id: userId }]);
//       setUserLiked(true);
//       setLikes(likes + 1);
//     }
//   };

//   return (
//     <div className="post-card">
//       {event.image_url && <img src={event.image_url} alt={event.title} className="post-image" />}
//       <div className="post-content">
//         <h3 className="post-title">{event.title}</h3>
//         <p className="post-description">{event.description}</p>
//         <div className="post-meta">
//           <span>{new Date(event.date).toLocaleDateString()} • {event.time}</span>
//           <span>{event.venue}</span>
//           {event.entry_fee && <span>Entry: {event.entry_fee > 0 ? `$${event.entry_fee}` : "Free"}</span>}
//           {event.prize_pool && <span>Prize: {event.prize_pool}</span>}
//         </div>
//         <div className="post-actions">
//           <button className={`like-btn ${userLiked ? "liked" : ""}`} onClick={handleLike}>
//             {userLiked ? "❤️" : "🤍"} {likes}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// /* ------------------ ANNOUNCEMENT POST ------------------ */
// function AnnouncementPost({ announcement, userId }) {
//   const [likes, setLikes] = useState(0);
//   const [userLiked, setUserLiked] = useState(false);

//   useEffect(() => {
//     fetchLikes();
//   }, [announcement.id, userId]);

//   const fetchLikes = async () => {
//     const { count } = await supabase
//       .from("announcement_likes")
//       .select("*", { count: "exact" })
//       .eq("announcement_id", announcement.id);
//     setLikes(count || 0);

//     if (userId) {
//       const { data } = await supabase
//         .from("announcement_likes")
//         .select("id")
//         .eq("announcement_id", announcement.id)
//         .eq("user_id", userId)
//         .maybeSingle();
//       setUserLiked(!!data);
//     }
//   };

//   const handleLike = async () => {
//     if (!userId) return;
//     if (userLiked) {
//       await supabase.from("announcement_likes").delete().eq("announcement_id", announcement.id).eq("user_id", userId);
//       setUserLiked(false);
//       setLikes(likes - 1);
//     } else {
//       await supabase.from("announcement_likes").insert([{ announcement_id: announcement.id, user_id: userId }]);
//       setUserLiked(true);
//       setLikes(likes + 1);
//     }
//   };

//   return (
//     <div className="post-card">
//       {announcement.image_url && <img src={announcement.image_url} alt={announcement.title} className="post-image" />}
//       <div className="post-content">
//         <h3 className="post-title">{announcement.title}</h3>
//         <p className="post-description">{announcement.message}</p>
//         {announcement.link && (
//           <a href={announcement.link} target="_blank" rel="noreferrer" className="post-link">
//             Learn more
//           </a>
//         )}
//         <div className="post-actions">
//           <button className={`like-btn ${userLiked ? "liked" : ""}`} onClick={handleLike}>
//             {userLiked ? "❤️" : "🤍"} {likes}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }


import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import "./UserDashboard.css"; // Custom CSS for Instagram-like styling

export default function UserDashboard() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("events"); // "events" | "announcements"
  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }
      setUser(user);

      fetchEvents();
      fetchAnnouncements();
    };

    init();

    // ✅ Redirect if user logs out or session expires
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!session) {
          navigate("/login");
        } else {
          setUser(session.user);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  const fetchEvents = async () => {
    let { data } = await supabase.from("events").select("*").order("date", { ascending: false });
    setEvents(data || []);
  };

  const fetchAnnouncements = async () => {
    let { data } = await supabase.from("announcements").select("*").order("created_at", { ascending: false });
    setAnnouncements(data || []);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>ClubHub Feed</h1>
        <div className="user-controls">
          <span className="welcome-text">Hi, {user?.email}</span>
          {/* Uncomment to allow logout button */}
          {/* <button className="logout-btn" onClick={handleLogout}>Logout</button> */}
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
              <AnnouncementPost key={a.id} announcement={a} userId={user?.id} />
            ))
          ) : (
            <p className="no-data">No announcements yet.</p>
          ))}
      </div>
    </div>
  );
}

/* ------------------ EVENT POST ------------------ */
function EventPost({ event, userId }) {
  const [likes, setLikes] = useState(0);
  const [userLiked, setUserLiked] = useState(false);

  useEffect(() => {
    fetchLikes();
  }, [event.id, userId]);

  const fetchLikes = async () => {
    const { count } = await supabase
      .from("event_likes")
      .select("*", { count: "exact" })
      .eq("event_id", event.id);
    setLikes(count || 0);

    if (userId) {
      const { data } = await supabase
        .from("event_likes")
        .select("id")
        .eq("event_id", event.id)
        .eq("user_id", userId)
        .maybeSingle();
      setUserLiked(!!data);
    }
  };

  const handleLike = async () => {
    if (!userId) return;
    if (userLiked) {
      await supabase.from("event_likes").delete().eq("event_id", event.id).eq("user_id", userId);
      setUserLiked(false);
      setLikes(likes - 1);
    } else {
      await supabase.from("event_likes").insert([{ event_id: event.id, user_id: userId }]);
      setUserLiked(true);
      setLikes(likes + 1);
    }
  };

  return (
    <div className="post-card">
      {event.image_url && <img src={event.image_url} alt={event.title} className="post-image" />}
      <div className="post-content">
        <h3 className="post-title">{event.title}</h3>
        <p className="post-description">{event.description}</p>
        <div className="post-meta">
          <span>{new Date(event.date).toLocaleDateString()} • {event.time}</span>
          <span>{event.venue}</span>
          {event.entry_fee && <span>Entry: {event.entry_fee > 0 ? `$${event.entry_fee}` : "Free"}</span>}
          {event.prize_pool && <span>Prize: {event.prize_pool}</span>}
        </div>
        <div className="post-actions">
          <button className={`like-btn ${userLiked ? "liked" : ""}`} onClick={handleLike}>
            {userLiked ? "❤️" : "🤍"} {likes}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------ ANNOUNCEMENT POST ------------------ */
function AnnouncementPost({ announcement, userId }) {
  const [likes, setLikes] = useState(0);
  const [userLiked, setUserLiked] = useState(false);

  useEffect(() => {
    fetchLikes();
  }, [announcement.id, userId]);

  const fetchLikes = async () => {
    const { count } = await supabase
      .from("announcement_likes")
      .select("*", { count: "exact" })
      .eq("announcement_id", announcement.id);
    setLikes(count || 0);

    if (userId) {
      const { data } = await supabase
        .from("announcement_likes")
        .select("id")
        .eq("announcement_id", announcement.id)
        .eq("user_id", userId)
        .maybeSingle();
      setUserLiked(!!data);
    }
  };

  const handleLike = async () => {
    if (!userId) return;
    if (userLiked) {
      await supabase.from("announcement_likes").delete().eq("announcement_id", announcement.id).eq("user_id", userId);
      setUserLiked(false);
      setLikes(likes - 1);
    } else {
      await supabase.from("announcement_likes").insert([{ announcement_id: announcement.id, user_id: userId }]);
      setUserLiked(true);
      setLikes(likes + 1);
    }
  };

  return (
    <div className="post-card">
      {announcement.image_url && <img src={announcement.image_url} alt={announcement.title} className="post-image" />}
      <div className="post-content">
        <h3 className="post-title">{announcement.title}</h3>
        <p className="post-description">{announcement.message}</p>
        {announcement.link && (
          <a href={announcement.link} target="_blank" rel="noreferrer" className="post-link">
            Learn more
          </a>
        )}
        <div className="post-actions">
          <button className={`like-btn ${userLiked ? "liked" : ""}`} onClick={handleLike}>
            {userLiked ? "❤️" : "🤍"} {likes}
          </button>
        </div>
      </div>
    </div>
  );
}
