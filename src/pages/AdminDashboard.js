import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { format } from 'date-fns';
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("events");
  const [user, setUser] = useState(null);
  const [clubId, setClubId] = useState(null);
  const [clubInfo, setClubInfo] = useState(null);
  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [editingClub, setEditingClub] = useState(null);

  // Event state
  const [newEvent, setNewEvent] = useState({
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

  // Announcement state
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    message: "",
    image_url: "",
    link: ""
  });

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
  const handleCreateEvent = async () => {
    if (!user || !clubId) {
      alert("User or club not found.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("events").insert([
      {
        ...newEvent,
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
      setNewEvent({
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
    }
    setLoading(false);
  };

  const handleUpdateEvent = async () => {
    if (!editingEvent) return;

    setLoading(true);
    const { error } = await supabase
      .from("events")
      .update(editingEvent)
      .eq("id", editingEvent.id);

    if (error) {
      console.error("Error updating event:", error.message);
      alert("Error updating event: " + error.message);
    } else {
      alert("✅ Event updated successfully!");
      fetchEvents();
      setEditingEvent(null);
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
  const handleCreateAnnouncement = async () => {
    if (!user || !clubId) {
      alert("User or club not found.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("announcements").insert([
      {
        ...newAnnouncement,
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
      setNewAnnouncement({
        title: "",
        message: "",
        image_url: "",
        link: ""
      });
    }
    setLoading(false);
  };

  const handleUpdateAnnouncement = async () => {
    if (!editingAnnouncement) return;

    setLoading(true);
    const { error } = await supabase
      .from("announcements")
      .update(editingAnnouncement)
      .eq("id", editingAnnouncement.id);

    if (error) {
      console.error("Error updating announcement:", error.message);
      alert("Error updating announcement: " + error.message);
    } else {
      alert("✅ Announcement updated successfully!");
      fetchAnnouncements();
      setEditingAnnouncement(null);
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

  // Club Profile operations
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
    }
    setLoading(false);
  };

  const exportMembersToCSV = () => {
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
    <div className="admin-dashboard min-h-screen bg-gray-100">
      {/* Header with profile and logout */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold">Admin Dashboard</h1>
              </div>
              <nav className="hidden sm:ml-6 sm:flex">
                {["events", "announcements", "members", "profile"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`${
                      activeTab === tab
                        ? "border-indigo-500 text-gray-900"
                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    } capitalize inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    {tab}
                  </button>
                ))}
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">{clubInfo?.name || "N/A"}</span>
              <button 
                onClick={handleLogout}
                className="bg-indigo-600 text-white px-3 py-1 rounded-md text-sm hover:bg-indigo-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {!clubId ? (
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-red-500">⚠️ No club found for this admin user.</p>
            </div>
          ) : (
            <>
              {/* Events Tab */}
              {activeTab === "events" && (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">Events Management</h2>
                  </div>
                  
                  <div className="px-4 py-5 sm:p-6">
                    {editingEvent ? (
                      <div className="mb-8 bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-medium mb-4">Edit Event</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <input
                            type="text"
                            placeholder="Title"
                            value={editingEvent.title}
                            onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                            className="border border-gray-300 rounded-md px-3 py-2"
                          />
                          <input
                            type="date"
                            value={editingEvent.date}
                            onChange={(e) => setEditingEvent({ ...editingEvent, date: e.target.value })}
                            className="border border-gray-300 rounded-md px-3 py-2"
                          />
                          <input
                            type="time"
                            value={editingEvent.time}
                            onChange={(e) => setEditingEvent({ ...editingEvent, time: e.target.value })}
                            className="border border-gray-300 rounded-md px-3 py-2"
                          />
                          <input
                            type="text"
                            placeholder="Venue"
                            value={editingEvent.venue}
                            onChange={(e) => setEditingEvent({ ...editingEvent, venue: e.target.value })}
                            className="border border-gray-300 rounded-md px-3 py-2"
                          />
                          <input
                            type="number"
                            placeholder="Entry Fee"
                            value={editingEvent.entry_fee}
                            onChange={(e) => setEditingEvent({ ...editingEvent, entry_fee: e.target.value })}
                            className="border border-gray-300 rounded-md px-3 py-2"
                          />
                          <input
                            type="text"
                            placeholder="Prize Pool"
                            value={editingEvent.prize_pool}
                            onChange={(e) => setEditingEvent({ ...editingEvent, prize_pool: e.target.value })}
                            className="border border-gray-300 rounded-md px-3 py-2"
                          />
                          <input
                            type="text"
                            placeholder="Image URL"
                            value={editingEvent.image_url}
                            onChange={(e) => setEditingEvent({ ...editingEvent, image_url: e.target.value })}
                            className="border border-gray-300 rounded-md px-3 py-2"
                          />
                          <input
                            type="text"
                            placeholder="Registration Link"
                            value={editingEvent.registration_link}
                            onChange={(e) => setEditingEvent({ ...editingEvent, registration_link: e.target.value })}
                            className="border border-gray-300 rounded-md px-3 py-2"
                          />
                        </div>
                        <textarea
                          placeholder="Description"
                          value={editingEvent.description}
                          onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })}
                          className="border border-gray-300 rounded-md px-3 py-2 w-full mb-4"
                          rows="3"
                        />
                        <div className="flex space-x-2">
                          <button 
                            onClick={handleUpdateEvent}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                          >
                            Update Event
                          </button>
                          <button 
                            onClick={() => setEditingEvent(null)}
                            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mb-8 bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-medium mb-4">Create New Event</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <input
                            type="text"
                            placeholder="Title"
                            value={newEvent.title}
                            onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                            className="border border-gray-300 rounded-md px-3 py-2"
                          />
                          <input
                            type="date"
                            value={newEvent.date}
                            onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                            className="border border-gray-300 rounded-md px-3 py-2"
                          />
                          <input
                            type="time"
                            value={newEvent.time}
                            onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                            className="border border-gray-300 rounded-md px-3 py-2"
                          />
                          <input
                            type="text"
                            placeholder="Venue"
                            value={newEvent.venue}
                            onChange={(e) => setNewEvent({ ...newEvent, venue: e.target.value })}
                            className="border border-gray-300 rounded-md px-3 py-2"
                          />
                          <input
                            type="number"
                            placeholder="Entry Fee"
                            value={newEvent.entry_fee}
                            onChange={(e) => setNewEvent({ ...newEvent, entry_fee: e.target.value })}
                            className="border border-gray-300 rounded-md px-3 py-2"
                          />
                          <input
                            type="text"
                            placeholder="Prize Pool"
                            value={newEvent.prize_pool}
                            onChange={(e) => setNewEvent({ ...newEvent, prize_pool: e.target.value })}
                            className="border border-gray-300 rounded-md px-3 py-2"
                          />
                          <input
                            type="text"
                            placeholder="Image URL"
                            value={newEvent.image_url}
                            onChange={(e) => setNewEvent({ ...newEvent, image_url: e.target.value })}
                            className="border border-gray-300 rounded-md px-3 py-2"
                          />
                          <input
                            type="text"
                            placeholder="Registration Link"
                            value={newEvent.registration_link}
                            onChange={(e) => setNewEvent({ ...newEvent, registration_link: e.target.value })}
                            className="border border-gray-300 rounded-md px-3 py-2"
                          />
                        </div>
                        <textarea
                          placeholder="Description"
                          value={newEvent.description}
                          onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                          className="border border-gray-300 rounded-md px-3 py-2 w-full mb-4"
                          rows="3"
                        />
                        <button 
                          onClick={handleCreateEvent}
                          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                        >
                          Create Event
                        </button>
                      </div>
                    )}

                    <h3 className="text-lg font-medium mb-4">Existing Events</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {events.map((event) => (
                        <div key={event.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                          {event.image_url && (
                            <img src={event.image_url} alt={event.title} className="w-full h-48 object-cover" />
                          )}
                          <div className="p-4">
                            <h4 className="font-semibold text-lg mb-2">{event.title}</h4>
                            <p className="text-gray-600 mb-2">{event.description.substring(0, 100)}...</p>
                            <div className="text-sm text-gray-500 mb-2">
                              <strong>Date:</strong> {event.date} at {event.time}
                            </div>
                            <div className="text-sm text-gray-500 mb-2">
                              <strong>Venue:</strong> {event.venue}
                            </div>
                            <div className="text-sm text-gray-500 mb-4">
                              <strong>Entry Fee:</strong> ${event.entry_fee} | <strong>Prize Pool:</strong> {event.prize_pool}
                            </div>
                            <div className="flex justify-between">
                              <button 
                                onClick={() => setEditingEvent(event)}
                                className="text-indigo-600 hover:text-indigo-900"
                              >
                                Edit
                              </button>
                              <button 
                                onClick={() => handleDeleteEvent(event.id)}
                                className="text-red-600 hover:text-red-900"
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
              )}

              {/* Announcements Tab */}
              {activeTab === "announcements" && (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">Announcements Management</h2>
                  </div>
                  
                  <div className="px-4 py-5 sm:p-6">
                    {editingAnnouncement ? (
                      <div className="mb-8 bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-medium mb-4">Edit Announcement</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <input
                            type="text"
                            placeholder="Title"
                            value={editingAnnouncement.title}
                            onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, title: e.target.value })}
                            className="border border-gray-300 rounded-md px-3 py-2"
                          />
                          <input
                            type="text"
                            placeholder="Image URL"
                            value={editingAnnouncement.image_url}
                            onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, image_url: e.target.value })}
                            className="border border-gray-300 rounded-md px-3 py-2"
                          />
                          <input
                            type="text"
                            placeholder="Link"
                            value={editingAnnouncement.link}
                            onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, link: e.target.value })}
                            className="border border-gray-300 rounded-md px-3 py-2"
                          />
                        </div>
                        <textarea
                          placeholder="Message"
                          value={editingAnnouncement.message}
                          onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, message: e.target.value })}
                          className="border border-gray-300 rounded-md px-3 py-2 w-full mb-4"
                          rows="3"
                        />
                        <div className="flex space-x-2">
                          <button 
                            onClick={handleUpdateAnnouncement}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                          >
                            Update Announcement
                          </button>
                          <button 
                            onClick={() => setEditingAnnouncement(null)}
                            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mb-8 bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-medium mb-4">Create New Announcement</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <input
                            type="text"
                            placeholder="Title"
                            value={newAnnouncement.title}
                            onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                            className="border border-gray-300 rounded-md px-3 py-2"
                          />
                          <input
                            type="text"
                            placeholder="Image URL"
                            value={newAnnouncement.image_url}
                            onChange={(e) => setNewAnnouncement({ ...newAnnouncement, image_url: e.target.value })}
                            className="border border-gray-300 rounded-md px-3 py-2"
                          />
                          <input
                            type="text"
                            placeholder="Link"
                            value={newAnnouncement.link}
                            onChange={(e) => setNewAnnouncement({ ...newAnnouncement, link: e.target.value })}
                            className="border border-gray-300 rounded-md px-3 py-2"
                          />
                        </div>
                        <textarea
                          placeholder="Message"
                          value={newAnnouncement.message}
                          onChange={(e) => setNewAnnouncement({ ...newAnnouncement, message: e.target.value })}
                          className="border border-gray-300 rounded-md px-3 py-2 w-full mb-4"
                          rows="3"
                        />
                        <button 
                          onClick={handleCreateAnnouncement}
                          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                        >
                          Create Announcement
                        </button>
                      </div>
                    )}

                    <h3 className="text-lg font-medium mb-4">Existing Announcements</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {announcements.map((announcement) => (
                        <div key={announcement.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                          {announcement.image_url && (
                            <img src={announcement.image_url} alt={announcement.title} className="w-full h-48 object-cover" />
                          )}
                          <div className="p-4">
                            <h4 className="font-semibold text-lg mb-2">{announcement.title}</h4>
                            <p className="text-gray-600 mb-4">{announcement.message.substring(0, 150)}...</p>
                            <div className="text-sm text-gray-500 mb-4">
                              {format(new Date(announcement.created_at), "PPpp")}
                            </div>
                            {announcement.link && (
                              <a href={announcement.link} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 text-sm mb-4 block">
                                View More
                              </a>
                            )}
                            <div className="flex justify-between">
                              <button 
                                onClick={() => setEditingAnnouncement(announcement)}
                                className="text-indigo-600 hover:text-indigo-900"
                              >
                                Edit
                              </button>
                              <button 
                                onClick={() => handleDeleteAnnouncement(announcement.id)}
                                className="text-red-600 hover:text-red-900"
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
              )}

              {/* Members Tab */}
              {activeTab === "members" && (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">Club Members</h2>
                  </div>
                  
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium">Total Members: {members.length}</h3>
                      <button 
                        onClick={exportMembersToCSV}
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                      >
                        Export to CSV
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined At</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {members.map((member) => (
                            <tr key={member.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{member.profiles?.full_name || "N/A"}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {member.profiles?.email || "N/A"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {format(new Date(member.joined_at), "PPpp")}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Profile Tab */}
              {activeTab === "profile" && editingClub && (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">Club Profile</h2>
                  </div>
                  
                  <div className="px-4 py-5 sm:p-6">
                    <div className="mb-8 bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-medium mb-4">Edit Club Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Club Name</label>
                          <input
                            type="text"
                            value={editingClub.name}
                            onChange={(e) => setEditingClub({ ...editingClub, name: e.target.value })}
                            className="border border-gray-300 rounded-md px-3 py-2 w-full"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
                          <input
                            type="text"
                            value={editingClub.logo_url}
                            onChange={(e) => setEditingClub({ ...editingClub, logo_url: e.target.value })}
                            className="border border-gray-300 rounded-md px-3 py-2 w-full"
                          />
                        </div>
                      </div>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                          value={editingClub.description}
                          onChange={(e) => setEditingClub({ ...editingClub, description: e.target.value })}
                          className="border border-gray-300 rounded-md px-3 py-2 w-full"
                          rows="3"
                        />
                      </div>
                      <button 
                        onClick={handleUpdateClub}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                      >
                        Update Club Details
                      </button>
                    </div>

                    <h3 className="text-lg font-medium mb-4">Current Club Information</h3>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <div className="flex items-center mb-4">
                        {clubInfo.logo_url && (
                          <img src={clubInfo.logo_url} alt={clubInfo.name} className="w-16 h-16 object-contain mr-4" />
                        )}
                        <div>
                          <h4 className="text-xl font-semibold">{clubInfo.name}</h4>
                          <p className="text-gray-600">Admin ID: {clubInfo.admin_user_id}</p>
                        </div>
                      </div>
                      <p className="text-gray-700 mb-4">{clubInfo.description}</p>
                      <p className="text-sm text-gray-500">Created at: {format(new Date(clubInfo.created_at), "PPpp")}</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}