// import React, { useEffect, useState } from "react";
// import { supabase } from "../supabaseClient";
// import { useNavigate } from "react-router-dom";
// import "./AdminDashboard.css"; // Import the CSS file

// export default function AdminDashboard() {
//   const [user, setUser] = useState(null);
//   const [club, setClub] = useState(null);
//   const [events, setEvents] = useState([]);
//   const [announcements, setAnnouncements] = useState([]);
//   const [members, setMembers] = useState([]);
//   const [expandedSections, setExpandedSections] = useState({
//     club: true,
//     events: true,
//     announcements: true,
//     members: true,
//   });

//   // Club form state
//   const [clubName, setClubName] = useState("");
//   const [clubDescription, setClubDescription] = useState("");
//   const [clubLogo, setClubLogo] = useState("");

//   // Event form state
//   const [title, setTitle] = useState("");
//   const [date, setDate] = useState("");
//   const [time, setTime] = useState("");
//   const [venue, setVenue] = useState("");
//   const [description, setDescription] = useState("");
//   const [entryFee, setEntryFee] = useState("");
//   const [prizePool, setPrizePool] = useState("");
//   const [imageUrl, setImageUrl] = useState("");

//   // Announcement form state
//   const [annTitle, setAnnTitle] = useState("");
//   const [message, setMessage] = useState("");
//   const [annImageUrl, setAnnImageUrl] = useState("");
//   const [link, setLink] = useState("");

//   const navigate = useNavigate();

//   useEffect(() => {
//     const init = async () => {
//       const {
//         data: { user },
//       } = await supabase.auth.getUser();
//       if (!user) navigate("/login");
//       setUser(user);

//       // Fetch club
//       let { data: clubData } = await supabase
//         .from("clubs")
//         .select("*")
//         .eq("admin_user_id", user.id)
//         .single();

//       setClub(clubData);

//       if (clubData) {
//         setClubName(clubData.name);
//         setClubDescription(clubData.description);
//         setClubLogo(clubData.logo_url);

//         fetchEvents(clubData.id);
//         fetchAnnouncements(clubData.id);
//         fetchMembers(clubData.id);
//       }
//     };
//     init();
//   }, [navigate]);

//   const fetchEvents = async (clubId) => {
//     let { data } = await supabase
//       .from("events")
//       .select("*")
//       .eq("club_id", clubId)
//       .order("created_at", { ascending: false });
//     setEvents(data || []);
//   };

//   const fetchAnnouncements = async (clubId) => {
//     let { data } = await supabase
//       .from("announcements")
//       .select("*")
//       .eq("club_id", clubId)
//       .order("created_at", { ascending: false });
//     setAnnouncements(data || []);
//   };

//   const fetchMembers = async (clubId) => {
//     let { data: memberships } = await supabase
//       .from("memberships")
//       .select("id, joined_at, user_id")
//       .eq("club_id", clubId);

//     if (!memberships) return;

//     // fetch user emails from auth.users
//     const memberList = await Promise.all(
//       memberships.map(async (m) => {
//         const { data: userData, error } = await supabase.auth.admin.getUserById(
//           m.user_id
//         );
//         return {
//           ...m,
//           email: userData?.user?.email || "Unknown",
//         };
//       })
//     );

//     setMembers(memberList);
//   };

//   // Logout
//   const handleLogout = async () => {
//     await supabase.auth.signOut();
//     navigate("/login");
//   };

//   // Toggle section expansion
//   const toggleSection = (section) => {
//     setExpandedSections((prev) => ({
//       ...prev,
//       [section]: !prev[section],
//     }));
//   };

//   // Save or update club profile
//   const saveClub = async (e) => {
//     e.preventDefault();
//     if (club) {
//       await supabase
//         .from("clubs")
//         .update({
//           name: clubName,
//           description: clubDescription,
//           logo_url: clubLogo,
//         })
//         .eq("id", club.id);
//       alert("Club updated successfully!");
//     } else {
//       const { data } = await supabase
//         .from("clubs")
//         .insert([
//           {
//             name: clubName,
//             description: clubDescription,
//             logo_url: clubLogo,
//             admin_user_id: user.id,
//           },
//         ])
//         .select()
//         .single();
//       setClub(data);
//       alert("Club created successfully!");
//     }
//   };

//   // Add new event
//   const addEvent = async (e) => {
//     e.preventDefault();
//     await supabase.from("events").insert([
//       {
//         title,
//         date,
//         time,
//         venue,
//         description,
//         entry_fee: entryFee,
//         prize_pool: prizePool,
//         image_url: imageUrl,
//         club_id: club.id,
//       },
//     ]);
//     fetchEvents(club.id);
//     setTitle("");
//     setDate("");
//     setTime("");
//     setVenue("");
//     setDescription("");
//     setEntryFee("");
//     setPrizePool("");
//     setImageUrl("");
//     alert("Event added successfully!");
//   };

//   const deleteEvent = async (id) => {
//     if (window.confirm("Are you sure you want to delete this event?")) {
//       await supabase.from("events").delete().eq("id", id);
//       fetchEvents(club.id);
//       alert("Event deleted successfully!");
//     }
//   };

//   // Add announcement
//   const addAnnouncement = async (e) => {
//     e.preventDefault();
//     await supabase.from("announcements").insert([
//       {
//         title: annTitle,
//         message,
//         image_url: annImageUrl,
//         link,
//         club_id: club.id,
//       },
//     ]);
//     fetchAnnouncements(club.id);
//     setAnnTitle("");
//     setMessage("");
//     setAnnImageUrl("");
//     setLink("");
//     alert("Announcement added successfully!");
//   };

//   const deleteAnnouncement = async (id) => {
//     if (window.confirm("Are you sure you want to delete this announcement?")) {
//       await supabase.from("announcements").delete().eq("id", id);
//       fetchAnnouncements(club.id);
//       alert("Announcement deleted successfully!");
//     }
//   };

//   // Remove member
//   const removeMember = async (membershipId, email) => {
//     if (
//       window.confirm(`Are you sure you want to remove ${email} from the club?`)
//     ) {
//       await supabase.from("memberships").delete().eq("id", membershipId);
//       fetchMembers(club.id);
//       alert("Member removed successfully!");
//     }
//   };

//   return (
//     <div className="admin-dashboard">
//       <div className="dashboard-header">
//         <h2>Club Admin Dashboard</h2>
//       </div>

//       <p className="welcome-text">Welcome, {user?.email}</p>

//       {club && (
//         <div className="stats-grid">
//           <div className="stat-card">
//             <p className="stat-value">{events.length}</p>
//             <p className="stat-label">Events</p>
//           </div>
//           <div className="stat-card">
//             <p className="stat-value">{announcements.length}</p>
//             <p className="stat-label">Announcements</p>
//           </div>
//           <div className="stat-card">
//             <p className="stat-value">{members.length}</p>
//             <p className="stat-label">Members</p>
//           </div>
//         </div>
//       )}

//       {/* Club Profile */}
//       <div className="section">
//         <div
//           className="collapsible-header"
//           onClick={() => toggleSection("club")}
//         >
//           <h3>Club Profile</h3>
//           <span
//             className={`toggle-icon ${expandedSections.club ? "expanded" : ""}`}
//           >
//             ▼
//           </span>
//         </div>
//         <div
//           className={`collapsible-content ${
//             expandedSections.club ? "expanded" : ""
//           }`}
//         >
//           <form onSubmit={saveClub}>
//             <div className="form-grid">
//               <div className="form-group">
//                 <label>Club Name</label>
//                 <input
//                   type="text"
//                   className="form-input"
//                   placeholder="Club Name"
//                   value={clubName}
//                   onChange={(e) => setClubName(e.target.value)}
//                   required
//                 />
//               </div>
//               <div className="form-group">
//                 <label>Description</label>
//                 <input
//                   type="text"
//                   className="form-input"
//                   placeholder="Description"
//                   value={clubDescription}
//                   onChange={(e) => setClubDescription(e.target.value)}
//                 />
//               </div>
//               <div className="form-group">
//                 <label>Logo URL</label>
//                 <input
//                   type="text"
//                   className="form-input"
//                   placeholder="Logo URL"
//                   value={clubLogo}
//                   onChange={(e) => setClubLogo(e.target.value)}
//                 />
//               </div>
//             </div>
//             <button type="submit" className="form-submit">
//               {club ? "Update Club" : "Create Club"}
//             </button>
//           </form>
//         </div>
//       </div>

//       {club && (
//         <>
//           {/* Events Section */}
//           <div className="section">
//             <div
//               className="collapsible-header"
//               onClick={() => toggleSection("events")}
//             >
//               <h3>Manage Events ({events.length})</h3>
//               <span
//                 className={`toggle-icon ${
//                   expandedSections.events ? "expanded" : ""
//                 }`}
//               >
//                 ▼
//               </span>
//             </div>
//             <div
//               className={`collapsible-content ${
//                 expandedSections.events ? "expanded" : ""
//               }`}
//             >
//               <form onSubmit={addEvent}>
//                 <div className="form-grid">
//                   <div className="form-group">
//                     <label>Title</label>
//                     <input
//                       type="text"
//                       className="form-input"
//                       placeholder="Title"
//                       value={title}
//                       onChange={(e) => setTitle(e.target.value)}
//                       required
//                     />
//                   </div>
//                   <div className="form-group">
//                     <label>Date</label>
//                     <input
//                       type="date"
//                       className="form-input"
//                       value={date}
//                       onChange={(e) => setDate(e.target.value)}
//                       required
//                     />
//                   </div>
//                   <div className="form-group">
//                     <label>Time</label>
//                     <input
//                       type="time"
//                       className="form-input"
//                       value={time}
//                       onChange={(e) => setTime(e.target.value)}
//                     />
//                   </div>
//                   <div className="form-group">
//                     <label>Venue</label>
//                     <input
//                       type="text"
//                       className="form-input"
//                       placeholder="Venue"
//                       value={venue}
//                       onChange={(e) => setVenue(e.target.value)}
//                     />
//                   </div>
//                   <div className="form-group">
//                     <label>Description</label>
//                     <input
//                       type="text"
//                       className="form-input"
//                       placeholder="Description"
//                       value={description}
//                       onChange={(e) => setDescription(e.target.value)}
//                     />
//                   </div>
//                   <div className="form-group">
//                     <label>Entry Fee</label>
//                     <input
//                       type="number"
//                       className="form-input"
//                       placeholder="Entry Fee"
//                       value={entryFee}
//                       onChange={(e) => setEntryFee(e.target.value)}
//                     />
//                   </div>
//                   <div className="form-group">
//                     <label>Prize Pool</label>
//                     <input
//                       type="text"
//                       className="form-input"
//                       placeholder="Prize Pool"
//                       value={prizePool}
//                       onChange={(e) => setPrizePool(e.target.value)}
//                     />
//                   </div>
//                   <div className="form-group">
//                     <label>Image URL</label>
//                     <input
//                       type="text"
//                       className="form-input"
//                       placeholder="Image URL"
//                       value={imageUrl}
//                       onChange={(e) => setImageUrl(e.target.value)}
//                     />
//                   </div>
//                 </div>
//                 <button type="submit" className="form-submit">
//                   Add Event
//                 </button>
//               </form>

//               <div className="items-list">
//                 {events.map((event) => (
//                   <div key={event.id} className="item-card event-card">
//                     <h4 className="item-title">{event.title}</h4>
//                     <p className="item-details">
//                       {event.date} {event.time} at {event.venue}
//                       {event.description && (
//                         <>
//                           <br />
//                           {event.description}
//                         </>
//                       )}
//                     </p>
//                     <button
//                       className="delete-btn"
//                       onClick={() => deleteEvent(event.id)}
//                     >
//                       Delete
//                     </button>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>

//           {/* Announcements Section */}
//           <div className="section">
//             <div
//               className="collapsible-header"
//               onClick={() => toggleSection("announcements")}
//             >
//               <h3>Manage Announcements ({announcements.length})</h3>
//               <span
//                 className={`toggle-icon ${
//                   expandedSections.announcements ? "expanded" : ""
//                 }`}
//               >
//                 ▼
//               </span>
//             </div>
//             <div
//               className={`collapsible-content ${
//                 expandedSections.announcements ? "expanded" : ""
//               }`}
//             >
//               <form onSubmit={addAnnouncement}>
//                 <div className="form-grid">
//                   <div className="form-group">
//                     <label>Title</label>
//                     <input
//                       type="text"
//                       className="form-input"
//                       placeholder="Title"
//                       value={annTitle}
//                       onChange={(e) => setAnnTitle(e.target.value)}
//                       required
//                     />
//                   </div>
//                   <div className="form-group">
//                     <label>Message</label>
//                     <input
//                       type="text"
//                       className="form-input"
//                       placeholder="Message"
//                       value={message}
//                       onChange={(e) => setMessage(e.target.value)}
//                       required
//                     />
//                   </div>
//                   <div className="form-group">
//                     <label>Image URL</label>
//                     <input
//                       type="text"
//                       className="form-input"
//                       placeholder="Image URL"
//                       value={annImageUrl}
//                       onChange={(e) => setAnnImageUrl(e.target.value)}
//                     />
//                   </div>
//                   <div className="form-group">
//                     <label>Link</label>
//                     <input
//                       type="text"
//                       className="form-input"
//                       placeholder="Link"
//                       value={link}
//                       onChange={(e) => setLink(e.target.value)}
//                     />
//                   </div>
//                 </div>
//                 <button type="submit" className="form-submit">
//                   Add Announcement
//                 </button>
//               </form>

//               <div className="items-list">
//                 {announcements.map((a) => (
//                   <div key={a.id} className="item-card announcement-card">
//                     <h4 className="item-title">{a.title}</h4>
//                     <p className="item-details">{a.message}</p>
//                     <button
//                       className="delete-btn"
//                       onClick={() => deleteAnnouncement(a.id)}
//                     >
//                       Delete
//                     </button>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>

//           {/* Members Section */}
//           <div className="section">
//             <div
//               className="collapsible-header"
//               onClick={() => toggleSection("members")}
//             >
//               <h3>Club Members ({members.length})</h3>
//               <span
//                 className={`toggle-icon ${
//                   expandedSections.members ? "expanded" : ""
//                 }`}
//               >
//                 ▼
//               </span>
//             </div>
//             <div
//               className={`collapsible-content ${
//                 expandedSections.members ? "expanded" : ""
//               }`}
//             >
//               <div className="items-list">
//                 {members.map((m) => (
//                   <div key={m.id} className="item-card member-card">
//                     <h4 className="item-title">{m.email}</h4>
//                     <p className="item-details">
//                       Joined: {new Date(m.joined_at).toLocaleDateString()}
//                     </p>
//                     <button
//                       className="delete-btn"
//                       onClick={() => removeMember(m.id, m.email)}
//                     >
//                       Remove
//                     </button>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </>
//       )}
//     </div>
//   );
// }











// import React, { useEffect, useState } from "react";
// import { supabase } from "../supabaseClient";
// import { useNavigate } from "react-router-dom";
// import "./AdminDashboard.css";

// export default function AdminDashboard() {
//   const [user, setUser] = useState(null);
//   const [club, setClub] = useState(null);
//   const [events, setEvents] = useState([]);
//   const [announcements, setAnnouncements] = useState([]);
//   const [members, setMembers] = useState([]);
//   const [expandedSections, setExpandedSections] = useState({
//     club: true,
//     events: true,
//     announcements: true,
//     members: true,
//   });
//   const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

//   // Club form state
//   const [clubName, setClubName] = useState("");
//   const [clubDescription, setClubDescription] = useState("");
//   const [clubLogo, setClubLogo] = useState("");

//   // Event form state
//   const [title, setTitle] = useState("");
//   const [date, setDate] = useState("");
//   const [time, setTime] = useState("");
//   const [venue, setVenue] = useState("");
//   const [description, setDescription] = useState("");
//   const [entryFee, setEntryFee] = useState("");
//   const [prizePool, setPrizePool] = useState("");
//   const [imageUrl, setImageUrl] = useState("");

//   // Announcement form state
//   const [annTitle, setAnnTitle] = useState("");
//   const [message, setMessage] = useState("");
//   const [annImageUrl, setAnnImageUrl] = useState("");
//   const [link, setLink] = useState("");

//   const navigate = useNavigate();

//   useEffect(() => {
//     const init = async () => {
//       const {
//         data: { user },
//       } = await supabase.auth.getUser();
//       if (!user) navigate("/login");
//       setUser(user);

//       // Fetch club
//       let { data: clubData } = await supabase
//         .from("clubs")
//         .select("*")
//         .eq("admin_user_id", user.id)
//         .single();

//       setClub(clubData);

//       if (clubData) {
//         setClubName(clubData.name);
//         setClubDescription(clubData.description);
//         setClubLogo(clubData.logo_url);

//         fetchEvents(clubData.id);
//         fetchAnnouncements(clubData.id);
//         fetchMembers(clubData.id);
//       }
//     };
//     init();

//     // Add back button event listener
//     const handleBackButton = (e) => {
//       e.preventDefault();
//       setShowLogoutConfirm(true);
//       return false;
//     };

//     window.history.pushState(null, null, window.location.pathname);
//     window.addEventListener('popstate', handleBackButton);

//     return () => {
//       window.removeEventListener('popstate', handleBackButton);
//     };
//   }, [navigate]);

//   const fetchEvents = async (clubId) => {
//     let { data } = await supabase
//       .from("events")
//       .select("*")
//       .eq("club_id", clubId)
//       .order("created_at", { ascending: false });
//     setEvents(data || []);
//   };

//   const fetchAnnouncements = async (clubId) => {
//     let { data } = await supabase
//       .from("announcements")
//       .select("*")
//       .eq("club_id", clubId)
//       .order("created_at", { ascending: false });
//     setAnnouncements(data || []);
//   };

//   const fetchMembers = async (clubId) => {
//     let { data: memberships } = await supabase
//       .from("memberships")
//       .select("id, joined_at, user_id")
//       .eq("club_id", clubId);

//     if (!memberships) return;

//     // fetch user emails from auth.users
//     const memberList = await Promise.all(
//       memberships.map(async (m) => {
//         const { data: userData, error } = await supabase.auth.admin.getUserById(
//           m.user_id
//         );
//         return {
//           ...m,
//           email: userData?.user?.email || "Unknown",
//         };
//       })
//     );

//     setMembers(memberList);
//   };

//   // Logout
//   const handleLogout = async () => {
//     await supabase.auth.signOut();
//     navigate("/login");
//   };

//   // Confirm logout
//   const confirmLogout = () => {
//     setShowLogoutConfirm(true);
//   };

//   // Toggle section expansion
//   const toggleSection = (section) => {
//     setExpandedSections((prev) => ({
//       ...prev,
//       [section]: !prev[section],
//     }));
//   };

//   // Save or update club profile
//   const saveClub = async (e) => {
//     e.preventDefault();
//     if (club) {
//       await supabase
//         .from("clubs")
//         .update({
//           name: clubName,
//           description: clubDescription,
//           logo_url: clubLogo,
//         })
//         .eq("id", club.id);
//       alert("Club updated successfully!");
//     } else {
//       const { data } = await supabase
//         .from("clubs")
//         .insert([
//           {
//             name: clubName,
//             description: clubDescription,
//             logo_url: clubLogo,
//             admin_user_id: user.id,
//           },
//         ])
//         .select()
//         .single();
//       setClub(data);
//       alert("Club created successfully!");
//     }
//   };

//   // Add new event
//   const addEvent = async (e) => {
//     e.preventDefault();
//     await supabase.from("events").insert([
//       {
//         title,
//         date,
//         time,
//         venue,
//         description,
//         entry_fee: entryFee,
//         prize_pool: prizePool,
//         image_url: imageUrl,
//         club_id: club.id,
//       },
//     ]);
//     fetchEvents(club.id);
//     setTitle("");
//     setDate("");
//     setTime("");
//     setVenue("");
//     setDescription("");
//     setEntryFee("");
//     setPrizePool("");
//     setImageUrl("");
//     alert("Event added successfully!");
//   };

//   const deleteEvent = async (id) => {
//     if (window.confirm("Are you sure you want to delete this event?")) {
//       await supabase.from("events").delete().eq("id", id);
//       fetchEvents(club.id);
//       alert("Event deleted successfully!");
//     }
//   };

//   // Add announcement
//   const addAnnouncement = async (e) => {
//     e.preventDefault();
//     await supabase.from("announcements").insert([
//       {
//         title: annTitle,
//         message,
//         image_url: annImageUrl,
//         link,
//         club_id: club.id,
//       },
//     ]);
//     fetchAnnouncements(club.id);
//     setAnnTitle("");
//     setMessage("");
//     setAnnImageUrl("");
//     setLink("");
//     alert("Announcement added successfully!");
//   };

//   const deleteAnnouncement = async (id) => {
//     if (window.confirm("Are you sure you want to delete this announcement?")) {
//       await supabase.from("announcements").delete().eq("id", id);
//       fetchAnnouncements(club.id);
//       alert("Announcement deleted successfully!");
//     }
//   };

//   // Remove member
//   const removeMember = async (membershipId, email) => {
//     if (
//       window.confirm(`Are you sure you want to remove ${email} from the club?`)
//     ) {
//       await supabase.from("memberships").delete().eq("id", membershipId);
//       fetchMembers(club.id);
//       alert("Member removed successfully!");
//     }
//   };

//   return (
//     <div className="admin-dashboard">
//       {/* Logout Confirmation Modal */}
//       {showLogoutConfirm && (
//         <div className="modal-overlay">
//           <div className="modal-content">
//             <h3>Confirm Logout</h3>
//             <p>Are you sure you want to log out?</p>
//             <div className="modal-buttons">
//               <button 
//                 className="modal-button cancel"
//                 onClick={() => setShowLogoutConfirm(false)}
//               >
//                 Cancel
//               </button>
//               <button 
//                 className="modal-button confirm"
//                 onClick={handleLogout}
//               >
//                 Log Out
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       <div className="dashboard-header">
//         <h2>Club Admin Dashboard</h2>
//         <button className="logout-btn" onClick={confirmLogout}>
//           Logout
//         </button>
//       </div>

//       <p className="welcome-text">Welcome, {user?.email}</p>

//       {club && (
//         <div className="stats-grid">
//           <div className="stat-card">
//             <p className="stat-value">{events.length}</p>
//             <p className="stat-label">Events</p>
//           </div>
//           <div className="stat-card">
//             <p className="stat-value">{announcements.length}</p>
//             <p className="stat-label">Announcements</p>
//           </div>
//           <div className="stat-card">
//             <p className="stat-value">{members.length}</p>
//             <p className="stat-label">Members</p>
//           </div>
//         </div>
//       )}

//       {/* Club Profile */}
//       <div className="section">
//         <div
//           className="collapsible-header"
//           onClick={() => toggleSection("club")}
//         >
//           <h3>Club Profile</h3>
//           <span
//             className={`toggle-icon ${expandedSections.club ? "expanded" : ""}`}
//           >
//             ▼
//           </span>
//         </div>
//         <div
//           className={`collapsible-content ${
//             expandedSections.club ? "expanded" : ""
//           }`}
//         >
//           <form onSubmit={saveClub}>
//             <div className="form-grid">
//               <div className="form-group">
//                 <label>Club Name</label>
//                 <input
//                   type="text"
//                   className="form-input"
//                   placeholder="Club Name"
//                   value={clubName}
//                   onChange={(e) => setClubName(e.target.value)}
//                   required
//                 />
//               </div>
//               <div className="form-group">
//                 <label>Description</label>
//                 <input
//                   type="text"
//                   className="form-input"
//                   placeholder="Description"
//                   value={clubDescription}
//                   onChange={(e) => setClubDescription(e.target.value)}
//                 />
//               </div>
//               <div className="form-group">
//                 <label>Logo URL</label>
//                 <input
//                   type="text"
//                   className="form-input"
//                   placeholder="Logo URL"
//                   value={clubLogo}
//                   onChange={(e) => setClubLogo(e.target.value)}
//                 />
//               </div>
//             </div>
//             <button type="submit" className="form-submit">
//               {club ? "Update Club" : "Create Club"}
//             </button>
//           </form>
//         </div>
//       </div>

//       {club && (
//         <>
//           {/* Events Section */}
//           <div className="section">
//             <div
//               className="collapsible-header"
//               onClick={() => toggleSection("events")}
//             >
//               <h3>Manage Events ({events.length})</h3>
//               <span
//                 className={`toggle-icon ${
//                   expandedSections.events ? "expanded" : ""
//                 }`}
//               >
//                 ▼
//               </span>
//             </div>
//             <div
//               className={`collapsible-content ${
//                 expandedSections.events ? "expanded" : ""
//               }`}
//             >
//               <form onSubmit={addEvent}>
//                 <div className="form-grid">
//                   <div className="form-group">
//                     <label>Title</label>
//                     <input
//                       type="text"
//                       className="form-input"
//                       placeholder="Title"
//                       value={title}
//                       onChange={(e) => setTitle(e.target.value)}
//                       required
//                     />
//                   </div>
//                   <div className="form-group">
//                     <label>Date</label>
//                     <input
//                       type="date"
//                       className="form-input"
//                       value={date}
//                       onChange={(e) => setDate(e.target.value)}
//                       required
//                     />
//                   </div>
//                   <div className="form-group">
//                     <label>Time</label>
//                     <input
//                       type="time"
//                       className="form-input"
//                       value={time}
//                       onChange={(e) => setTime(e.target.value)}
//                     />
//                   </div>
//                   <div className="form-group">
//                     <label>Venue</label>
//                     <input
//                       type="text"
//                       className="form-input"
//                       placeholder="Venue"
//                       value={venue}
//                       onChange={(e) => setVenue(e.target.value)}
//                     />
//                   </div>
//                   <div className="form-group">
//                     <label>Description</label>
//                     <input
//                       type="text"
//                       className="form-input"
//                       placeholder="Description"
//                       value={description}
//                       onChange={(e) => setDescription(e.target.value)}
//                     />
//                   </div>
//                   <div className="form-group">
//                     <label>Entry Fee</label>
//                     <input
//                       type="number"
//                       className="form-input"
//                       placeholder="Entry Fee"
//                       value={entryFee}
//                       onChange={(e) => setEntryFee(e.target.value)}
//                     />
//                   </div>
//                   <div className="form-group">
//                     <label>Prize Pool</label>
//                     <input
//                       type="text"
//                       className="form-input"
//                       placeholder="Prize Pool"
//                       value={prizePool}
//                       onChange={(e) => setPrizePool(e.target.value)}
//                     />
//                   </div>
//                   <div className="form-group">
//                     <label>Image URL</label>
//                     <input
//                       type="text"
//                       className="form-input"
//                       placeholder="Image URL"
//                       value={imageUrl}
//                       onChange={(e) => setImageUrl(e.target.value)}
//                     />
//                   </div>
//                 </div>
//                 <button type="submit" className="form-submit">
//                   Add Event
//                 </button>
//               </form>

//               <div className="items-list">
//                 {events.map((event) => (
//                   <div key={event.id} className="item-card event-card">
//                     <h4 className="item-title">{event.title}</h4>
//                     <p className="item-details">
//                       {event.date} {event.time} at {event.venue}
//                       {event.description && (
//                         <>
//                           <br />
//                           {event.description}
//                         </>
//                       )}
//                     </p>
//                     <button
//                       className="delete-btn"
//                       onClick={() => deleteEvent(event.id)}
//                     >
//                       Delete
//                     </button>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>

//           {/* Announcements Section */}
//           <div className="section">
//             <div
//               className="collapsible-header"
//               onClick={() => toggleSection("announcements")}
//             >
//               <h3>Manage Announcements ({announcements.length})</h3>
//               <span
//                 className={`toggle-icon ${
//                   expandedSections.announcements ? "expanded" : ""
//                 }`}
//               >
//                 ▼
//               </span>
//             </div>
//             <div
//               className={`collapsible-content ${
//                 expandedSections.announcements ? "expanded" : ""
//               }`}
//             >
//               <form onSubmit={addAnnouncement}>
//                 <div className="form-grid">
//                   <div className="form-group">
//                     <label>Title</label>
//                     <input
//                       type="text"
//                       className="form-input"
//                       placeholder="Title"
//                       value={annTitle}
//                       onChange={(e) => setAnnTitle(e.target.value)}
//                       required
//                     />
//                   </div>
//                   <div className="form-group">
//                     <label>Message</label>
//                     <input
//                       type="text"
//                       className="form-input"
//                       placeholder="Message"
//                       value={message}
//                       onChange={(e) => setMessage(e.target.value)}
//                       required
//                     />
//                   </div>
//                   <div className="form-group">
//                     <label>Image URL</label>
//                     <input
//                       type="text"
//                       className="form-input"
//                       placeholder="Image URL"
//                       value={annImageUrl}
//                       onChange={(e) => setAnnImageUrl(e.target.value)}
//                     />
//                   </div>
//                   <div className="form-group">
//                     <label>Link</label>
//                     <input
//                       type="text"
//                       className="form-input"
//                       placeholder="Link"
//                       value={link}
//                       onChange={(e) => setLink(e.target.value)}
//                     />
//                   </div>
//                 </div>
//                 <button type="submit" className="form-submit">
//                   Add Announcement
//                 </button>
//               </form>

//               <div className="items-list">
//                 {announcements.map((a) => (
//                   <div key={a.id} className="item-card announcement-card">
//                     <h4 className="item-title">{a.title}</h4>
//                     <p className="item-details">{a.message}</p>
//                     <button
//                       className="delete-btn"
//                       onClick={() => deleteAnnouncement(a.id)}
//                     >
//                       Delete
//                     </button>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>

//           {/* Members Section */}
//           <div className="section">
//             <div
//               className="collapsible-header"
//               onClick={() => toggleSection("members")}
//             >
//               <h3>Club Members ({members.length})</h3>
//               <span
//                 className={`toggle-icon ${
//                   expandedSections.members ? "expanded" : ""
//                 }`}
//               >
//                 ▼
//               </span>
//             </div>
//             <div
//               className={`collapsible-content ${
//                 expandedSections.members ? "expanded" : ""
//               }`}
//             >
//               <div className="items-list">
//                 {members.map((m) => (
//                   <div key={m.id} className="item-card member-card">
//                     <h4 className="item-title">{m.email}</h4>
//                     <p className="item-details">
//                       Joined: {new Date(m.joined_at).toLocaleDateString()}
//                     </p>
//                     <button
//                       className="delete-btn"
//                       onClick={() => removeMember(m.id, m.email)}
//                     >
//                       Remove
//                     </button>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </>
//       )}
//     </div>
//   );
// }









import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

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

// Custom hook for club data
function useClubData(user) {
  const [club, setClub] = useState(null);
  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchClubData = async () => {
      try {
        // Fetch club
        let { data: clubData } = await supabase
          .from("clubs")
          .select("*")
          .eq("admin_user_id", user.id)
          .single();

        setClub(clubData);

        if (clubData) {
          // Fetch events, announcements, and members in parallel
          await Promise.all([
            fetchEvents(clubData.id),
            fetchAnnouncements(clubData.id),
            fetchMembers(clubData.id)
          ]);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching club data:", error);
        setLoading(false);
      }
    };

    fetchClubData();
  }, [user]);

  const fetchEvents = async (clubId) => {
    let { data } = await supabase
      .from("events")
      .select("*")
      .eq("club_id", clubId)
      .order("created_at", { ascending: false });
    setEvents(data || []);
  };

  const fetchAnnouncements = async (clubId) => {
    let { data } = await supabase
      .from("announcements")
      .select("*")
      .eq("club_id", clubId)
      .order("created_at", { ascending: false });
    setAnnouncements(data || []);
  };

  const fetchMembers = async (clubId) => {
    let { data: memberships } = await supabase
      .from("memberships")
      .select("id, joined_at, user_id")
      .eq("club_id", clubId);

    if (!memberships) return;

    // fetch user emails from auth.users
    const memberList = await Promise.all(
      memberships.map(async (m) => {
        const { data: userData } = await supabase.auth.admin.getUserById(m.user_id);
        return {
          ...m,
          email: userData?.user?.email || "Unknown",
        };
      })
    );

    setMembers(memberList);
  };

  return {
    club,
    events,
    announcements,
    members,
    loading,
    fetchEvents,
    fetchAnnouncements,
    fetchMembers
  };
}

// Section Component
function Section({ title, count, expanded, onToggle, children }) {
  return (
    <div className="section">
      <div className="collapsible-header" onClick={onToggle}>
        <h3>{title}{count !== undefined && ` (${count})`}</h3>
        <span className={`toggle-icon ${expanded ? "expanded" : ""}`}>▼</span>
      </div>
      <div className={`collapsible-content ${expanded ? "expanded" : ""}`}>
        {children}
      </div>
    </div>
  );
}

// Logout Confirmation Modal
function LogoutModal({ show, onCancel, onConfirm }) {
  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Confirm Logout</h3>
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
  );
}

// Club Profile Form
function ClubForm({ club, onSubmit, formData, onFormChange }) {
  return (
    <form onSubmit={onSubmit}>
      <div className="form-grid">
        <div className="form-group">
          <label>Club Name</label>
          <input
            type="text"
            className="form-input"
            placeholder="Club Name"
            value={formData.name}
            onChange={(e) => onFormChange('name', e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea
            className="form-input"
            placeholder="Description"
            value={formData.description}
            onChange={(e) => onFormChange('description', e.target.value)}
            rows="3"
          />
        </div>
        <div className="form-group">
          <label>Logo URL</label>
          <input
            type="text"
            className="form-input"
            placeholder="Logo URL"
            value={formData.logo_url}
            onChange={(e) => onFormChange('logo_url', e.target.value)}
          />
        </div>
      </div>
      <button type="submit" className="form-submit">
        {club ? "Update Club" : "Create Club"}
      </button>
    </form>
  );
}

// Event Form
function EventForm({ onSubmit, formData, onFormChange }) {
  return (
    <form onSubmit={onSubmit}>
      <div className="form-grid">
        <div className="form-group">
          <label>Title</label>
          <input
            type="text"
            className="form-input"
            placeholder="Title"
            value={formData.title}
            onChange={(e) => onFormChange('title', e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Date</label>
          <input
            type="date"
            className="form-input"
            value={formData.date}
            onChange={(e) => onFormChange('date', e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Time</label>
          <input
            type="time"
            className="form-input"
            value={formData.time}
            onChange={(e) => onFormChange('time', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Venue</label>
          <input
            type="text"
            className="form-input"
            placeholder="Venue"
            value={formData.venue}
            onChange={(e) => onFormChange('venue', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea
            className="form-input"
            placeholder="Description"
            value={formData.description}
            onChange={(e) => onFormChange('description', e.target.value)}
            rows="3"
          />
        </div>
        <div className="form-group">
          <label>Entry Fee</label>
          <input
            type="number"
            className="form-input"
            placeholder="Entry Fee"
            value={formData.entry_fee}
            onChange={(e) => onFormChange('entry_fee', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Prize Pool</label>
          <input
            type="text"
            className="form-input"
            placeholder="Prize Pool"
            value={formData.prize_pool}
            onChange={(e) => onFormChange('prize_pool', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Image URL</label>
          <input
            type="text"
            className="form-input"
            placeholder="Image URL"
            value={formData.image_url}
            onChange={(e) => onFormChange('image_url', e.target.value)}
          />
        </div>
      </div>
      <button type="submit" className="form-submit">
        Add Event
      </button>
    </form>
  );
}

// Announcement Form
function AnnouncementForm({ onSubmit, formData, onFormChange }) {
  return (
    <form onSubmit={onSubmit}>
      <div className="form-grid">
        <div className="form-group">
          <label>Title</label>
          <input
            type="text"
            className="form-input"
            placeholder="Title"
            value={formData.title}
            onChange={(e) => onFormChange('title', e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Message</label>
          <textarea
            className="form-input"
            placeholder="Message"
            value={formData.message}
            onChange={(e) => onFormChange('message', e.target.value)}
            rows="3"
            required
          />
        </div>
        <div className="form-group">
          <label>Image URL</label>
          <input
            type="text"
            className="form-input"
            placeholder="Image URL"
            value={formData.image_url}
            onChange={(e) => onFormChange('image_url', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Link</label>
          <input
            type="text"
            className="form-input"
            placeholder="Link"
            value={formData.link}
            onChange={(e) => onFormChange('link', e.target.value)}
          />
        </div>
      </div>
      <button type="submit" className="form-submit">
        Add Announcement
      </button>
    </form>
  );
}

// Main AdminDashboard Component
export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const {
    club,
    events,
    announcements,
    members,
    loading: dataLoading,
    fetchEvents,
    fetchAnnouncements,
    fetchMembers
  } = useClubData(user);
  
  const [expandedSections, setExpandedSections] = useState({
    club: true,
    events: true,
    announcements: true,
    members: true,
  });
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Club form state
  const [clubForm, setClubForm] = useState({
    name: "",
    description: "",
    logo_url: ""
  });

  // Event form state
  const [eventForm, setEventForm] = useState({
    title: "",
    date: "",
    time: "",
    venue: "",
    description: "",
    entry_fee: "",
    prize_pool: "",
    image_url: ""
  });

  // Announcement form state
  const [announcementForm, setAnnouncementForm] = useState({
    title: "",
    message: "",
    image_url: "",
    link: ""
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
      return;
    }

    if (club) {
      setClubForm({
        name: club.name || "",
        description: club.description || "",
        logo_url: club.logo_url || ""
      });
    }

    // Handle back button
    const handleBackButton = (e) => {
      e.preventDefault();
      setShowLogoutConfirm(true);
      
      // Push state again to keep user on the same page
      window.history.pushState(null, null, window.location.pathname);
    };

    window.history.pushState(null, null, window.location.pathname);
    window.addEventListener('popstate', handleBackButton);

    return () => {
      window.removeEventListener('popstate', handleBackButton);
    };
  }, [user, authLoading, club, navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const updateFormData = (setter) => (field, value) => {
    setter(prev => ({ ...prev, [field]: value }));
  };

  // Save or update club profile
  const saveClub = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (club) {
        await supabase
          .from("clubs")
          .update({
            name: clubForm.name,
            description: clubForm.description,
            logo_url: clubForm.logo_url,
          })
          .eq("id", club.id);
        alert("Club updated successfully!");
      } else {
        const { data } = await supabase
          .from("clubs")
          .insert([
            {
              name: clubForm.name,
              description: clubForm.description,
              logo_url: clubForm.logo_url,
              admin_user_id: user.id,
            },
          ])
          .select()
          .single();
        alert("Club created successfully!");
        window.location.reload(); // Reload to fetch new club data
      }
    } catch (error) {
      console.error("Error saving club:", error);
      alert("Error saving club. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add new event
  const addEvent = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await supabase.from("events").insert([
        {
          title: eventForm.title,
          date: eventForm.date,
          time: eventForm.time,
          venue: eventForm.venue,
          description: eventForm.description,
          entry_fee: eventForm.entry_fee,
          prize_pool: eventForm.prize_pool,
          image_url: eventForm.image_url,
          club_id: club.id,
        },
      ]);
      
      // Reset form
      setEventForm({
        title: "",
        date: "",
        time: "",
        venue: "",
        description: "",
        entry_fee: "",
        prize_pool: "",
        image_url: ""
      });
      
      // Refresh events
      fetchEvents(club.id);
      alert("Event added successfully!");
    } catch (error) {
      console.error("Error adding event:", error);
      alert("Error adding event. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteEvent = async (id) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        await supabase.from("events").delete().eq("id", id);
        fetchEvents(club.id);
        alert("Event deleted successfully!");
      } catch (error) {
        console.error("Error deleting event:", error);
        alert("Error deleting event. Please try again.");
      }
    }
  };

  // Add announcement
  const addAnnouncement = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await supabase.from("announcements").insert([
        {
          title: announcementForm.title,
          message: announcementForm.message,
          image_url: announcementForm.image_url,
          link: announcementForm.link,
          club_id: club.id,
        },
      ]);
      
      // Reset form
      setAnnouncementForm({
        title: "",
        message: "",
        image_url: "",
        link: ""
      });
      
      // Refresh announcements
      fetchAnnouncements(club.id);
      alert("Announcement added successfully!");
    } catch (error) {
      console.error("Error adding announcement:", error);
      alert("Error adding announcement. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteAnnouncement = async (id) => {
    if (window.confirm("Are you sure you want to delete this announcement?")) {
      try {
        await supabase.from("announcements").delete().eq("id", id);
        fetchAnnouncements(club.id);
        alert("Announcement deleted successfully!");
      } catch (error) {
        console.error("Error deleting announcement:", error);
        alert("Error deleting announcement. Please try again.");
      }
    }
  };

  // Remove member
  const removeMember = async (membershipId, email) => {
    if (window.confirm(`Are you sure you want to remove ${email} from the club?`)) {
      try {
        await supabase.from("memberships").delete().eq("id", membershipId);
        fetchMembers(club.id);
        alert("Member removed successfully!");
      } catch (error) {
        console.error("Error removing member:", error);
        alert("Error removing member. Please try again.");
      }
    }
  };

  if (authLoading || dataLoading) {
    return (
      <div className="admin-dashboard loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <LogoutModal
        show={showLogoutConfirm}
        onCancel={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
      />

      <div className="dashboard-header">
        <h2>Club Admin Dashboard</h2>
        <button className="logout-btn" onClick={() => setShowLogoutConfirm(true)}>
          Logout
        </button>
      </div>

      <p className="welcome-text">Welcome, {user?.email}</p>

      {club && (
        <div className="stats-grid">
          <div className="stat-card">
            <p className="stat-value">{events.length}</p>
            <p className="stat-label">Events</p>
          </div>
          <div className="stat-card">
            <p className="stat-value">{announcements.length}</p>
            <p className="stat-label">Announcements</p>
          </div>
          <div className="stat-card">
            <p className="stat-value">{members.length}</p>
            <p className="stat-label">Members</p>
          </div>
        </div>
      )}

      {/* Club Profile */}
      <Section
        title="Club Profile"
        expanded={expandedSections.club}
        onToggle={() => toggleSection("club")}
      >
        <ClubForm
          club={club}
          onSubmit={saveClub}
          formData={clubForm}
          onFormChange={updateFormData(setClubForm)}
        />
      </Section>

      {club && (
        <>
          {/* Events Section */}
          <Section
            title="Manage Events"
            count={events.length}
            expanded={expandedSections.events}
            onToggle={() => toggleSection("events")}
          >
            <EventForm
              onSubmit={addEvent}
              formData={eventForm}
              onFormChange={updateFormData(setEventForm)}
            />

            <div className="items-list">
              {events.map((event) => (
                <div key={event.id} className="item-card event-card">
                  <h4 className="item-title">{event.title}</h4>
                  <p className="item-details">
                    {event.date} {event.time} at {event.venue}
                    {event.description && (
                      <>
                        <br />
                        {event.description}
                      </>
                    )}
                  </p>
                  <button
                    className="delete-btn"
                    onClick={() => deleteEvent(event.id)}
                    disabled={isSubmitting}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </Section>

          {/* Announcements Section */}
          <Section
            title="Manage Announcements"
            count={announcements.length}
            expanded={expandedSections.announcements}
            onToggle={() => toggleSection("announcements")}
          >
            <AnnouncementForm
              onSubmit={addAnnouncement}
              formData={announcementForm}
              onFormChange={updateFormData(setAnnouncementForm)}
            />

            <div className="items-list">
              {announcements.map((a) => (
                <div key={a.id} className="item-card announcement-card">
                  <h4 className="item-title">{a.title}</h4>
                  <p className="item-details">{a.message}</p>
                  <button
                    className="delete-btn"
                    onClick={() => deleteAnnouncement(a.id)}
                    disabled={isSubmitting}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </Section>

          {/* Members Section */}
          <Section
            title="Club Members"
            count={members.length}
            expanded={expandedSections.members}
            onToggle={() => toggleSection("members")}
          >
            <div className="items-list">
              {members.map((m) => (
                <div key={m.id} className="item-card member-card">
                  <h4 className="item-title">{m.email}</h4>
                  <p className="item-details">
                    Joined: {new Date(m.joined_at).toLocaleDateString()}
                  </p>
                  <button
                    className="delete-btn"
                    onClick={() => removeMember(m.id, m.email)}
                    disabled={isSubmitting}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </Section>
        </>
      )}
    </div>
  );
}