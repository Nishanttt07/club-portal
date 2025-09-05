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
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);

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
    link: "",
    registration_link: "",
    published: true
  });

  // Announcement state
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    message: "",
    image_url: "",
    link: "",
    pinned: false
  });

  // Club state
  const [clubForm, setClubForm] = useState({
    name: "",
    description: "",
    logo_url: ""
  });

  // Member state
  const [newMemberEmail, setNewMemberEmail] = useState("");

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
          setClubForm({
            name: clubData.name || "",
            description: clubData.description || "",
            logo_url: clubData.logo_url || ""
          });
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
      } else if (activeTab === "profiles") {
        fetchProfiles();
      } else if (activeTab === "club") {
        fetchClubStats();
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
      .order("pinned", { ascending: false })
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

  const fetchProfiles = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) console.error("Error fetching profiles:", error.message);
    else setProfiles(data);
  };

  const fetchClubStats = async () => {
    // Get total members
    const { count: memberCount, error: memberError } = await supabase
      .from("memberships")
      .select("*", { count: "exact" })
      .eq("club_id", clubId);

    // Get total events
    const { count: eventCount, error: eventError } = await supabase
      .from("events")
      .select("*", { count: "exact" })
      .eq("club_id", clubId);

    // Get active announcements
    const { count: announcementCount, error: announcementError } = await supabase
      .from("announcements")
      .select("*", { count: "exact" })
      .eq("club_id", clubId);

    if (memberError || eventError || announcementError) {
      console.error("Error fetching club stats");
    } else {
      setClubInfo(prev => ({
        ...prev,
        memberCount,
        eventCount,
        announcementCount
      }));
    }
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
        link: "",
        registration_link: "",
        published: true
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
    if (!confirm("Are you sure you want to delete this event?")) return;

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

  const toggleEventPublish = async (event) => {
    setLoading(true);
    const { error } = await supabase
      .from("events")
      .update({ published: !event.published })
      .eq("id", event.id);

    if (error) {
      console.error("Error toggling event publish status:", error.message);
      alert("Error updating event: " + error.message);
    } else {
      alert(`✅ Event ${!event.published ? 'published' : 'unpublished'} successfully!`);
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
        link: "",
        pinned: false
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
    if (!confirm("Are you sure you want to delete this announcement?")) return;

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

  const toggleAnnouncementPin = async (announcement) => {
    setLoading(true);
    const { error } = await supabase
      .from("announcements")
      .update({ pinned: !announcement.pinned })
      .eq("id", announcement.id);

    if (error) {
      console.error("Error toggling announcement pin status:", error.message);
      alert("Error updating announcement: " + error.message);
    } else {
      alert(`✅ Announcement ${!announcement.pinned ? 'pinned' : 'unpinned'} successfully!`);
      fetchAnnouncements();
    }
    setLoading(false);
  };

  // Club operations
  const handleUpdateClub = async () => {
    if (!clubId) return;

    setLoading(true);
    const { error } = await supabase
      .from("clubs")
      .update(clubForm)
      .eq("id", clubId);

    if (error) {
      console.error("Error updating club:", error.message);
      alert("Error updating club: " + error.message);
    } else {
      alert("✅ Club updated successfully!");
      // Refresh club info
      const { data } = await supabase
        .from("clubs")
        .select("*")
        .eq("id", clubId)
        .single();
      setClubInfo(data);
    }
    setLoading(false);
  };

  const handleDeleteClub = async () => {
    if (!confirm("Are you sure you want to delete this club? This action cannot be undone.")) return;

    setLoading(true);
    const { error } = await supabase
      .from("clubs")
      .delete()
      .eq("id", clubId);

    if (error) {
      console.error("Error deleting club:", error.message);
      alert("Error deleting club: " + error.message);
    } else {
      alert("✅ Club deleted successfully!");
      setClubId(null);
      setClubInfo(null);
    }
    setLoading(false);
  };

  // Member operations
  const handleAddMember = async () => {
    if (!newMemberEmail) {
      alert("Please enter an email address");
      return;
    }

    setLoading(true);
    // First check if user exists
    const { data: userData, error: userError } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", newMemberEmail)
      .single();

    if (userError || !userData) {
      alert("User with this email does not exist");
      setLoading(false);
      return;
    }

    // Check if user is already a member
    const { data: existingMember, error: checkError } = await supabase
      .from("memberships")
      .select("*")
      .eq("club_id", clubId)
      .eq("user_id", userData.id)
      .single();

    if (existingMember) {
      alert("This user is already a member of the club");
      setLoading(false);
      return;
    }

    // Add member
    const { error } = await supabase
      .from("memberships")
      .insert([
        {
          club_id: clubId,
          user_id: userData.id,
          joined_at: new Date().toISOString()
        }
      ]);

    if (error) {
      console.error("Error adding member:", error.message);
      alert("Error adding member: " + error.message);
    } else {
      alert("✅ Member added successfully!");
      setNewMemberEmail("");
      fetchMembers();
    }
    setLoading(false);
  };

  const handleRemoveMember = async (userId) => {
    if (!confirm("Are you sure you want to remove this member?")) return;

    setLoading(true);
    const { error } = await supabase
      .from("memberships")
      .delete()
      .eq("club_id", clubId)
      .eq("user_id", userId);

    if (error) {
      console.error("Error removing member:", error.message);
      alert("Error removing member: " + error.message);
    } else {
      alert("✅ Member removed successfully!");
      fetchMembers();
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

  // Profile operations
  const handleUpdateProfileRole = async (profileId, newRole) => {
    setLoading(true);
    const { error } = await supabase
      .from("profiles")
      .update({ role: newRole })
      .eq("id", profileId);

    if (error) {
      console.error("Error updating profile:", error.message);
      alert("Error updating profile: " + error.message);
    } else {
      alert("✅ Profile updated successfully!");
      fetchProfiles();
    }
    setLoading(false);
  };

  const handleSuspendProfile = async (profileId, suspend) => {
    setLoading(true);
    const { error } = await supabase
      .from("profiles")
      .update({ suspended: suspend })
      .eq("id", profileId);

    if (error) {
      console.error("Error updating profile:", error.message);
      alert("Error updating profile: " + error.message);
    } else {
      alert(`✅ Profile ${suspend ? 'suspended' : 'activated'} successfully!`);
      fetchProfiles();
    }
    setLoading(false);
  };

  const handleDeleteProfile = async (profileId) => {
    if (!confirm("Are you sure you want to delete this profile? This action cannot be undone.")) return;

    setLoading(true);
    const { error } = await supabase
      .from("profiles")
      .delete()
      .eq("id", profileId);

    if (error) {
      console.error("Error deleting profile:", error.message);
      alert("Error deleting profile: " + error.message);
    } else {
      alert("✅ Profile deleted successfully!");
      fetchProfiles();
    }
    setLoading(false);
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
    <div className="min-h-screen bg-gray-100">
      {/* Navigation Tabs */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold">Admin Dashboard</h1>
              </div>
              <nav className="hidden sm:ml-6 sm:flex">
                {["events", "announcements", "club", "members", "profiles"].map((tab) => (
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
            <div className="flex items-center">
              <span className="text-sm text-gray-700">Club: {clubInfo?.name || "N/A"}</span>
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
                            placeholder="Event Link"
                            value={editingEvent.link}
                            onChange={(e) => setEditingEvent({ ...editingEvent, link: e.target.value })}
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
                        <div className="flex items-center mb-4">
                          <input
                            type="checkbox"
                            checked={editingEvent.published}
                            onChange={(e) => setEditingEvent({ ...editingEvent, published: e.target.checked })}
                            className="mr-2"
                            id="edit-published"
                          />
                          <label htmlFor="edit-published">Published</label>
                        </div>
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
                            placeholder="Event Link"
                            value={newEvent.link}
                            onChange={(e) => setNewEvent({ ...newEvent, link: e.target.value })}
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
                        <div className="flex items-center mb-4">
                          <input
                            type="checkbox"
                            checked={newEvent.published}
                            onChange={(e) => setNewEvent({ ...newEvent, published: e.target.checked })}
                            className="mr-2"
                            id="create-published"
                          />
                          <label htmlFor="create-published">Published</label>
                        </div>
                        <button 
                          onClick={handleCreateEvent}
                          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                        >
                          Create Event
                        </button>
                      </div>
                    )}

                    <h3 className="text-lg font-medium mb-4">Existing Events</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Venue</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {events.map((event) => (
                            <tr key={event.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{event.title}</div>
                                <div className="text-sm text-gray-500">{event.description.substring(0, 50)}...</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{event.date}</div>
                                <div className="text-sm text-gray-500">{event.time}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {event.venue}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${event.published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                  {event.published ? 'Published' : 'Draft'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button 
                                  onClick={() => setEditingEvent(event)}
                                  className="text-indigo-600 hover:text-indigo-900 mr-3"
                                >
                                  Edit
                                </button>
                                <button 
                                  onClick={() => toggleEventPublish(event)}
                                  className="text-yellow-600 hover:text-yellow-900 mr-3"
                                >
                                  {event.published ? 'Unpublish' : 'Publish'}
                                </button>
                                <button 
                                  onClick={() => handleDeleteEvent(event.id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
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
                        <div className="flex items-center mb-4">
                          <input
                            type="checkbox"
                            checked={editingAnnouncement.pinned}
                            onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, pinned: e.target.checked })}
                            className="mr-2"
                            id="edit-pinned"
                          />
                          <label htmlFor="edit-pinned">Pinned</label>
                        </div>
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
                        <div className="flex items-center mb-4">
                          <input
                            type="checkbox"
                            checked={newAnnouncement.pinned}
                            onChange={(e) => setNewAnnouncement({ ...newAnnouncement, pinned: e.target.checked })}
                            className="mr-2"
                            id="create-pinned"
                          />
                          <label htmlFor="create-pinned">Pinned</label>
                        </div>
                        <button 
                          onClick={handleCreateAnnouncement}
                          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                        >
                          Create Announcement
                        </button>
                      </div>
                    )}

                    <h3 className="text-lg font-medium mb-4">Existing Announcements</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {announcements.map((announcement) => (
                            <tr key={announcement.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{announcement.title}</div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm text-gray-900">{announcement.message.substring(0, 50)}...</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${announcement.pinned ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                                  {announcement.pinned ? 'Pinned' : 'Normal'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button 
                                  onClick={() => setEditingAnnouncement(announcement)}
                                  className="text-indigo-600 hover:text-indigo-900 mr-3"
                                >
                                  Edit
                                </button>
                                <button 
                                  onClick={() => toggleAnnouncementPin(announcement)}
                                  className="text-yellow-600 hover:text-yellow-900 mr-3"
                                >
                                  {announcement.pinned ? 'Unpin' : 'Pin'}
                                </button>
                                <button 
                                  onClick={() => handleDeleteAnnouncement(announcement.id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Club Management Tab */}
              {activeTab === "club" && (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">Club Management</h2>
                  </div>
                  
                  <div className="px-4 py-5 sm:p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                      <div className="bg-indigo-100 p-4 rounded-lg">
                        <h3 className="text-lg font-medium text-indigo-800">Total Members</h3>
                        <p className="text-3xl font-bold text-indigo-900">{clubInfo?.memberCount || 0}</p>
                      </div>
                      <div className="bg-green-100 p-4 rounded-lg">
                        <h3 className="text-lg font-medium text-green-800">Total Events</h3>
                        <p className="text-3xl font-bold text-green-900">{clubInfo?.eventCount || 0}</p>
                      </div>
                      <div className="bg-purple-100 p-4 rounded-lg">
                        <h3 className="text-lg font-medium text-purple-800">Active Announcements</h3>
                        <p className="text-3xl font-bold text-purple-900">{clubInfo?.announcementCount || 0}</p>
                      </div>
                    </div>

                    <div className="mb-8 bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-medium mb-4">Update Club Information</h3>
                      <div className="grid grid-cols-1 gap-4 mb-4">
                        <input
                          type="text"
                          placeholder="Club Name"
                          value={clubForm.name}
                          onChange={(e) => setClubForm({ ...clubForm, name: e.target.value })}
                          className="border border-gray-300 rounded-md px-3 py-2"
                        />
                        <input
                          type="text"
                          placeholder="Logo URL"
                          value={clubForm.logo_url}
                          onChange={(e) => setClubForm({ ...clubForm, logo_url: e.target.value })}
                          className="border border-gray-300 rounded-md px-3 py-2"
                        />
                        <textarea
                          placeholder="Description"
                          value={clubForm.description}
                          onChange={(e) => setClubForm({ ...clubForm, description: e.target.value })}
                          className="border border-gray-300 rounded-md px-3 py-2 w-full"
                          rows="3"
                        />
                      </div>
                      <button 
                        onClick={handleUpdateClub}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 mr-3"
                      >
                        Update Club
                      </button>
                      <button 
                        onClick={handleDeleteClub}
                        className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                      >
                        Delete Club
                      </button>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-4">Club Information</h3>
                      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                        <div className="px-4 py-5 sm:px-6">
                          <h3 className="text-lg leading-6 font-medium text-gray-900">Club Profile</h3>
                        </div>
                        <div className="border-t border-gray-200">
                          <dl>
                            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                              <dt className="text-sm font-medium text-gray-500">Club name</dt>
                              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{clubInfo?.name}</dd>
                            </div>
                            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                              <dt className="text-sm font-medium text-gray-500">Description</dt>
                              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{clubInfo?.description}</dd>
                            </div>
                            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                              <dt className="text-sm font-medium text-gray-500">Logo</dt>
                              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                {clubInfo?.logo_url ? (
                                  <img src={clubInfo.logo_url} alt="Club Logo" className="h-16 w-16 object-contain" />
                                ) : (
                                  "No logo uploaded"
                                )}
                              </dd>
                            </div>
                            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                              <dt className="text-sm font-medium text-gray-500">Admin User ID</dt>
                              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{clubInfo?.admin_user_id}</dd>
                            </div>
                            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                              <dt className="text-sm font-medium text-gray-500">Created At</dt>
                              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                {clubInfo?.created_at ? format(new Date(clubInfo.created_at), "PPpp") : "N/A"}
                              </dd>
                            </div>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Members Tab */}
              {activeTab === "members" && (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">Members Management</h2>
                  </div>
                  
                  <div className="px-4 py-5 sm:p-6">
                    <div className="mb-8 bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-medium mb-4">Add New Member</h3>
                      <div className="flex">
                        <input
                          type="email"
                          placeholder="Member Email"
                          value={newMemberEmail}
                          onChange={(e) => setNewMemberEmail(e.target.value)}
                          className="border border-gray-300 rounded-md px-3 py-2 flex-grow mr-2"
                        />
                        <button 
                          onClick={handleAddMember}
                          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                        >
                          Add Member
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium">Club Members</h3>
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
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
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
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button 
                                  onClick={() => handleRemoveMember(member.user_id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Remove
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Profiles Tab */}
              {activeTab === "profiles" && (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">User Profiles Management</h2>
                  </div>
                  
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg font-medium mb-4">All User Profiles</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {profiles.map((profile) => (
                            <tr key={profile.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{profile.full_name || "N/A"}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {profile.email}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <select 
                                  value={profile.role || "user"} 
                                  onChange={(e) => handleUpdateProfileRole(profile.id, e.target.value)}
                                  className="border border-gray-300 rounded-md px-2 py-1"
                                >
                                  <option value="user">User</option>
                                  <option value="admin">Admin</option>
                                  <option value="moderator">Moderator</option>
                                </select>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${profile.suspended ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                  {profile.suspended ? 'Suspended' : 'Active'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {format(new Date(profile.created_at), "PPpp")}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button 
                                  onClick={() => handleSuspendProfile(profile.id, !profile.suspended)}
                                  className={`mr-3 ${profile.suspended ? 'text-green-600 hover:text-green-900' : 'text-yellow-600 hover:text-yellow-900'}`}
                                >
                                  {profile.suspended ? 'Activate' : 'Suspend'}
                                </button>
                                <button 
                                  onClick={() => handleDeleteProfile(profile.id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
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