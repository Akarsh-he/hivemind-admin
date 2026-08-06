import React, { useState } from 'react';
import { Search, Mail, CheckCircle2, Trash2, Eye, Calendar, DollarSign, Briefcase, Clock, AlertCircle } from 'lucide-react';

export const InquiriesManager = ({ inquiries, loading, onUpdateStatus, onDeleteInquiry }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all | new | in-progress | resolved
  const [selectedInquiry, setSelectedInquiry] = useState(null);

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-400 font-mono animate-pulse">
        ⚡ Loading contact form inquiries from database...
      </div>
    );
  }

  // Filtering
  const filtered = (inquiries || []).filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.projectType.toLowerCase().includes(searchQuery.toLowerCase());

    const itemStatus = item.status || (item.read ? 'resolved' : 'new');

    if (statusFilter === 'new') return matchesSearch && itemStatus === 'new';
    if (statusFilter === 'in-progress') return matchesSearch && itemStatus === 'in-progress';
    if (statusFilter === 'resolved') return matchesSearch && itemStatus === 'resolved';
    return matchesSearch;
  });

  const getStatusBadge = (status, read) => {
    const currentStatus = status || (read ? 'resolved' : 'new');

    if (currentStatus === 'new') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-[#00f3ff]/15 text-[#00f3ff] border border-[#00f3ff]/40">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00f3ff] animate-ping" />
          New
        </span>
      );
    }
    if (currentStatus === 'in-progress') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-amber-400/15 text-amber-400 border border-amber-400/40">
          <Clock className="w-3 h-3" />
          In Progress
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-emerald-400/15 text-emerald-400 border border-emerald-400/40">
        <CheckCircle2 className="w-3 h-3" />
        Resolved
      </span>
    );
  };

  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            Inquiries <span className="gradient-text">Manager</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Review, track, and manage client project submissions from the public portfolio contact form.
          </p>
        </div>
      </div>

      {/* Control Bar: Search & Status Filter */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 glass-panel p-3.5 sm:p-4 rounded-2xl border border-white/10">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by client name, email, or project type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-800 focus:border-[#00f3ff] rounded-xl text-sm text-white focus:outline-none transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {[
            { id: 'all', label: `All (${inquiries.length})` },
            { id: 'new', label: `New (${inquiries.filter(i => (i.status || 'new') === 'new' && !i.read).length})` },
            { id: 'in-progress', label: `In Progress (${inquiries.filter(i => i.status === 'in-progress').length})` },
            { id: 'resolved', label: `Resolved (${inquiries.filter(i => i.status === 'resolved' || i.read).length})` }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all min-h-[38px] ${
                statusFilter === tab.id
                  ? 'bg-[#00f3ff]/20 text-[#00f3ff] border border-[#00f3ff]/40 shadow-sm'
                  : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Datatable Container */}
      <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
        {/* Desktop Table View (≥768px) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/80 text-xs font-mono uppercase text-slate-400 border-b border-white/10">
              <tr>
                <th className="px-6 py-4">Client Name & Email</th>
                <th className="px-6 py-4">Project Type</th>
                <th className="px-6 py-4">Budget</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status & Pipeline</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 font-mono">
                    No inquiries found matching criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item._id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-white flex items-center gap-2">
                        <span>{item.name}</span>
                      </div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">{item.email}</div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#9d4edd]/10 text-[#9d4edd] border border-[#9d4edd]/30">
                        <Briefcase className="w-3 h-3" />
                        {item.projectType}
                      </span>
                    </td>

                    <td className="px-6 py-4 font-mono text-xs text-slate-200 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                        <DollarSign className="w-3 h-3" />
                        {item.budget}
                      </span>
                    </td>

                    <td className="px-6 py-4 font-mono text-xs text-slate-400 whitespace-nowrap">
                      {new Date(item.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getStatusBadge(item.status, item.read)}
                        <select
                          value={item.status || (item.read ? 'resolved' : 'new')}
                          onChange={(e) => onUpdateStatus(item._id, { status: e.target.value, read: e.target.value === 'resolved' })}
                          className="bg-slate-900 text-xs font-mono text-slate-300 border border-slate-800 rounded-lg px-2 py-1 focus:outline-none focus:border-[#00f3ff]"
                        >
                          <option value="new">Mark New</option>
                          <option value="in-progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                        </select>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedInquiry(item)}
                        className="p-2.5 rounded-xl text-slate-400 hover:text-[#00f3ff] hover:bg-[#00f3ff]/10 border border-transparent hover:border-[#00f3ff]/30 transition-all min-w-[40px] min-h-[40px]"
                        title="View Full Message"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteInquiry(item._id)}
                        className="p-2.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/30 transition-all min-w-[40px] min-h-[40px]"
                        title="Delete Submission"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards View (<768px) */}
        <div className="md:hidden divide-y divide-white/10 p-4 space-y-4">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-slate-500 font-mono">
              No inquiries found matching criteria.
            </div>
          ) : (
            filtered.map((item) => (
              <div key={item._id} className="pt-4 first:pt-0 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-white text-base">{item.name}</h4>
                    <p className="text-xs text-[#00f3ff] font-mono">{item.email}</p>
                  </div>
                  {getStatusBadge(item.status, item.read)}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#9d4edd]/10 text-[#9d4edd] border border-[#9d4edd]/30">
                    <Briefcase className="w-3 h-3" />
                    {item.projectType}
                  </span>
                  <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                    <DollarSign className="w-3 h-3" />
                    {item.budget}
                  </span>
                  <span className="text-slate-500">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/5">
                  <select
                    value={item.status || (item.read ? 'resolved' : 'new')}
                    onChange={(e) => onUpdateStatus(item._id, { status: e.target.value, read: e.target.value === 'resolved' })}
                    className="bg-slate-900 text-xs font-mono text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none flex-1 max-w-[150px] min-h-[38px]"
                  >
                    <option value="new">Mark New</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedInquiry(item)}
                      className="px-3 py-2 rounded-xl text-slate-300 hover:text-[#00f3ff] bg-slate-900 border border-slate-800 text-xs font-semibold flex items-center gap-1 min-h-[38px]"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#00f3ff]" />
                      <span>View</span>
                    </button>
                    <button
                      onClick={() => onDeleteInquiry(item._id)}
                      className="p-2 rounded-xl text-rose-400 hover:bg-rose-500/10 bg-slate-900 border border-rose-500/20 text-xs font-semibold min-w-[38px] min-h-[38px] flex items-center justify-center"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Inquiry Detail Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="glass-panel max-w-lg w-full p-4 sm:p-6 rounded-2xl border border-[#00f3ff]/30 shadow-2xl relative space-y-4 max-h-[85vh] overflow-y-auto my-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white">{selectedInquiry.name}</h3>
                <p className="text-xs font-mono text-[#00f3ff]">{selectedInquiry.email}</p>
              </div>
              <button
                onClick={() => setSelectedInquiry(null)}
                className="text-slate-400 hover:text-white text-xs font-mono px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 min-h-[36px]"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
                <span className="text-slate-500 block mb-1">Project Type</span>
                <span className="text-white font-bold">{selectedInquiry.projectType}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
                <span className="text-slate-500 block mb-1">Estimated Budget</span>
                <span className="text-emerald-400 font-bold">{selectedInquiry.budget}</span>
              </div>
            </div>

            <div className="p-3.5 sm:p-4 rounded-xl bg-slate-900/90 border border-white/10 text-xs sm:text-sm text-slate-200 leading-relaxed max-h-52 overflow-y-auto whitespace-pre-wrap">
              {selectedInquiry.message}
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-white/10">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-500">Pipeline Status:</span>
                <select
                  value={selectedInquiry.status || (selectedInquiry.read ? 'resolved' : 'new')}
                  onChange={(e) => {
                    const newStatus = e.target.value;
                    onUpdateStatus(selectedInquiry._id, { status: newStatus, read: newStatus === 'resolved' });
                    setSelectedInquiry({ ...selectedInquiry, status: newStatus, read: newStatus === 'resolved' });
                  }}
                  className="bg-slate-900 text-xs font-mono text-white border border-[#00f3ff]/40 rounded-lg px-2.5 py-1.5 focus:outline-none min-h-[36px]"
                >
                  <option value="new">New</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>

              <span className="text-xs font-mono text-slate-500 flex items-center justify-end gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#00f3ff]" />
                {new Date(selectedInquiry.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InquiriesManager;
