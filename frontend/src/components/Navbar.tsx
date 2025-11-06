import { useAuth } from "../context/AuthContext";
import { Bell, LogOut } from "lucide-react";
import { Link } from "react-router-dom";

export default function Navbar() {
  const { logout } = useAuth();

  return (
    <nav className="flex justify-between items-center px-6 py-3 bg-neutral-900 text-white shadow-md">
      <Link to="/dashboard" className="text-xl font-bold text-blue-400">SlotSwapper</Link>
      <div className="flex items-center gap-6">
        <Link to="/marketplace" className="hover:text-blue-300">Marketplace</Link>
        <Link to="/notifications">
          <Bell className="size-5 hover:text-blue-300" />
        </Link>
        <button onClick={logout} className="hover:text-red-400">
          <LogOut className="size-5" />
        </button>
      </div>
    </nav>
  );
}
