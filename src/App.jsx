import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import api, { onColdStartChange } from './services/api';
import { Loader2, Server } from 'lucide-react';
import { useAuth } from './context/AuthContext';
import Login from './components/Login';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import InquiriesManager from './components/InquiriesManager';
import ProjectManager from './components/ProjectManager';
import TeamManager from './components/TeamManager';
import Toast from './components/Toast';
import RequireRole from './components/RequireRole';

export function App() {
  const { admin, authLoading, loginError, login, logout, checkAuth } = useAuth();
  const [toast, setToast] = useState(null);
  const [isColdStarting, setIsColdStarting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onColdStartChange((pending) => {
      setIsColdStarting(pending);
    });
    return () => unsubscribe();
  }, []);

  // Data states
  const [stats, setStats] = useState(null);
  const [inquiries, setInquiries] = useState([]);
  const [projects, setProjects] = useState([]);
  const [team, setTeam] = useState([]);
  const [adminUsers, setAdminUsers] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);

  const showToast = useCallback((type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const handleUnauthorized = useCallback((message) => {
    showToast('error', message || 'Access Denied: Insufficient permissions.');
  }, [showToast]);

  // Helper to extract array safely from API responses
  const extractArray = (settledRes) => {
    if (!settledRes || settledRes.status !== 'fulfilled' || !settledRes.value || !settledRes.value.data) return [];
    const val = settledRes.value.data;
    if (Array.isArray(val)) return val;
    if (Array.isArray(val.users)) return val.users;
    if (Array.isArray(val.data)) return val.data;
    if (Array.isArray(val.team)) return val.team;
    return [];
  };

  // Fetch view data whenever admin is logged in or location changes
  const refreshData = useCallback(async () => {
    if (!admin) return;
    setDataLoading(true);
    try {
      const [statsRes, inquiriesRes, projectsRes, teamRes, adminUsersRes] = await Promise.allSettled([
        api.get('/admin/stats'),
        api.get('/contact'),
        api.get('/projects'),
        api.get('/team'),
        api.get('/admin/users')
      ]);

      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
      if (inquiriesRes.status === 'fulfilled') setInquiries(extractArray(inquiriesRes));
      if (projectsRes.status === 'fulfilled') setProjects(extractArray(projectsRes));
      if (teamRes.status === 'fulfilled') setTeam(extractArray(teamRes));
      
      if (adminUsersRes.status === 'fulfilled') {
        setAdminUsers(extractArray(adminUsersRes));
      } else if (adminUsersRes.status === 'rejected') {
        console.error('Error loading team users:', adminUsersRes.reason);
        showToast('error', 'Failed to load team members from server');
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setDataLoading(false);
    }
  }, [admin, showToast]);

  useEffect(() => {
    if (admin) {
      refreshData();
    }
  }, [admin, location.pathname, refreshData]);

  // Auth Handlers
  const handleLogin = async (credentials) => {
    const res = await login(credentials);
    if (res.success) {
      showToast('success', `Welcome back, ${res.admin.name}!`);
      navigate('/admin/overview');
    }
  };

  const handleLogout = async () => {
    await logout();
    showToast('success', 'Logged out successfully');
    navigate('/admin/login');
  };

  // Inquiries Handlers
  const handleUpdateInquiryStatus = async (id, updatePayload) => {
    try {
      await api.patch(`/contact/${id}`, updatePayload);
      setInquiries((prev) => prev.map((i) => (i._id === id ? { ...i, ...updatePayload } : i)));
      refreshData();
      showToast('success', 'Inquiry status updated');
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to update inquiry status');
    }
  };

  const handleDeleteInquiry = async (id) => {
    if (!window.confirm('Are you sure you want to delete this contact submission?')) return;
    try {
      await api.delete(`/contact/${id}`);
      setInquiries((prev) => prev.filter((i) => i._id !== id));
      refreshData();
      showToast('success', 'Inquiry deleted');
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to delete inquiry');
    }
  };

  // Project Handlers
  const handleCreateProject = async (projectData) => {
    try {
      await api.post('/projects', projectData);
      showToast('success', 'Project created successfully');
      refreshData();
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to create project');
    }
  };

  const handleUpdateProject = async (id, projectData) => {
    try {
      await api.put(`/projects/${id}`, projectData);
      showToast('success', 'Project updated successfully');
      refreshData();
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to update project');
    }
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm('Are you sure you want to delete this portfolio project?')) return;
    try {
      await api.delete(`/projects/${id}`);
      showToast('success', 'Project deleted successfully');
      refreshData();
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to delete project');
    }
  };

  // Unified Member & User Handlers
  const handleToggleUserVisibility = async (id, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      const res = await api.patch(`/admin/users/${id}/visibility`, { isDisplayedOnWebsite: newStatus });
      const updatedUser = res.data.data;
      setAdminUsers((prev) =>
        prev.map((u) => (u._id === id || u.id === id ? { ...u, isDisplayedOnWebsite: updatedUser.isDisplayedOnWebsite } : u))
      );
      showToast('success', res.data.message || `Website visibility ${newStatus ? 'enabled' : 'disabled'}`);
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to update website visibility');
    }
  };

  const handleCreateUser = async (userData) => {
    try {
      const res = await api.post('/admin/users', userData);
      showToast('success', res.data.message || 'Team member created successfully');
      refreshData();
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to create team member');
    }
  };

  const handleUpdateUser = async (id, userData) => {
    try {
      const res = await api.put(`/admin/users/${id}`, userData);
      showToast('success', res.data.message || 'Team member profile updated successfully');
      refreshData();
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to update member profile');
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this team member account?')) return;
    try {
      const res = await api.delete(`/admin/users/${id}`);
      showToast('success', res.data.message || 'Team member deleted successfully');
      refreshData();
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to delete team member');
    }
  };

  // Member Role Management Handler
  const handleUpdateUserRole = async (id, newRole) => {
    try {
      const res = await api.patch(`/admin/role/${id}`, { role: newRole });
      const updatedUser = res.data.data;
      setAdminUsers((prev) =>
        prev.map((u) => (u._id === id || u.id === id ? { ...u, role: updatedUser.role } : u))
      );
      showToast('success', res.data.message || `User role updated to ${newRole} successfully`);
      if (admin && (admin.id === id || admin._id === id)) {
        checkAuth();
      }
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update user role';
      showToast('error', msg);
      return { success: false, message: msg };
    }
  };

  if (authLoading && !admin) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center text-slate-400 font-mono">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-[#00f3ff] border-t-transparent rounded-full animate-spin" />
          <span>Verifying Admin Credentials...</span>
        </div>
      </div>
    );
  }

  if (!admin) {
    return (
      <>
        {isColdStarting && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-lg w-[90%] sm:w-auto animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="px-4 py-3 rounded-2xl bg-[#0a0a0f]/95 border border-[#00f3ff]/40 text-white shadow-[0_0_30px_rgba(0,243,255,0.25)] backdrop-blur-md flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-[#00f3ff] animate-spin shrink-0" />
              <div className="text-xs">
                <span className="font-bold text-[#00f3ff] font-mono flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 inline" /> Connecting to Live Server...
                </span>
                <p className="text-slate-300 mt-0.5 text-[11px] leading-tight">
                  Render free instance cold-start in progress (~30–50s).
                </p>
              </div>
            </div>
          </div>
        )}
        <Routes>
          <Route path="/admin/login" element={<Login onLogin={handleLogin} loading={authLoading} error={loginError} />} />
          <Route path="*" element={<Navigate to="/admin/login" replace />} />
        </Routes>
      </>
    );
  }

  const unreadCount = inquiries.filter((i) => !i.read).length;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-slate-100 flex flex-col font-sans">
      {isColdStarting && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-lg w-[90%] sm:w-auto animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="px-4 py-3 rounded-2xl bg-[#0a0a0f]/95 border border-[#00f3ff]/40 text-white shadow-[0_0_30px_rgba(0,243,255,0.25)] backdrop-blur-md flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-[#00f3ff] animate-spin shrink-0" />
            <div className="text-xs">
              <span className="font-bold text-[#00f3ff] font-mono flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 inline" /> Connecting to Live Server...
              </span>
              <p className="text-slate-300 mt-0.5 text-[11px] leading-tight">
                Render free instance cold-start in progress (~30–50s).
              </p>
            </div>
          </div>
        </div>
      )}

      <Navbar admin={admin} onLogout={handleLogout} />

      <div className="flex flex-1">
        <Sidebar unreadCount={unreadCount} />

        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl">
          <Routes>
            <Route path="/admin/overview" element={<AnalyticsDashboard stats={stats} loading={dataLoading} />} />
            
            <Route
              path="/admin/inquiries"
              element={
                <RequireRole allowedRoles={['developer', 'admin', 'superadmin']} onUnauthorized={handleUnauthorized}>
                  <InquiriesManager
                    inquiries={inquiries}
                    loading={dataLoading}
                    onUpdateStatus={handleUpdateInquiryStatus}
                    onDeleteInquiry={handleDeleteInquiry}
                  />
                </RequireRole>
              }
            />

            <Route
              path="/admin/projects"
              element={
                <RequireRole allowedRoles={['admin', 'superadmin']} onUnauthorized={handleUnauthorized}>
                  <ProjectManager
                    projects={projects}
                    loading={dataLoading}
                    onCreateProject={handleCreateProject}
                    onUpdateProject={handleUpdateProject}
                    onDeleteProject={handleDeleteProject}
                  />
                </RequireRole>
              }
            />

            <Route
              path="/admin/team"
              element={
                <RequireRole allowedRoles={['superadmin']} onUnauthorized={handleUnauthorized}>
                  <TeamManager
                    adminUsers={adminUsers}
                    loading={dataLoading}
                    onCreateUser={handleCreateUser}
                    onUpdateUser={handleUpdateUser}
                    onDeleteUser={handleDeleteUser}
                    onUpdateUserRole={handleUpdateUserRole}
                    onToggleUserVisibility={handleToggleUserVisibility}
                  />
                </RequireRole>
              }
            />

            <Route path="/admin" element={<Navigate to="/admin/overview" replace />} />
            <Route path="/" element={<Navigate to="/admin/overview" replace />} />
            <Route path="*" element={<Navigate to="/admin/overview" replace />} />
          </Routes>
        </main>
      </div>

      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </div>
  );
}

export default App;
