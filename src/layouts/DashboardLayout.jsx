import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Megaphone,
  CheckSquare,
  GraduationCap,
  User,
  Bell,
  LogOut,
  Menu,
  X,
  Wallet,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getFileUrl } from '../services/api';

export const DashboardLayout = () => {
  const { user, logout, refreshUser } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarPhotoError, setSidebarPhotoError] = useState(false);
  const [headerPhotoError, setHeaderPhotoError] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Keep wallet balance and user profile updated on navigation
  useEffect(() => {
    if (refreshUser) {
      refreshUser();
    }
  }, [location.pathname]);

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Campaigns', path: '/campaigns', icon: Megaphone },
    { label: 'Tasks & Proofs', path: '/tasks', icon: CheckSquare },
    { label: 'Trainings & Certs', path: '/trainings', icon: GraduationCap },
    { label: 'My Profile', path: '/profile', icon: User },
    { label: 'Notifications', path: '/notifications', icon: Bell },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const photoUrl = user?.photo ? getFileUrl(user.photo) : '';
  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'BA';

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-black border border-slate-700/80 p-1 flex items-center justify-center shrink-0 shadow-md">
              <img
                src="/logo.png"
                alt="Ailocity Logo"
                className="w-full h-full object-contain rounded-lg"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <span className="hidden text-white font-black text-lg">A</span>
            </div>
            <div>
              <h1 className="text-base font-black tracking-wide text-white">AILOCITY</h1>
              <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider block -mt-0.5">
                Associate Portal
              </span>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* User Card inside Sidebar */}
        <div className="p-3 mx-3 my-3 bg-slate-800/40 rounded-xl border border-slate-800 flex items-center gap-3">
          {photoUrl && !sidebarPhotoError ? (
            <img
              src={photoUrl}
              alt="Avatar"
              onError={() => setSidebarPhotoError(true)}
              className="w-9 h-9 rounded-full object-cover border border-slate-700 shrink-0"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center font-bold text-white text-xs shrink-0">
              {initials}
            </div>
          )}
          <div className="overflow-hidden flex-1">
            <p className="text-xs font-semibold text-white truncate">{user?.name || 'Business Associate'}</p>
            <p className="text-[11px] text-slate-400 truncate">{user?.phone || user?.email || 'Field Associate'}</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  isActive
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon size={17} className={isActive ? 'text-white' : 'text-slate-400'} />
                <span className="flex-1">{item.label}</span>
                {isActive && <ChevronRight size={14} />}
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer / Logout */}
        <div className="p-3 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-rose-400 hover:text-white hover:bg-rose-600/20 transition-colors border border-rose-500/20"
          >
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 lg:px-8 flex items-center justify-between z-30 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <Menu size={18} />
            </button>
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-orange-50 text-orange-700 border border-orange-200/60 hidden sm:inline-block">
              BA Ground Workforce
            </span>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Wallet Box */}
            <div className="flex items-center gap-2 bg-emerald-50/70 border border-emerald-200 px-3 py-1.5 rounded-lg">
              <div className="w-5 h-5 rounded-md bg-emerald-500 text-white flex items-center justify-center">
                <Wallet size={12} />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-[10px] uppercase font-semibold text-emerald-700">Wallet:</span>
                <span className="text-xs font-bold text-emerald-950">
                  ₹{user?.walletBalance !== undefined ? user.walletBalance.toLocaleString() : 0}
                </span>
              </div>
            </div>

            {/* Notification Bell */}
            <NavLink
              to="/notifications"
              className="p-2 border border-slate-200 text-slate-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors relative"
              title="Notifications"
            >
              <Bell size={17} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
            </NavLink>

            {/* User Profile Quick Link */}
            <NavLink to="/profile" className="flex items-center gap-2 hover:opacity-85 transition-opacity">
              {photoUrl && !headerPhotoError ? (
                <img
                  src={photoUrl}
                  alt={user?.name || 'Avatar'}
                  onError={() => setHeaderPhotoError(true)}
                  className="w-8 h-8 rounded-full object-cover border border-slate-200 hover:border-orange-500 transition-colors"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                  {initials}
                </div>
              )}
            </NavLink>
          </div>
        </header>

        {/* Dynamic Nested Route Content (<Outlet />) - Expanded Full Width */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 w-full min-w-0 bg-slate-50/60">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
