import { useEffect, useState } from "react";
import API from "../utils/api";
import Navbar from "../components/Navbar";
import LoadingSpinner from "../components/LoadingSpinner";
import toast from "react-hot-toast";

export default function Requests() {
  const [incoming, setIncoming] = useState<any[]>([]);
  const [outgoing, setOutgoing] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await API.get("/swaps/my-requests");
      setIncoming(res.data.incoming);
      setOutgoing(res.data.outgoing);
    } catch {
      toast.error("Failed to load swap requests");
    } finally {
      setLoading(false);
    }
  };

  const respond = async (id: string, accept: boolean) => {
    try {
      await API.post(`/swaps/response/${id}`, { accept });
      toast.success(accept ? "Swap Accepted!" : "Swap Rejected");
      fetchRequests();
    } catch {
      toast.error("Failed to respond");
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <Navbar />

      <div className="max-w-5xl mx-auto mt-8 px-4">
        <h2 className="text-2xl font-semibold mb-6">Swap Requests</h2>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Incoming */}
          <div>
            <h3 className="text-xl mb-3 font-semibold text-blue-400">Incoming Requests</h3>
            {incoming.length === 0 ? (
              <p className="text-gray-400">No incoming requests.</p>
            ) : (
              incoming.map((req) => (
                <div
                  key={req._id}
                  className="bg-neutral-800 p-4 rounded-lg mb-3 flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium">
                      {req.myUser?.name || "Someone"} wants to swap their{" "}
                      <span className="text-blue-400">{req.mySlot?.title}</span> with your{" "}
                      <span className="text-yellow-400">{req.theirSlot?.title}</span>
                    </p>
                    <p className="text-sm text-gray-400">
                      {new Date(req.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => respond(req._id, true)}
                      className="bg-green-600 hover:bg-green-500 px-3 py-1 rounded text-sm"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => respond(req._id, false)}
                      className="bg-red-600 hover:bg-red-500 px-3 py-1 rounded text-sm"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Outgoing */}
          <div>
            <h3 className="text-xl mb-3 font-semibold text-yellow-400">Outgoing Requests</h3>
            {outgoing.length === 0 ? (
              <p className="text-gray-400">No outgoing requests.</p>
            ) : (
              outgoing.map((req) => (
                <div
                  key={req._id}
                  className="bg-neutral-800 p-4 rounded-lg mb-3 flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium">
                      You offered{" "}
                      <span className="text-blue-400">{req.mySlot?.title}</span> for{" "}
                      <span className="text-yellow-400">{req.theirSlot?.title}</span>
                    </p>
                    <p className="text-sm text-gray-400">
                      Status:{" "}
                      <span
                        className={
                          req.status === "ACCEPTED"
                            ? "text-green-400"
                            : req.status === "REJECTED"
                            ? "text-red-400"
                            : "text-yellow-400"
                        }
                      >
                        {req.status}
                      </span>
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
