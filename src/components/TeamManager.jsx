import React, { useState, useRef } from 'react';
import { Plus, Edit2, Trash2, Mail, Search, Users, Shield, ShieldAlert, Lock, Eye, EyeOff, Check, X, Upload, Loader2, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const GithubIcon = (props) => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const LinkedinIcon = (props) => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

export const TeamManager = ({
  adminUsers = [],
  team = [],
  loading = false,
  onCreateUser,
  onUpdateUser,
  onDeleteUser,
  onUpdateUserRole,
  onToggleUserVisibility
}) => {
  const { role: currentUserRole } = useAuth();
  const isSuperAdmin = currentUserRole?.toLowerCase() === 'superadmin';

  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const fileInputRef = useRef(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [avatarInputMode, setAvatarInputMode] = useState('file'); // 'file' | 'url'

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'developer',
    isDisplayedOnWebsite: true,
    designation: 'Software Architect',
    bio: '',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop',
    skills: '',
    github: '',
    linkedin: '',
    twitter: ''
  });

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400 font-mono animate-pulse flex flex-col items-center justify-center gap-3 glass-panel rounded-2xl border border-white/10 my-6">
        <div className="w-6 h-6 border-2 border-[#00f3ff] border-t-transparent rounded-full animate-spin" />
        <span>⚡ Synchronizing team members & user permissions from MongoDB database...</span>
      </div>
    );
  }

  const openCreateModal = () => {
    setEditingUser(null);
    const initialAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop';
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'developer',
      isDisplayedOnWebsite: true,
      designation: 'Software Engineer',
      bio: 'Full-stack software architect specializing in modern WebGL applications and scalable microservices.',
      avatarUrl: initialAvatar,
      skills: 'React.js, Node.js, Express, Three.js, MongoDB',
      github: 'https://github.com',
      linkedin: 'https://linkedin.com',
      twitter: 'https://x.com'
    });
    setAvatarPreview(initialAvatar);
    setUploadError(null);
    setUploadingAvatar(false);
    setAvatarInputMode('file');
    setIsModalOpen(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    const initialAvatar = user.avatarUrl || user.avatar || '';
    setFormData({
      name: user.name || '',
      email: user.email || '',
      password: '',
      role: user.role || 'developer',
      isDisplayedOnWebsite: Boolean(user.isDisplayedOnWebsite),
      designation: user.designation || user.roleTitle || 'Software Engineer',
      bio: user.bio || '',
      avatarUrl: initialAvatar,
      skills: Array.isArray(user.skills) ? user.skills.join(', ') : user.skills || '',
      github: user.socialLinks?.github || '',
      linkedin: user.socialLinks?.linkedin || '',
      twitter: user.socialLinks?.twitter || ''
    });
    setAvatarPreview(initialAvatar);
    setUploadError(null);
    setUploadingAvatar(false);
    setAvatarInputMode('file');
    setIsModalOpen(true);
  };

  const handleAvatarFileChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    // Validate image MIME type
    if (!file.type.startsWith('image/')) {
      setUploadError('Invalid file format. Please select an image file (.jpg, .png, .webp, .svg, .gif).');
      return;
    }

    // Validate size limit (5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setUploadError('Image size exceeds 5MB limit. Please select a smaller image file.');
      return;
    }

    setUploadError(null);

    // Create local object URL for instant preview
    const objectUrl = URL.createObjectURL(file);
    setAvatarPreview(objectUrl);
    setUploadingAvatar(true);

    try {
      const data = new FormData();
      data.append('image', file);

      const res = await api.post('/upload', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (res.data && (res.data.secure_url || res.data.url)) {
        const uploadedUrl = res.data.secure_url || res.data.url;
        setFormData((prev) => ({ ...prev, avatarUrl: uploadedUrl }));
        setAvatarPreview(uploadedUrl);
      } else {
        setUploadError('Failed to obtain image URL from server.');
      }
    } catch (err) {
      console.error('Error streaming image to Cloudinary:', err);
      setUploadError(err.response?.data?.message || 'Failed to upload image to Cloudinary.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      name: formData.name,
      email: formData.email,
      role: formData.role,
      isDisplayedOnWebsite: formData.isDisplayedOnWebsite,
      designation: formData.designation,
      bio: formData.bio,
      avatarUrl: formData.avatarUrl,
      skills: formData.skills,
      socialLinks: {
        github: formData.github,
        linkedin: formData.linkedin,
        twitter: formData.twitter,
        email: formData.email
      }
    };

    if (formData.password) {
      payload.password = formData.password;
    }

    const uId = editingUser ? (editingUser._id || editingUser.id) : null;
    if (editingUser && uId) {
      onUpdateUser(uId, payload);
    } else {
      onCreateUser(payload);
    }
    setIsModalOpen(false);
  };

  const handleRoleChange = async (userId, newRole) => {
    setUpdatingId(userId);
    if (onUpdateUserRole) {
      await onUpdateUserRole(userId, newRole);
    }
    setUpdatingId(null);
  };

  const handleVisibilityToggle = async (userId, currentStatus) => {
    setUpdatingId(userId);
    if (onToggleUserVisibility) {
      await onToggleUserVisibility(userId, currentStatus);
    }
    setUpdatingId(null);
  };

  const renderRoleBadge = (roleName) => {
    const r = roleName ? roleName.toLowerCase() : 'developer';
    if (r === 'superadmin') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-400/10 text-amber-400 border border-amber-400/30 shadow-sm shadow-amber-400/10">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          Super Admin
        </span>
      );
    } else if (r === 'admin') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#9d4edd]/10 text-[#9d4edd] border border-[#9d4edd]/30 shadow-sm shadow-[#9d4edd]/10">
          <span className="w-1.5 h-1.5 rounded-full bg-[#9d4edd]" />
          Admin
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30 shadow-sm shadow-blue-500/10">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
          Developer
        </span>
      );
    }
  };

  const baseMembers = (Array.isArray(adminUsers) && adminUsers.length > 0)
    ? adminUsers
    : (Array.isArray(team) && team.length > 0 ? team : []);

  const filteredMembers = baseMembers.filter((m) =>
    (m.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (m.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (m.designation || m.roleTitle || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (m.role || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            Team & User <span className="gradient-text">Manager</span>
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Unified directory combining system access roles (RBAC) and public portfolio website profiles.
          </p>
        </div>

        {isSuperAdmin && (
          <button
            onClick={openCreateModal}
            className="glow-button px-5 py-3 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>Add Member Account</span>
          </button>
        )}
      </div>

      {/* Control Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search member by name, email, designation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-800 focus:border-[#00f3ff] rounded-xl text-sm text-white focus:outline-none transition-colors font-mono"
          />
        </div>

        <div className="flex items-center gap-4 justify-between md:justify-end">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-white/10 text-xs font-mono">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-[#00f3ff]/20 text-[#00f3ff] font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              Grid Card View
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-[#00f3ff]/20 text-[#00f3ff] font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              Datatable View
            </button>
          </div>

          <span className="text-xs font-mono text-slate-400">
            {adminUsers.length} Total Members Registered
          </span>
        </div>
      </div>

      {/* GRID CARD VIEW */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.length === 0 ? (
            <div className="col-span-full glass-panel p-12 text-center rounded-2xl border border-white/10 text-slate-400 font-mono space-y-4 my-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center mx-auto text-slate-500">
                <Users className="w-6 h-6 text-slate-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">No Team Members Found</h3>
                <p className="text-xs text-slate-400 font-mono mt-1">
                  {searchQuery ? `No members match search query "${searchQuery}".` : "No team members are registered in MongoDB."}
                </p>
              </div>
              {isSuperAdmin && !searchQuery && (
                <button
                  onClick={openCreateModal}
                  className="glow-button px-5 py-2.5 rounded-xl text-xs font-bold inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add First Team Member</span>
                </button>
              )}
            </div>
          ) : (
            filteredMembers.map((member) => {
              const uId = member._id || member.id;
              const isUpdating = updatingId === uId;

              return (
                <div
                  key={uId}
                  className="glass-panel p-6 rounded-2xl border border-white/10 hover:border-[#00f3ff]/40 transition-all flex flex-col justify-between space-y-4 relative group"
                >
                  {/* Top Bar: Role & Website Visibility Toggle */}
                  <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3">
                    {renderRoleBadge(member.role)}

                    {/* Website Visibility Switch */}
                    {isSuperAdmin ? (
                      <button
                        onClick={() => handleVisibilityToggle(uId, member.isDisplayedOnWebsite)}
                        disabled={isUpdating}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono transition-all ${
                          member.isDisplayedOnWebsite
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                            : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
                        }`}
                        title="Toggle Portfolio Website Visibility"
                      >
                        {member.isDisplayedOnWebsite ? (
                          <>
                            <Eye className="w-3.5 h-3.5 text-emerald-400" />
                            <span>On Website</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                            <span>Hidden</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${member.isDisplayedOnWebsite ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                        {member.isDisplayedOnWebsite ? 'Website Visible' : 'Internal Only'}
                      </span>
                    )}
                  </div>

                  {/* Member Profile Main Header */}
                  <div className="flex items-start gap-4">
                    <img
                      src={member.avatarUrl || member.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop'}
                      alt={member.name}
                      className="w-14 h-14 object-cover rounded-2xl border border-[#00f3ff]/40 shadow-lg flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-bold text-white leading-tight truncate">{member.name}</h3>
                      <p className="text-xs text-[#00f3ff] font-mono mt-0.5 truncate">{member.designation || member.roleTitle || 'Software Engineer'}</p>
                      <p className="text-[11px] text-slate-400 font-mono mt-1 truncate">{member.email}</p>
                    </div>
                  </div>

                  {/* Bio */}
                  {member.bio && (
                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed font-sans">
                      {member.bio}
                    </p>
                  )}

                  {/* Skills */}
                  {member.skills && member.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {member.skills.slice(0, 4).map((skill, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800/80 text-slate-300 border border-white/5">
                          {skill}
                        </span>
                      ))}
                      {member.skills.length > 4 && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-500">
                          +{member.skills.length - 4}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Super Admin Control Bar: Change Role & Actions */}
                  <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                    {/* Role Dropdown */}
                    {isSuperAdmin ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono text-slate-500">Role:</span>
                        <select
                          disabled={isUpdating}
                          value={member.role ? member.role.toLowerCase() : 'developer'}
                          onChange={(e) => handleRoleChange(uId, e.target.value)}
                          className="px-2.5 py-1 bg-slate-900 border border-slate-700 hover:border-[#00f3ff] focus:border-[#00f3ff] rounded-lg text-xs font-mono text-white focus:outline-none cursor-pointer transition-colors"
                        >
                          <option value="developer">Developer</option>
                          <option value="admin">Admin</option>
                          <option value="superadmin">Super Admin</option>
                        </select>
                      </div>
                    ) : (
                      <span className="text-[10px] font-mono text-slate-500 capitalize">Role: {member.role}</span>
                    )}

                    {/* Action Buttons */}
                    {isSuperAdmin && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(member)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-[#00f3ff] hover:bg-[#00f3ff]/10 border border-transparent hover:border-[#00f3ff]/30 transition-all"
                          title="Edit Profile & Permissions"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteUser(uId)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/30 transition-all"
                          title="Delete Account"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* DATATABLE VIEW */}
      {viewMode === 'table' && (
        <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900/80 text-xs font-mono uppercase text-slate-400 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4">Member & Designation</th>
                  <th className="px-6 py-4">RBAC System Role</th>
                  <th className="px-6 py-4">Website Visibility</th>
                  <th className="px-6 py-4">Skills</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-mono">
                      No members found in database.
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((member) => {
                    const uId = member._id || member.id;
                    const isUpdating = updatingId === uId;

                    return (
                      <tr key={uId} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={member.avatarUrl || member.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop'}
                              alt={member.name}
                              className="w-10 h-10 object-cover rounded-full border border-[#00f3ff]/40 shadow-md"
                            />
                            <div>
                              <div className="font-bold text-white leading-snug">{member.name}</div>
                              <div className="text-xs text-[#00f3ff] font-mono">{member.designation || member.roleTitle || 'Software Engineer'}</div>
                              <div className="text-[11px] text-slate-400 font-mono">{member.email}</div>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          {isSuperAdmin ? (
                            <div className="flex items-center gap-2">
                              <select
                                disabled={isUpdating}
                                value={member.role ? member.role.toLowerCase() : 'developer'}
                                onChange={(e) => handleRoleChange(uId, e.target.value)}
                                className="px-3 py-1.5 bg-slate-900 border border-slate-700 hover:border-[#00f3ff] focus:border-[#00f3ff] rounded-xl text-xs font-mono text-white focus:outline-none cursor-pointer transition-colors"
                              >
                                <option value="developer">Developer</option>
                                <option value="admin">Admin</option>
                                <option value="superadmin">Super Admin</option>
                              </select>
                            </div>
                          ) : (
                            renderRoleBadge(member.role)
                          )}
                        </td>

                        <td className="px-6 py-4">
                          {isSuperAdmin ? (
                            <button
                              onClick={() => handleVisibilityToggle(uId, member.isDisplayedOnWebsite)}
                              disabled={isUpdating}
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono transition-all ${
                                member.isDisplayedOnWebsite
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-slate-800 text-slate-400 border border-slate-700'
                              }`}
                            >
                              {member.isDisplayedOnWebsite ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5 text-slate-500" />}
                              <span>{member.isDisplayedOnWebsite ? 'Show on Website' : 'Hidden'}</span>
                            </button>
                          ) : (
                            <span className="text-xs font-mono text-slate-400">
                              {member.isDisplayedOnWebsite ? 'Visible' : 'Hidden'}
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {(member.skills || []).slice(0, 3).map((skill, idx) => (
                              <span key={idx} className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </td>

                        <td className="px-6 py-4 text-right space-x-2">
                          {isSuperAdmin && (
                            <>
                              <button
                                onClick={() => openEditModal(member)}
                                className="p-2 rounded-xl text-slate-400 hover:text-[#00f3ff] hover:bg-[#00f3ff]/10 border border-transparent hover:border-[#00f3ff]/30 transition-all"
                                title="Edit Profile"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => onDeleteUser(uId)}
                                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/30 transition-all"
                                title="Delete User"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Unified Member Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="glass-panel max-w-xl w-full p-4 sm:p-6 rounded-2xl border border-[#00f3ff]/30 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto my-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-[#00f3ff]" />
                {editingUser ? 'Edit Unified Member Profile' : 'Create New Member Account'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs font-mono px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 min-h-[36px]"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Credentials & System Role */}
              <div className="p-3.5 sm:p-4 rounded-xl bg-slate-900/80 border border-white/5 space-y-3">
                <p className="text-xs font-mono uppercase text-[#00f3ff] font-bold">1. System Access & RBAC Permissions</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-[#00f3ff] rounded-xl text-sm text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">Account Email *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-[#00f3ff] rounded-xl text-sm text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">System Role</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-[#00f3ff] rounded-xl text-sm text-white focus:outline-none font-mono"
                    >
                      <option value="developer">Developer</option>
                      <option value="admin">Admin</option>
                      <option value="superadmin">Super Admin</option>
                    </select>
                  </div>
                </div>

                {!editingUser && (
                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">Password (Leave blank for default: HiveMinds@2026)</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-[#00f3ff] rounded-xl text-sm text-white focus:outline-none font-mono"
                      placeholder="••••••••"
                    />
                  </div>
                )}
              </div>

              {/* Public Portfolio Profile Details */}
              <div className="p-3.5 sm:p-4 rounded-xl bg-slate-900/80 border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-mono uppercase text-[#9d4edd] font-bold">2. Public Portfolio Profile Data</p>
                  <label className="flex items-center gap-2 text-xs font-mono text-white cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isDisplayedOnWebsite}
                      onChange={(e) => setFormData({ ...formData, isDisplayedOnWebsite: e.target.checked })}
                      className="w-4 h-4 rounded text-[#00f3ff] focus:ring-0 cursor-pointer"
                    />
                    <span>Show on Website</span>
                  </label>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">Designation / Role Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-[#00f3ff] rounded-xl text-sm text-white focus:outline-none"
                    placeholder="e.g. Lead Full-Stack Architect"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">Short Bio</label>
                  <textarea
                    rows={2}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-[#00f3ff] rounded-xl text-sm text-white focus:outline-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[11px] font-mono text-slate-400">
                      Profile Picture / Avatar *
                    </label>
                    <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[10px] font-mono">
                      <button
                        type="button"
                        onClick={() => setAvatarInputMode('file')}
                        className={`px-2 py-0.5 rounded transition-colors ${avatarInputMode === 'file' ? 'bg-[#00f3ff]/20 text-[#00f3ff] font-bold' : 'text-slate-400 hover:text-white'}`}
                      >
                        Local Device File
                      </button>
                      <button
                        type="button"
                        onClick={() => setAvatarInputMode('url')}
                        className={`px-2 py-0.5 rounded transition-colors ${avatarInputMode === 'url' ? 'bg-[#00f3ff]/20 text-[#00f3ff] font-bold' : 'text-slate-400 hover:text-white'}`}
                      >
                        Image URL
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                    {/* Avatar Live Preview Box */}
                    <div className="relative group w-20 h-20 rounded-2xl overflow-hidden border-2 border-[#00f3ff]/40 bg-slate-900 flex-shrink-0 shadow-lg mx-auto sm:mx-0">
                      {avatarPreview || formData.avatarUrl ? (
                        <img
                          src={avatarPreview || formData.avatarUrl}
                          alt="Avatar Preview"
                          className="w-full h-full object-cover"
                          onError={() => setAvatarPreview('https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop')}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-600">
                          <ImageIcon className="w-8 h-8" />
                        </div>
                      )}

                      {/* Uploading Spinner Overlay */}
                      {uploadingAvatar && (
                        <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center text-center p-1 z-10 animate-in fade-in">
                          <Loader2 className="w-6 h-6 text-[#00f3ff] animate-spin mb-1" />
                          <span className="text-[9px] font-mono text-[#00f3ff] font-bold">Uploading...</span>
                        </div>
                      )}
                    </div>

                    {/* Controls */}
                    <div className="flex-1 min-w-0 space-y-2 w-full">
                      {avatarInputMode === 'file' ? (
                        <div>
                          <input
                            type="file"
                            ref={fileInputRef}
                            accept="image/*"
                            onChange={handleAvatarFileChange}
                            className="hidden"
                          />
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                            <button
                              type="button"
                              disabled={uploadingAvatar}
                              onClick={() => fileInputRef.current && fileInputRef.current.click()}
                              className="px-3.5 py-2 bg-slate-900 border border-slate-700 hover:border-[#00f3ff] focus:border-[#00f3ff] rounded-xl text-xs font-mono text-white flex items-center justify-center gap-2 transition-colors cursor-pointer hover:bg-slate-800 disabled:opacity-50 min-h-[40px]"
                            >
                              <Upload className="w-3.5 h-3.5 text-[#00f3ff]" />
                              <span>{uploadingAvatar ? 'Streaming to Cloudinary...' : 'Upload Image File'}</span>
                            </button>
                            <span className="text-[10px] font-mono text-slate-500 text-center sm:text-left">
                              Max 5MB • JPG, PNG, WEBP
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <input
                            type="url"
                            value={formData.avatarUrl}
                            onChange={(e) => {
                              setFormData({ ...formData, avatarUrl: e.target.value });
                              setAvatarPreview(e.target.value);
                            }}
                            placeholder="https://images.unsplash.com/..."
                            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-[#00f3ff] rounded-xl text-xs text-white focus:outline-none font-mono"
                          />
                        </div>
                      )}

                      {/* Upload Error Alert */}
                      {uploadError && (
                        <p className="text-xs text-rose-400 font-mono bg-rose-500/10 border border-rose-500/30 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                          <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                          <span>{uploadError}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">Skills & Specializations (Comma Separated)</label>
                  <input
                    type="text"
                    value={formData.skills}
                    onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-[#00f3ff] rounded-xl text-sm text-white focus:outline-none font-mono text-xs"
                    placeholder="React, Node.js, Three.js, MongoDB"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">GitHub URL</label>
                    <input
                      type="url"
                      value={formData.github}
                      onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-[#00f3ff] rounded-xl text-sm text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">LinkedIn URL</label>
                    <input
                      type="url"
                      value={formData.linkedin}
                      onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-[#00f3ff] rounded-xl text-sm text-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-mono text-slate-400 hover:text-white bg-slate-800 min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto glow-button px-6 py-2.5 rounded-xl text-xs font-bold text-white min-h-[44px]"
                >
                  {editingUser ? 'Save Unified Member' : 'Create Unified Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamManager;
