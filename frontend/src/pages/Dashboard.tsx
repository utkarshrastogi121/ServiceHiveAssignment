import { useEffect, useState } from "react";
import API from "../utils/api";
import { socket } from "../utils/socket";
import Navbar from "../components/Navbar";
import LoadingSpinner from "../components/LoadingSpinner";
import toast from "react-hot-toast";

interface EventType {
  _id: string;
  title: string;
  startTime: string;
  endTime: string;
  status: "BUSY" | "FREE" | "SWAPPABLE";
}

export default function Dashboard() {
  const [events, setEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [newEvent, setNewEvent] = useState({
    title: "",
    startTime: "",
    endTime: "",
    status: "BUSY",
  });

  useEffect(() => {
    fetchEvents();
    socket.connect();
    socket.on("event-updated", fetchEvents);
    return () => {
      socket.off("event-updated", fetchEvents);
      socket.disconnect();
    };
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await API.get("/events");
      setEvents(res.data);
    } catch {
      toast.error("Failed to fetch events");
    } finally {
      setLoading(false);
    }
  };

const makeSwappable = async (id: string) => {
  try {
    await API.put(`/events/${id}`, { status: "SWAPPABLE" });
    toast.success("Slot made swappable!");
    fetchEvents();
  } catch {
    toast.error("Failed to make swappable");
  }
};


  const createOrUpdateEvent = async () => {
    try {
      const { title, startTime, endTime, status } = newEvent;
      if (!title || !startTime || !endTime) {
        toast.error("Please fill all fields");
        return;
      }

      if (editMode && currentId) {
        await API.put(`/events/${currentId}`, { title, startTime, endTime, status });
        toast.success("Event updated!");
      } else {
        await API.post("/events", { title, startTime, endTime, status });
        toast.success("Event created!");
      }

      setShowModal(false);
      setEditMode(false);
      setNewEvent({ title: "", startTime: "", endTime: "", status: "BUSY" });
      setCurrentId(null);
      fetchEvents();
    } catch {
      toast.error("Failed to save event");
    }
  };

  const deleteEvent = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    try {
      await API.delete(`/events/${id}`);
      toast.success("Event deleted!");
      fetchEvents();
    } catch {
      toast.error("Failed to delete event");
    }
  };

  const openEditModal = (event: EventType) => {
    setNewEvent({
      title: event.title,
      startTime: event.startTime.slice(0, 16),
      endTime: event.endTime.slice(0, 16),
      status: event.status,
    });
    setCurrentId(event._id);
    setEditMode(true);
    setShowModal(true);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <Navbar />

      <div className="max-w-4xl mx-auto mt-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">My Events</h2>
          <button
            onClick={() => {
              setShowModal(true);
              setEditMode(false);
              setNewEvent({ title: "", startTime: "", endTime: "", status: "BUSY" });
            }}
            className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-md font-medium"
          >
            + Add Event
          </button>
        </div>

        {events.length === 0 ? (
          <p className="text-gray-400 text-center">No events yet. Add one!</p>
        ) : (
          <div className="space-y-3">
            {events.map((e) => (
              <div
                key={e._id}
                className="bg-neutral-800 p-4 rounded-lg flex justify-between items-center shadow-md"
              >
                <div>
                  <p className="font-medium">{e.title}</p>
                  <p className="text-sm text-gray-400">
                    {new Date(e.startTime).toLocaleString()} →{" "}
                    {new Date(e.endTime).toLocaleString()}
                  </p>
                  <span
                    className={`text-xs font-medium ${
                      e.status === "SWAPPABLE"
                        ? "text-green-400"
                        : e.status === "BUSY"
                        ? "text-yellow-400"
                        : "text-gray-400"
                    }`}
                  >
                    {e.status}
                  </span>
                </div>

                <div className="flex gap-2">
                  {e.status === "BUSY" && (
                    <button
                      onClick={() => makeSwappable(e._id)}
                      className="bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded text-sm"
                    >
                      Make Swappable
                    </button>
                  )}
                  <button
                    onClick={() => openEditModal(e)}
                    className="bg-neutral-700 hover:bg-neutral-600 px-3 py-1 rounded text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteEvent(e._id)}
                    className="bg-red-600 hover:bg-red-500 px-3 py-1 rounded text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
          <div className="bg-neutral-900 rounded-lg p-6 w-96 shadow-xl">
            <h3 className="text-xl font-semibold mb-4 text-center">
              {editMode ? "Edit Event" : "Add New Event"}
            </h3>

            <input
              type="text"
              placeholder="Event Title"
              value={newEvent.title}
              onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              className="w-full p-3 mb-3 bg-neutral-800 border border-neutral-700 rounded-md text-white focus:outline-none focus:border-blue-500"
            />
            <input
              type="datetime-local"
              value={newEvent.startTime}
              onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
              className="w-full p-3 mb-3 bg-neutral-800 border border-neutral-700 rounded-md text-white focus:outline-none focus:border-blue-500"
            />
            <input
              type="datetime-local"
              value={newEvent.endTime}
              onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
              className="w-full p-3 mb-3 bg-neutral-800 border border-neutral-700 rounded-md text-white focus:outline-none focus:border-blue-500"
            />
            <select
              value={newEvent.status}
              onChange={(e) => setNewEvent({ ...newEvent, status: e.target.value })}
              className="w-full p-3 mb-4 bg-neutral-800 border border-neutral-700 rounded-md text-white focus:outline-none focus:border-blue-500"
            >
              <option value="BUSY">Busy</option>
              <option value="FREE">Free</option>
              <option value="SWAPPABLE">Swappable</option>
            </select>

            <div className="flex justify-between">
              <button
                onClick={createOrUpdateEvent}
                className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-md text-white font-medium"
              >
                {editMode ? "Update" : "Save"}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="bg-neutral-700 hover:bg-neutral-600 px-4 py-2 rounded-md text-white font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
