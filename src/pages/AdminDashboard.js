


import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { format } from 'date-fns';
import "./AdminDashboard.css";

// Header Component
const DashboardHeader = ({ clubInfo, activeTab, setActiveTab, handleLogout, onProfileClick }) => {
  return (
    <div className="dashboard-header">
      <div className="header-content">
        <div className="header-left">
          <div className="logo">
            <h1>CLUBHUB</h1>
            <span>Admin Dashboard</span>
          </div>
          <nav className="tabs">
            {["events", "announcements", "members"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`tab-btn ${activeTab === tab ? "active" : ""}`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>
        <div className="header-right">
          <div className="club-profile" onClick={onProfileClick}>
            {clubInfo?.logo_url && (
              <img src={clubInfo.logo_url} alt={clubInfo.name} className="club-logo" />
            )}
            <span className="club-name">{clubInfo?.name || "Create Club"}</span>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

// Club Creation/Management Modal
const ClubModal = ({ clubInfo, editingClub, setEditingClub, handleCreateClub, handleUpdateClub, handleDeleteClub, onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{clubInfo ? "Edit Club" : "Create Club"}</h2>
          <button onClick={onClose} className="close-btn">×</button>
        </div>
        
        <div className="modal-body">
          <div className="form-group">
            <label>Club Name</label>
            <input
              type="text"
              value={editingClub.name || ""}
              onChange={(e) => setEditingClub({ ...editingClub, name: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Logo URL</label>
            <input
              type="text"
              value={editingClub.logo_url || ""}
              onChange={(e) => setEditingClub({ ...editingClub, logo_url: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={editingClub.description || ""}
              onChange={(e) => setEditingClub({ ...editingClub, description: e.target.value })}
              rows="3"
            />
          </div>
          
          <div className="modal-actions">
            {clubInfo && (
              <button onClick={handleDeleteClub} className="delete-btn">
                Delete Club
              </button>
            )}
            <div className="action-group">
              <button onClick={onClose} className="secondary-btn">
                Cancel
              </button>
              <button 
                onClick={clubInfo ? handleUpdateClub : handleCreateClub} 
                className="primary-btn"
              >
                {clubInfo ? "Update Club" : "Create Club"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Event Form Component
const EventForm = ({ event, onSubmit, onCancel, isEditing }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    venue: "",
    entry_fee: "",
    prize_pool: "",
    image_url: "",
    registration_link: ""
  });

  // Initialize form with event data when editing
  useEffect(() => {
    if (isEditing && event) {
      setFormData(event);
    }
  }, [isEditing, event]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="create-form">
      <h3>{isEditing ? "Edit Event" : "Create New Event"}</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <input
            type="text"
            name="title"
            placeholder="Title"
            value={formData.title}
            onChange={handleChange}
            required
          />
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
          />
          <input
            type="time"
            name="time"
            value={formData.time}
            onChange={handleChange}
          />
          <input
            type="text"
            name="venue"
            placeholder="Venue"
            value={formData.venue}
            onChange={handleChange}
          />
          <input
            type="number"
            name="entry_fee"
            placeholder="Entry Fee"
            value={formData.entry_fee}
            onChange={handleChange}
          />
          <input
            type="text"
            name="prize_pool"
            placeholder="Prize Pool"
            value={formData.prize_pool}
            onChange={handleChange}
          />
          <input
            type="text"
            name="image_url"
            placeholder="Image URL"
            value={formData.image_url}
            onChange={handleChange}
          />
          <input
            type="text"
            name="registration_link"
            placeholder="Registration Link"
            value={formData.registration_link}
            onChange={handleChange}
          />
        </div>
        <textarea
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
          rows="3"
          required
        />
        <div className="form-actions">
          <button type="submit" className="primary-btn">
            {isEditing ? "Update Event" : "Create Event"}
          </button>
          {isEditing && (
            <button type="button" onClick={onCancel} className="secondary-btn">
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

// Announcement Form Component
const AnnouncementForm = ({ announcement, onSubmit, onCancel, isEditing }) => {
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    image_url: "",
    link: ""
  });

  // Initialize form with announcement data when editing
  useEffect(() => {
    if (isEditing && announcement) {
      setFormData(announcement);
    }
  }, [isEditing, announcement]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="create-form">
      <h3>{isEditing ? "Edit Announcement" : "Create New Announcement"}</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <input
            type="text"
            name="title"
            placeholder="Title"
            value={formData.title}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="image_url"
            placeholder="Image URL"
            value={formData.image_url}
            onChange={handleChange}
          />
          <input
            type="text"
            name="link"
            placeholder="Link"
            value={formData.link}
            onChange={handleChange}
          />
        </div>
        <textarea
          name="message"
          placeholder="Message"
          value={formData.message}
          onChange={handleChange}
          rows="3"
          required
        />
        <div className="form-actions">
          <button type="submit" className="primary-btn">
            {isEditing ? "Update Announcement" : "Create Announcement"}
          </button>
          {isEditing && (
            <button type="button" onClick={onCancel} className="secondary-btn">
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

// Events Management Component
const EventsManagement = ({ events, handleCreateEvent, handleUpdateEvent, handleDeleteEvent }) => {
  const [editingEvent, setEditingEvent] = useState(null);

  const handleEditSubmit = (formData) => {
    handleUpdateEvent({ ...editingEvent, ...formData });
    setEditingEvent(null);
  };

  const handleCreateSubmit = (formData) => {
    handleCreateEvent(formData);
  };

  return (
    <div className="management-section">
      <h2>Events Management</h2>
      
      {editingEvent ? (
        <EventForm
          event={editingEvent}
          onSubmit={handleEditSubmit}
          onCancel={() => setEditingEvent(null)}
          isEditing={true}
        />
      ) : (
        <EventForm
          onSubmit={handleCreateSubmit}
          isEditing={false}
        />
      )}

      <div className="items-grid">
        <h3>Existing Events</h3>
        <div className="cards-container">
          {events.map((event) => (
            <div key={event.id} className="card">
              {event.image_url && (
                <div className="card-image">
                  <img src={event.image_url} alt={event.title} />
                </div>
              )}
              <div className="card-content">
                <div className="card-header">
                  <h4>{event.title}</h4>
                  <span className="date">{event.date} at {event.time}</span>
                </div>
                <p className="description">{event.description.substring(0, 100)}...</p>
                <div className="card-details">
                  <div className="detail">
                    <span className="label">Venue:</span>
                    <span className="value">{event.venue}</span>
                  </div>
                  <div className="detail">
                    <span className="label">Entry Fee:</span>
                    <span className="value">${event.entry_fee}</span>
                  </div>
                  <div className="detail">
                    <span className="label">Prize Pool:</span>
                    <span className="value">{event.prize_pool}</span>
                  </div>
                </div>
                <div className="card-actions">
                  <button 
                    onClick={() => setEditingEvent(event)}
                    className="edit-btn"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDeleteEvent(event.id)}
                    className="delete-btn"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Announcements Management Component
const AnnouncementsManagement = ({ announcements, handleCreateAnnouncement, handleUpdateAnnouncement, handleDeleteAnnouncement }) => {
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);

  const handleEditSubmit = (formData) => {
    handleUpdateAnnouncement({ ...editingAnnouncement, ...formData });
    setEditingAnnouncement(null);
  };

  const handleCreateSubmit = (formData) => {
    handleCreateAnnouncement(formData);
  };

  return (
    <div className="management-section">
      <h2>Announcements Management</h2>
      
      {editingAnnouncement ? (
        <AnnouncementForm
          announcement={editingAnnouncement}
          onSubmit={handleEditSubmit}
          onCancel={() => setEditingAnnouncement(null)}
          isEditing={true}
        />
      ) : (
        <AnnouncementForm
          onSubmit={handleCreateSubmit}
          isEditing={false}
        />
      )}

      <div className="items-grid">
        <h3>Existing Announcements</h3>
        <div className="cards-container">
          {announcements.map((announcement) => (
            <div key={announcement.id} className="card">
              {announcement.image_url && (
                <div className="card-image">
                  <img src={announcement.image_url} alt={announcement.title} />
                </div>
              )}
              <div className="card-content">
                <div className="card-header">
                  <h4>{announcement.title}</h4>
                  <span className="date">
                    {format(new Date(announcement.created_at), "PPpp")}
                  </span>
                </div>
                <p className="description">{announcement.message.substring(0, 150)}...</p>
                {announcement.link && (
                  <a href={announcement.link} target="_blank" rel="noopener noreferrer" className="announcement-link">
                    View More
                  </a>
                )}
                <div className="card-actions">
                  <button 
                    onClick={() => setEditingAnnouncement(announcement)}
                    className="edit-btn"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDeleteAnnouncement(announcement.id)}
                    className="delete-btn"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Members Management Component
const MembersManagement = ({ members, exportMembersToCSV }) => {
  return (
    <div className="management-section">
      <h2>Club Members</h2>
      
      <div className="section-header">
        <h3>Total Members: {members.length}</h3>
        <button onClick={exportMembersToCSV} className="primary-btn">
          Export to CSV
        </button>
      </div>

      <div className="table-container">
        <table className="members-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Joined At</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.id}>
                <td>
                  <div className="member-name">{member.profiles?.full_name || "N/A"}</div>
                </td>
                <td>{member.profiles?.email || "N/A"}</td>
                <td>{format(new Date(member.joined_at), "PPpp")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Main AdminDashboard Component
export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("events");
  const [user, setUser] = useState(null);
  const [clubId, setClubId] = useState(null);
  const [clubInfo, setClubInfo] = useState(null);
  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingClub, setEditingClub] = useState({
    name: "",
    logo_url: "",
    description: ""
  });
  const [showClubModal, setShowClubModal] = useState(false);

  // Get logged in user + their club
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        // Fetch the club for which this user is the admin
        const { data: clubData, error } = await supabase
          .from("clubs")
          .select("*")
          .eq("admin_user_id", user.id)
          .single();

        if (error) {
          console.error("Error fetching club ID:", error.message);
        } else if (clubData) {
          setClubId(clubData.id);
          setClubInfo(clubData);
          setEditingClub(clubData);
        }
      }
    };
    init();
  }, []);

  // Fetch data when tab changes or clubId is available
  useEffect(() => {
    if (clubId) {
      if (activeTab === "events") {
        fetchEvents();
      } else if (activeTab === "announcements") {
        fetchAnnouncements();
      } else if (activeTab === "members") {
        fetchMembers();
      }
    }
  }, [activeTab, clubId]);

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("club_id", clubId)
      .order("date", { ascending: true });

    if (error) console.error("Error fetching events:", error.message);
    else setEvents(data);
  };

  const fetchAnnouncements = async () => {
    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .eq("club_id", clubId)
      .order("created_at", { ascending: false });

    if (error) console.error("Error fetching announcements:", error.message);
    else setAnnouncements(data);
  };

  const fetchMembers = async () => {
    const { data, error } = await supabase
      .from("memberships")
      .select(`
        *,
        profiles (*)
      `)
      .eq("club_id", clubId);

    if (error) console.error("Error fetching members:", error.message);
    else setMembers(data);
  };

  // Event CRUD operations
  const handleCreateEvent = async (eventData) => {
    if (!user || !clubId) {
      alert("User or club not found.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("events").insert([
      {
        ...eventData,
        created_by: user.id,
        club_id: clubId,
      },
    ]);

    if (error) {
      console.error("Error saving event:", error.message);
      alert("Error saving event: " + error.message);
    } else {
      alert("✅ Event created successfully!");
      fetchEvents();
    }
    setLoading(false);
  };

  const handleUpdateEvent = async (eventData) => {
    setLoading(true);
    const { error } = await supabase
      .from("events")
      .update(eventData)
      .eq("id", eventData.id);

    if (error) {
      console.error("Error updating event:", error.message);
      alert("Error updating event: " + error.message);
    } else {
      alert("✅ Event updated successfully!");
      fetchEvents();
    }
    setLoading(false);
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;

    setLoading(true);
    const { error } = await supabase
      .from("events")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting event:", error.message);
      alert("Error deleting event: " + error.message);
    } else {
      alert("✅ Event deleted successfully!");
      fetchEvents();
    }
    setLoading(false);
  };

  // Announcement CRUD operations
  const handleCreateAnnouncement = async (announcementData) => {
    if (!user || !clubId) {
      alert("User or club not found.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("announcements").insert([
      {
        ...announcementData,
        created_by: user.id,
        club_id: clubId,
      },
    ]);

    if (error) {
      console.error("Error saving announcement:", error.message);
      alert("Error saving announcement: " + error.message);
    } else {
      alert("✅ Announcement created successfully!");
      fetchAnnouncements();
    }
    setLoading(false);
  };

  const handleUpdateAnnouncement = async (announcementData) => {
    setLoading(true);
    const { error } = await supabase
      .from("announcements")
      .update(announcementData)
      .eq("id", announcementData.id);

    if (error) {
      console.error("Error updating announcement:", error.message);
      alert("Error updating announcement: " + error.message);
    } else {
      alert("✅ Announcement updated successfully!");
      fetchAnnouncements();
    }
    setLoading(false);
  };

  const handleDeleteAnnouncement = async (id) => {
    if (!window.confirm("Are you sure you want to delete this announcement?")) return;

    setLoading(true);
    const { error } = await supabase
      .from("announcements")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting announcement:", error.message);
      alert("Error deleting announcement: " + error.message);
    } else {
      alert("✅ Announcement deleted successfully!");
      fetchAnnouncements();
    }
    setLoading(false);
  };

  // Club CRUD operations
  const handleCreateClub = async () => {
    if (!user) {
      alert("User not found.");
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from("clubs")
      .insert([{ ...editingClub, admin_user_id: user.id }])
      .select()
      .single();

    if (error) {
      console.error("Error creating club:", error.message);
      alert("Error creating club: " + error.message);
    } else {
      alert("✅ Club created successfully!");
      setClubInfo(data);
      setClubId(data.id);
      setShowClubModal(false);
    }
    setLoading(false);
  };

  const handleUpdateClub = async () => {
    if (!editingClub) return;

    setLoading(true);
    const { error } = await supabase
      .from("clubs")
      .update(editingClub)
      .eq("id", editingClub.id);

    if (error) {
      console.error("Error updating club:", error.message);
      alert("Error updating club: " + error.message);
    } else {
      alert("✅ Club updated successfully!");
      setClubInfo(editingClub);
      setShowClubModal(false);
    }
    setLoading(false);
  };

  const handleDeleteClub = async () => {
    if (!window.confirm("Are you sure you want to delete this club? All associated data will be lost.")) return;

    setLoading(true);
    // First delete all related data
    await supabase.from("events").delete().eq("club_id", clubId);
    await supabase.from("announcements").delete().eq("club_id", clubId);
    await supabase.from("memberships").delete().eq("club_id", clubId);
    
    // Then delete the club
    const { error } = await supabase
      .from("clubs")
      .delete()
      .eq("id", clubId);

    if (error) {
      console.error("Error deleting club:", error.message);
      alert("Error deleting club: " + error.message);
    } else {
      alert("✅ Club deleted successfully!");
      setClubInfo(null);
      setClubId(null);
      setEditingClub({
        name: "",
        logo_url: "",
        description: ""
      });
      setShowClubModal(false);
    }
    setLoading(false);
  };

  const exportMembersToCSV = () => {
    if (members.length === 0) {
      alert("No members to export.");
      return;
    }

    const csvContent = [
      ["Name", "Email", "Joined At"],
      ...members.map(member => [
        member.profiles?.full_name || "N/A",
        member.profiles?.email || "N/A",
        format(new Date(member.joined_at), "PPpp")
      ])
    ].map(e => e.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "club_members.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error logging out:', error.message);
    } else {
      window.location.href = '/';
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <DashboardHeader 
        clubInfo={clubInfo} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        handleLogout={handleLogout}
        onProfileClick={() => setShowClubModal(true)}
      />

      <div className="dashboard-content">
        {!clubId ? (
          <div className="no-club-message">
            <div className="message-content">
              <h2>Welcome to ClubHub Admin Dashboard</h2>
              <p>You don't have a club yet. Create your club to start managing events, announcements, and members.</p>
              <button 
                onClick={() => setShowClubModal(true)}
                className="primary-btn"
              >
                Create Your Club
              </button>
            </div>
          </div>
        ) : (
          <>
            {activeTab === "events" && (
              <EventsManagement
                events={events}
                handleCreateEvent={handleCreateEvent}
                handleUpdateEvent={handleUpdateEvent}
                handleDeleteEvent={handleDeleteEvent}
              />
            )}

            {activeTab === "announcements" && (
              <AnnouncementsManagement
                announcements={announcements}
                handleCreateAnnouncement={handleCreateAnnouncement}
                handleUpdateAnnouncement={handleUpdateAnnouncement}
                handleDeleteAnnouncement={handleDeleteAnnouncement}
              />
            )}

            {activeTab === "members" && (
              <MembersManagement
                members={members}
                exportMembersToCSV={exportMembersToCSV}
              />
            )}
          </>
        )}
      </div>

      {showClubModal && (
        <ClubModal
          clubInfo={clubInfo}
          editingClub={editingClub}
          setEditingClub={setEditingClub}
          handleCreateClub={handleCreateClub}
          handleUpdateClub={handleUpdateClub}
          handleDeleteClub={handleDeleteClub}
          onClose={() => setShowClubModal(false)}
        />
      )}
    </div>
  );
}