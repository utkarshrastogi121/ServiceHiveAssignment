import { useEffect, useState } from "react";
import API from "../utils/api";
import Navbar from "../components/Navbar";
import LoadingSpinner from "../components/LoadingSpinner";
import toast from "react-hot-toast";

interface Slot {
  _id: string;
  title: string;
  startTime: string;
  endTime: string;
  owner: string;
}

export default function Marketplace() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [mySwappables, setMySwappables] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [selectedMySlot, setSelectedMySlot] = useState<string>("");

  useEffect(() => {
    fetchSlots();
    fetchMySwappables();
  }, []);

  const fetchSlots = async () => {
    try {
      const res = await API.get("/events/swappable");
      console.log(res.data)
      setSlots(res.data);
    } catch {
      toast.error("Failed to fetch marketplace slots");
    } finally {
      setLoading(false);
    }
  };

  const fetchMySwappables = async () => {
    try {
      const res = await API.get("/events");
      setMySwappables(res.data.filter((e: any) => e.status === "SWAPPABLE"));
    } catch {
      toast.error("Failed to fetch your swappable slots");
    }
  };

  const openRequestModal = (slot: Slot) => {
    setSelectedSlot(slot);
    setShowModal(true);
  };

  const sendSwapRequest = async () => {
    if (!selectedSlot || !selectedMySlot) {
      toast.error("Please select one of your slots");
      return;
    }
    try {
      await API.post("/swaps/request", {
        mySlotId: selectedMySlot,
        theirSlotId: selectedSlot._id,
      });
      toast.success("Swap request sent!");
      setShowModal(false);
      setSelectedSlot(null);
      setSelectedMySlot("");
    } catch {
      toast.error("Failed to send swap request");
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <Navbar />

      <div className="max-w-4xl mx-auto mt-8 px-4">
        <h2 className="text-2xl font-semibold mb-6">Marketplace Slots</h2>

        {slots.length === 0 ? (
          <p className="text-gray-400 text-center">No swappable slots available.</p>
        ) : (
          <div className="space-y-3">
            {slots.map((slot) => (
              <div
                key={slot._id}
                className="bg-neutral-800 p-4 rounded-lg flex justify-between items-center shadow-md"
              >
                <div>
                  <p className="font-medium">{slot.title}</p>
                  <p className="text-sm text-gray-400">
                    {new Date(slot.startTime).toLocaleString()} →{" "}
                    {new Date(slot.endTime).toLocaleString()}
                  </p>
                </div>

                <button
                  onClick={() => openRequestModal(slot)}
                  className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-md text-sm font-medium"
                >
                  Request Swap
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && selectedSlot && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
          <div className="bg-neutral-900 rounded-lg p-6 w-96 shadow-xl">
            <h3 className="text-xl font-semibold mb-4 text-center">
              Swap for: {selectedSlot.title}
            </h3>

            <select
              value={selectedMySlot}
              onChange={(e) => setSelectedMySlot(e.target.value)}
              className="w-full p-3 mb-4 bg-neutral-800 border border-neutral-700 rounded-md text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">Select one of your swappable slots</option>
              {mySwappables.map((slot) => (
                <option key={slot._id} value={slot._id}>
                  {slot.title} ({new Date(slot.startTime).toLocaleTimeString()})
                </option>
              ))}
            </select>

            <div className="flex justify-between">
              <button
                onClick={sendSwapRequest}
                className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-md text-white font-medium"
              >
                Send Request
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
