import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Leaf,
  UserRoundCog,
  LogOut,
  ShieldUser,
  Bell
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const NavBar = () => {
  const { user, isLoggedIn, isAdmin, logout, getNotifications, markNotificationRead, markAllNotificationsRead } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const notifRef = useRef(null);
  const profileBtnRef = useRef(null);
  const notifBtnRef = useRef(null);

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    navigate("/");
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const target = event.target;
      const clickedInsideMenu = menuRef.current && menuRef.current.contains(target);
      const clickedInsideNotif = notifRef.current && notifRef.current.contains(target);
      const clickedProfileBtn = profileBtnRef.current && profileBtnRef.current.contains(target);
      const clickedNotifBtn = notifBtnRef.current && notifBtnRef.current.contains(target);

      const clickedAnyMenu = clickedInsideMenu || clickedInsideNotif || clickedProfileBtn || clickedNotifBtn;
      if (!clickedAnyMenu) {
        setMenuOpen(false);
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchNotifs = async () => {
      if (isLoggedIn) {
        const data = await getNotifications();
        setNotifications(Array.isArray(data) ? data : []);
      } else {
        setNotifications([]);
      }
    };
    fetchNotifs();
  }, [isLoggedIn, getNotifications]);

  const unreadCount = notifications.filter(n => n.status === 'unread').length;

  const handleOpenNotifications = async () => {
    setNotifOpen(!notifOpen);
    if (!notifOpen) {
      const data = await getNotifications();
      setNotifications(Array.isArray(data) ? data : []);
    }
  };

  const handleMarkAllRead = async () => {
    const ok = await markAllNotificationsRead();
    if (ok) {
      const data = await getNotifications();
      setNotifications(Array.isArray(data) ? data : []);
    }
  };

  const handleMarkRead = async (id) => {
    const ok = await markNotificationRead(id);
    if (ok) {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, status: 'read' } : n));
    }
  };
  return (
    <div className="w-full flex justify-between items-center h-15 bg-white sticky shadow-lg top-0 z-1000">
      <div className="font-bold ml-7.5 text-2xl flex flex-col gap-2">
        <Link to="/" className="flex items-center gap-2">
          <Leaf color="#098409" />
          <p>
            Verde<span className="text-[#098409]">X</span>
          </p>
        </Link>
      </div>
      <div className="flex items-center justify-center">
        <Link
          to="/"
          className="font-semibold mr-5 text-lg hover:text-[#098409] hover:bg-[#0000001A] rounded-4xl px-4 py-2 transition-all duration-100"
        >
          Home
        </Link>
        <Link
          to="/marketplace"
          className="font-semibold mr-5 text-lg hover:text-[#098409] hover:bg-[#0000001A] rounded-4xl px-4 py-2 transition-all duration-100"
        >
          Marketplace
        </Link>
        {/* <Link
          to="/aboutus"
          className="font-semibold mr-5 text-lg hover:text-[#098409] hover:bg-[#0000001A] rounded-4xl px-4 py-2 transition-all duration-100"
        >
          About Us
        </Link> */}
        {!isLoggedIn ? (
          <>
            <Link
              to="/login"
              className="logbtn font-semibold hover:text-[#098409] rounded-4xl px-4 py-2 mr-7.5 text-lg transition-all duration-100"
            >
              Login
            </Link>
          </>
        ) : (
          <>
            <div className="relative mr-5">
              <button onClick={handleOpenNotifications} className="accbtn h-8 w-8 rounded-full flex items-center justify-center hover:bg-[#0000001A] relative cursor-pointer">
                <Bell size={16} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] leading-none px-1.5 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>
              {notifOpen && (
                <div ref={notifRef} className="absolute right-2 top-14 w-80 bg-white border border-gray-300 rounded-xl shadow-lg z-50">
                  <div className="flex items-center justify-between px-4 py-2 border-b">
                    <span className="font-semibold">Notifications</span>
                    {unreadCount > 0 && (
                      <button onClick={handleMarkAllRead} className="text-xs text-[#098409] hover:underline">Mark all read</button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-auto">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-6 text-sm text-gray-500">No notifications</div>
                    ) : (
                      notifications.map((n) => (
                        <div key={n.id} className={`px-4 py-3 text-sm ${n.status === 'unread' ? 'bg-green-50' : ''} border-b`}> 
                          <div className="font-medium">{n.subject}</div>
                          <div className="text-gray-600 mt-0.5">{n.message}</div>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-xs text-gray-400">{new Date(n.created_at).toLocaleString()}</span>
                            {n.status === 'unread' && (
                              <button onClick={() => handleMarkRead(n.id)} className="text-xs text-[#098409] hover:underline">Mark read</button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            <div
              onClick={() => setMenuOpen(!menuOpen)}
              className="accbtn mr-7.5 transition-all duration-100 h-8 w-8 bg-[#098409] text-white rounded-full flex items-center justify-center font-medium text-lg cursor-pointer hover:bg-[#077307]"
            >
              {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || "U"}
            </div>
            {menuOpen && (
              <div ref={menuRef} className="absolute right-2 top-17 w-50 flex flex-col bg-white border border-gray-300 rounded-xl shadow-lg z-50 hover:overflow-hidden">
                <div
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex gap-2 font-semibold"
                  onClick={() => setMenuOpen(!menuOpen) & navigate("/account")}
                >
                  <UserRoundCog color="#098409" /> Profile
                </div>
                <hr className="border-gray-300" />
                <div
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex gap-2 font-semibold"
                  onClick={handleLogout}
                >
                  <LogOut color="#ff5858" /> Logout
                </div>
                {isAdmin && <hr className="border-gray-300" />}
                {isAdmin && (
                  <div
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex gap-2 font-semibold text-[#143153ff]"
                    onClick={() => setMenuOpen(!menuOpen) & navigate("/admin")}
                  >
                    <ShieldUser color="#143153ff" className="overflow-hidden" />{" "}
                    Admin Controls
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default NavBar;
