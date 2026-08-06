import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Inbox, FolderKanban, Users, ChevronRight, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar = ({ unreadCount, isMobileOpen = false, onCloseMobileSidebar }) => {
  const { role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const userRole = role ? role.toLowerCase() : 'developer';

  const menuItemsConfig = [
    {
      id: 'dashboard',
      path: '/admin/overview',
      label: 'Overview & Analytics',
      icon: LayoutDashboard,
      allowedRoles: ['developer', 'admin', 'superadmin']
    },
    {
      id: 'inquiries',
      path: '/admin/inquiries',
      label: 'Inquiries Manager',
      icon: Inbox,
      badge: unreadCount,
      allowedRoles: ['developer', 'admin', 'superadmin']
    },
    {
      id: 'projects',
      path: '/admin/projects',
      label: 'Project Manager',
      icon: FolderKanban,
      allowedRoles: ['admin', 'superadmin']
    },
    {
      id: 'team',
      path: '/admin/team',
      label: 'Team Manager',
      icon: Users,
      allowedRoles: ['superadmin']
    }
  ];

  // Role-gated sidebar links filter
  const visibleMenuItems = menuItemsConfig.filter((item) =>
    item.allowedRoles.includes(userRole)
  );

  const handleNavClick = (path) => {
    navigate(path);
    if (onCloseMobileSidebar) {
      onCloseMobileSidebar();
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay (<1024px) */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onCloseMobileSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container: Fixed Slide-over Drawer on Mobile/Tablet (<1024px), Static Column on Desktop (≥1024px) */}
      <aside
        className={`
          fixed top-16 bottom-0 left-0 z-50 w-72 bg-[#0a0a0f] border-r border-white/10 p-4 flex flex-col justify-between transition-transform duration-300 ease-in-out
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:w-64 lg:z-auto lg:min-h-[calc(100vh-4rem)] lg:glass-panel lg:bg-transparent
        `}
      >
        <div className="space-y-1.5">
          <div className="flex items-center justify-between px-3 mb-2">
            <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500">Navigation</p>
            <button
              onClick={onCloseMobileSidebar}
              className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
              aria-label="Close navigation"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {visibleMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.path)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-gradient-to-r from-[#00f3ff]/20 to-[#9d4edd]/20 border border-[#00f3ff]/40 text-white shadow-lg shadow-[#00f3ff]/10'
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-[#00f3ff]' : 'text-slate-500 group-hover:text-slate-300'}`} />
                  <span>{item.label}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#00f3ff] text-slate-950 shadow-sm shadow-[#00f3ff]/50">
                      {item.badge}
                    </span>
                  )}
                  <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isActive ? 'text-[#00f3ff] translate-x-0.5' : 'text-slate-600 opacity-0 group-hover:opacity-100'}`} />
                </div>
              </button>
            );
          })}
        </div>

        <div className="p-3 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-slate-400 font-mono mt-6 lg:mt-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-slate-500 uppercase">System Status</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <p className="text-white font-semibold">MongoDB Atlas Live</p>
          <p className="text-[10px] text-slate-500 mt-1 capitalize">Role: <span className="text-[#00f3ff] font-bold">{userRole}</span></p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
