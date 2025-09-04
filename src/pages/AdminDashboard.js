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

    // Fetch user emails from profiles table instead of auth
    const memberList = await Promise.all(
      memberships.map(async (m) => {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("email")
          .eq("id", m.user_id)
          .single();
        
        return {
          ...m,
          email: profileData?.email || "Unknown",
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

// Modal Component
function Modal({ show, onClose, title, children }) {
  if (!show) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
}

// Logout Confirmation Modal
function LogoutModal({ show, onCancel, onConfirm }) {
  return (
    <Modal show={show} onClose={onCancel} title="Confirm Logout">
      <p>Are you sure you want to log out?</p>
      <div className="modal-buttons">
        <button className="modal-button cancel" onClick={onCancel}>
          Cancel
        </button>
        <button className="modal-button confirm" onClick={onConfirm}>
          Log Out
        </button>
      </div>
    </Modal>
  );
}

// Club Profile Form
function ClubForm({ club, onSubmit, formData, onFormChange, onCancel }) {
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
      <div className="form-actions">
        <button type="button" className="form-cancel" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="form-submit">
          {club ? "Update Club" : "Create Club"}
        </button>
      </div>
    </form>
  );
}

// Event Form
function EventForm({ onSubmit, formData, onFormChange, onCancel, isEditing }) {
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
        <div className="form-group">
          <label>Registration Link</label>
          <input
            type="text"
            className="form-input"
            placeholder="Registration/Google Form Link"
            value={formData.registration_link}
            onChange={(e) => onFormChange('registration_link', e.target.value)}
          />
        </div>
      </div>
      <div className="form-actions">
        <button type="button" className="form-cancel" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="form-submit">
          {isEditing ? "Update Event" : "Add Event"}
        </button>
      </div>
    </form>
  );
}

// Announcement Form
function AnnouncementForm({ onSubmit, formData, onFormChange, onCancel, isEditing }) {
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
      <div className="form-actions">
        <button type="button" className="form-cancel" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="form-submit">
          {isEditing ? "Update Announcement" : "Add Announcement"}
        </button>
      </div>
    </form>
  );
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
  const [showClubModal, setShowClubModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);

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
    image_url: "",
    registration_link: ""
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

  // Open club modal for editing
  const openClubModal = () => {
    if (club) {
      setClubForm({
        name: club.name || "",
        description: club.description || "",
        logo_url: club.logo_url || ""
      });
    }
    setShowClubModal(true);
  };

  // Open event modal for adding or editing
  const openEventModal = (event = null) => {
    if (event) {
      setEventForm({
        title: event.title || "",
        date: event.date || "",
        time: event.time || "",
        venue: event.venue || "",
        description: event.description || "",
        entry_fee: event.entry_fee || "",
        prize_pool: event.prize_pool || "",
        image_url: event.image_url || "",
        registration_link: event.registration_link || ""
      });
      setEditingEvent(event);
    } else {
      setEventForm({
        title: "",
        date: "",
        time: "",
        venue: "",
        description: "",
        entry_fee: "",
        prize_pool: "",
        image_url: "",
        registration_link: ""
      });
      setEditingEvent(null);
    }
    setShowEventModal(true);
  };

  // Open announcement modal for adding or editing
  const openAnnouncementModal = (announcement = null) => {
    if (announcement) {
      setAnnouncementForm({
        title: announcement.title || "",
        message: announcement.message || "",
        image_url: announcement.image_url || "",
        link: announcement.link || ""
      });
      setEditingAnnouncement(announcement);
    } else {
      setAnnouncementForm({
        title: "",
        message: "",
        image_url: "",
        link: ""
      });
      setEditingAnnouncement(null);
    }
    setShowAnnouncementModal(true);
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
      setShowClubModal(false);
    } catch (error) {
      console.error("Error saving club:", error);
      alert("Error saving club. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add or update event
  const saveEvent = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (editingEvent) {
        // Update existing event
        await supabase
          .from("events")
          .update({
            title: eventForm.title,
            date: eventForm.date,
            time: eventForm.time,
            venue: eventForm.venue,
            description: eventForm.description,
            entry_fee: eventForm.entry_fee,
            prize_pool: eventForm.prize_pool,
            image_url: eventForm.image_url,
            registration_link: eventForm.registration_link,
          })
          .eq("id", editingEvent.id);
        alert("Event updated successfully!");
      } else {
        // Add new event
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
            registration_link: eventForm.registration_link,
            club_id: club.id,
          },
        ]);
        alert("Event added successfully!");
      }
      
      // Reset form and refresh events
      setEventForm({
        title: "",
        date: "",
        time: "",
        venue: "",
        description: "",
        entry_fee: "",
        prize_pool: "",
        image_url: "",
        registration_link: ""
      });
      
      fetchEvents(club.id);
      setShowEventModal(false);
      setEditingEvent(null);
    } catch (error) {
      console.error("Error saving event:", error);
      alert("Error saving event. Please try again.");
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

  // Add or update announcement
  const saveAnnouncement = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (editingAnnouncement) {
        // Update existing announcement
        await supabase
          .from("announcements")
          .update({
            title: announcementForm.title,
            message: announcementForm.message,
            image_url: announcementForm.image_url,
            link: announcementForm.link,
          })
          .eq("id", editingAnnouncement.id);
        alert("Announcement updated successfully!");
      } else {
        // Add new announcement
        await supabase.from("announcements").insert([
          {
            title: announcementForm.title,
            message: announcementForm.message,
            image_url: announcementForm.image_url,
            link: announcementForm.link,
            club_id: club.id,
          },
        ]);
        alert("Announcement added successfully!");
      }
      
      // Reset form and refresh announcements
      setAnnouncementForm({
        title: "",
        message: "",
        image_url: "",
        link: ""
      });
      
      fetchAnnouncements(club.id);
      setShowAnnouncementModal(false);
      setEditingAnnouncement(null);
    } catch (error) {
      console.error("Error saving announcement:", error);
      alert("Error saving announcement. Please try again.");
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

      {/* Club Profile Modal */}
      <Modal show={showClubModal} onClose={() => setShowClubModal(false)} title="Club Profile">
        <ClubForm
          club={club}
          onSubmit={saveClub}
          formData={clubForm}
          onFormChange={updateFormData(setClubForm)}
          onCancel={() => setShowClubModal(false)}
        />
      </Modal>

      {/* Event Modal */}
      <Modal show={showEventModal} onClose={() => setShowEventModal(false)} title={editingEvent ? "Edit Event" : "Add Event"}>
        <EventForm
          onSubmit={saveEvent}
          formData={eventForm}
          onFormChange={updateFormData(setEventForm)}
          onCancel={() => setShowEventModal(false)}
          isEditing={!!editingEvent}
        />
      </Modal>

      {/* Announcement Modal */}
      <Modal show={showAnnouncementModal} onClose={() => setShowAnnouncementModal(false)} title={editingAnnouncement ? "Edit Announcement" : "Add Announcement"}>
        <AnnouncementForm
          onSubmit={saveAnnouncement}
          formData={announcementForm}
          onFormChange={updateFormData(setAnnouncementForm)}
          onCancel={() => setShowAnnouncementModal(false)}
          isEditing={!!editingAnnouncement}
        />
      </Modal>

      <div className="dashboard-header">
        <h2>Club Admin Dashboard</h2>
        <div className="header-controls">
          {club && (
            <button className="profile-btn" onClick={openClubModal}>
              Club Profile
            </button>
          )}
          <button className="logout-btn" onClick={() => setShowLogoutConfirm(true)}>
            Logout
          </button>
        </div>
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

      {club && (
        <>
          {/* Events Section */}
          <Section
            title="Manage Events"
            count={events.length}
            expanded={expandedSections.events}
            onToggle={() => toggleSection("events")}
          >
            <button className="add-btn" onClick={() => openEventModal()}>
              Add New Event
            </button>

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
                    {event.registration_link && (
                      <>
                        <br />
                        <a href={event.registration_link} target="_blank" rel="noopener noreferrer">
                          Registration Link
                        </a>
                      </>
                    )}
                  </p>
                  <div className="item-actions">
                    <button
                      className="edit-btn"
                      onClick={() => openEventModal(event)}
                    >
                      Edit
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => deleteEvent(event.id)}
                      disabled={isSubmitting}
                    >
                      Delete
                    </button>
                  </div>
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
            <button className="add-btn" onClick={() => openAnnouncementModal()}>
              Add New Announcement
            </button>

            <div className="items-list">
              {announcements.map((a) => (
                <div key={a.id} className="item-card announcement-card">
                  <h4 className="item-title">{a.title}</h4>
                  <p className="item-details">{a.message}</p>
                  <div className="item-actions">
                    <button
                      className="edit-btn"
                      onClick={() => openAnnouncementModal(a)}
                    >
                      Edit
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => deleteAnnouncement(a.id)}
                      disabled={isSubmitting}
                    >
                      Delete
                    </button>
                  </div>
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

      {!club && (
        <Section
          title="Create Your Club"
          expanded={expandedSections.club}
          onToggle={() => toggleSection("club")}
        >
          <ClubForm
            club={club}
            onSubmit={saveClub}
            formData={clubForm}
            onFormChange={updateFormData(setClubForm)}
            onCancel={() => {}}
          />
        </Section>
      )}
    </div>
  );
}