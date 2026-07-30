import React from 'react';
import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid 
} from 'recharts';
import { Mail, MailWarning, FolderKanban, Users, TrendingUp, Sparkles } from 'lucide-react';

export const AnalyticsDashboard = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className="p-8 text-center text-slate-400 font-mono animate-pulse">
        ⚡ Computing real-time database telemetry...
      </div>
    );
  }

  const metrics = stats?.metrics || {
    totalInquiries: 0,
    unreadInquiries: 0,
    totalProjects: 0,
    totalTeam: 0
  };

  const monthlyTrends = stats?.monthlyTrends || [
    { month: 'Jan', inquiries: 2 },
    { month: 'Feb', inquiries: 5 },
    { month: 'Mar', inquiries: 8 },
    { month: 'Apr', inquiries: 12 },
    { month: 'May', inquiries: 7 },
    { month: 'Jun', inquiries: 15 }
  ];

  const categoryBreakdown = stats?.categoryBreakdown || [
    { name: 'Web3', count: 4 },
    { name: 'SaaS', count: 6 },
    { name: 'Interactive', count: 3 },
    { name: 'E-commerce', count: 2 }
  ];

  const metricCards = [
    {
      title: 'Total Inquiries',
      value: metrics.totalInquiries,
      icon: Mail,
      color: '#00f3ff',
      trend: '+24% this month'
    },
    {
      title: 'Unread Inquiries',
      value: metrics.unreadInquiries,
      icon: MailWarning,
      color: '#ff007f',
      trend: 'Requires review'
    },
    {
      title: 'Active Projects',
      value: metrics.totalProjects,
      icon: FolderKanban,
      color: '#9d4edd',
      trend: 'Public Portfolio'
    },
    {
      title: 'Team Members',
      value: metrics.totalTeam,
      icon: Users,
      color: '#ffb703',
      trend: 'Engineering team'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            Overview <span className="gradient-text">& Analytics</span>
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Real-time telemetry and business metrics across client portfolio and database models.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-panel border border-[#00f3ff]/30 text-xs font-mono text-[#00f3ff]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>MongoDB Sync Active</span>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {metricCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="glass-panel p-5 rounded-2xl border border-white/10 hover:border-[#00f3ff]/40 transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400">{card.title}</span>
                <div
                  className="p-2.5 rounded-xl transition-transform group-hover:scale-110"
                  style={{ backgroundColor: `${card.color}15`, color: card.color }}
                >
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              <div className="mt-4">
                <h3 className="text-3xl font-extrabold text-white tracking-tight">{card.value}</h3>
                <div className="flex items-center gap-1.5 mt-2 text-xs font-mono text-slate-400">
                  <TrendingUp className="w-3.5 h-3.5 text-[#00f3ff]" />
                  <span>{card.trend}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recharts Analytics Graphs Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Inquiries Trend (AreaChart) */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-white">Client Inquiry Volume</h3>
              <p className="text-xs text-slate-400">Monthly contact form submissions from public portfolio website</p>
            </div>
            <span className="text-xs font-mono text-[#00f3ff] bg-[#00f3ff]/10 px-2.5 py-1 rounded-full border border-[#00f3ff]/30">
              Live Trend
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorInquiries" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00f3ff" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#00f3ff" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#12121c',
                    borderColor: '#00f3ff',
                    borderRadius: '12px',
                    color: '#fff'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="inquiries"
                  stroke="#00f3ff"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorInquiries)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Project Category Distribution (BarChart) */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-white">Project Categories</h3>
              <p className="text-xs text-slate-400">Portfolio domain breakdown</p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#12121c',
                    borderColor: '#9d4edd',
                    borderRadius: '12px',
                    color: '#fff'
                  }}
                />
                <Bar dataKey="count" fill="#9d4edd" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
