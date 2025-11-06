import { useEffect, useState } from "react";
import API from "../utils/api";
import Navbar from "../components/Navbar";
import toast from "react-hot-toast";

export default function Notifications() {
  const [incoming, setIncoming] = useState<any[]>([]);
  const [outgoing, setOutgoing] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await API.get("/swaps/my-requests");
      setIncoming(res.data.incoming || []);
      setOutgoing(res.data.outgoing || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load swap requests");
    } finally {
      setLoading(false);
    }
  };

  const respond = async (id: string, status: "ACCEPT" | "REJECT") => {
    try {
      await API.post(`/swaps/response/${id}`, { accept: status === "ACCEPT" });
      toast.success(`Request ${status.toLowerCase()}ed`);
      fetchRequests();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update request");
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      <Navbar />
      <div className="max-w-5xl mx-auto mt-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Notifications</h1>

        {loading ? (
          <p className="text-center text-gray-400">Loading requests...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Incoming Requests */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Incoming Requests</h3>
              {incoming.length === 0 ? (
                <p className="text-sm text-gray-400">No incoming requests</p>
              ) : (
                incoming.map((r) => (
                  <div
                    key={r._id}
                    className="bg-neutral-800 p-4 rounded-lg mb-2 flex justify-between items-center"
                  >
                    <span className="text-sm">
                      <strong>{r.myUser?.name || "Unknown User"}</strong> wants
                      to swap with you
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => respond(r._id, "ACCEPT")}
                        className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm transition"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => respond(r._id, "REJECT")}
                        className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm transition"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Outgoing Requests */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Outgoing Requests</h3>
              {outgoing.length === 0 ? (
                <p className="text-sm text-gray-400">No outgoing requests</p>
              ) : (
                outgoing.map((r) => (
                  <div
                    key={r._id}
                    className="bg-neutral-800 p-4 rounded-lg mb-2 flex justify-between items-center"
                  >
                    <span className="text-sm">
                      To: <strong>{r.theirUser?.name || "Unknown User"}</strong>
                    </span>
                    <span
                      className={`text-sm font-medium ${
                        r.status === "PENDING"
                          ? "text-yellow-400"
                          : r.status === "ACCEPTED"
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      ({r.status})
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
