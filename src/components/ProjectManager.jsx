import React, { useState } from 'react';
import { Plus, Edit2, Trash2, ExternalLink, Star, Search, Sparkles, FolderGit2 } from 'lucide-react';

const GithubIcon = (props) => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

export const ProjectManager = ({ projects, loading, onCreateProject, onUpdateProject, onDeleteProject }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    category: 'Web3',
    image: '',
    liveUrl: '',
    githubUrl: '',
    tags: '',
    featured: false,
    client: ''
  });

  const projectList = Array.isArray(projects) ? projects : [];

  const openCreateModal = () => {
    setEditingProject(null);
    setFormData({
      title: '',
      subtitle: '',
      description: '',
      category: 'Web3',
      image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop',
      liveUrl: 'https://example.com',
      githubUrl: 'https://github.com',
      tags: 'React, Three.js, Node.js, Tailwind CSS',
      featured: true,
      client: 'Bespoke Client'
    });
    setIsModalOpen(true);
  };

  const openEditModal = (project) => {
    setEditingProject(project);
    setFormData({
      title: project.title || '',
      subtitle: project.subtitle || '',
      description: project.description || '',
      category: project.category || 'Web3',
      image: project.image || '',
      liveUrl: project.liveUrl || '',
      githubUrl: project.githubUrl || '',
      tags: Array.isArray(project.tags) ? project.tags.join(', ') : project.tags || '',
      featured: Boolean(project.featured),
      client: project.client || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingProject) {
        await onUpdateProject(editingProject._id, formData);
      } else {
        await onCreateProject(formData);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Form submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = projectList.filter((p) =>
    (p.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.category || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400 font-mono animate-pulse flex items-center justify-center gap-3">
        <div className="w-5 h-5 border-2 border-[#00f3ff] border-t-transparent rounded-full animate-spin" />
        <span>Loading projects from MongoDB database...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            Project <span className="gradient-text">Manager</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Create, update, and manage 3D portfolio projects stored in MongoDB.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="w-full sm:w-auto glow-button px-5 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Project</span>
        </button>
      </div>

      {/* Control Bar */}
      <div className="glass-panel p-3.5 sm:p-4 rounded-2xl border border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-full sm:max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search projects by title, category, or stack..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-800 focus:border-[#00f3ff] rounded-xl text-sm text-white focus:outline-none transition-colors"
          />
        </div>

        <span className="text-xs font-mono text-slate-400 text-right sm:text-left">
          Showing {filtered.length} of {projectList.length} Items
        </span>
      </div>

      {/* Data Container (Desktop Table & Mobile Cards) */}
      <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
        {/* Desktop Table View (≥768px) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/80 text-xs font-mono uppercase text-slate-400 border-b border-white/10">
              <tr>
                <th className="px-6 py-4">Thumbnail & Title</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Tech Stack</th>
                <th className="px-6 py-4">Links</th>
                <th className="px-6 py-4">Featured</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 font-mono">
                    <div className="flex flex-col items-center gap-2">
                      <FolderGit2 className="w-8 h-8 text-slate-600" />
                      <span>No projects found in MongoDB collection.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item._id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-14 h-10 object-cover rounded-lg border border-white/10 shadow-md bg-slate-900 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-white leading-snug">{item.title}</div>
                          <div className="text-xs text-slate-400 line-clamp-1">{item.subtitle || item.description}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#00f3ff]/10 text-[#00f3ff] border border-[#00f3ff]/30">
                        {item.category}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {(item.tags || []).slice(0, 3).map((tag, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
                            {tag}
                          </span>
                        ))}
                        {(item.tags || []).length > 3 && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-500">
                            +{(item.tags || []).length - 3}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {item.liveUrl && (
                          <a href={item.liveUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-[#00f3ff] min-w-[36px] min-h-[36px] flex items-center justify-center">
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                        {item.githubUrl && (
                          <a href={item.githubUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-[#9d4edd] min-w-[36px] min-h-[36px] flex items-center justify-center">
                            <GithubIcon className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.featured ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/30">
                          <Star className="w-3 h-3 fill-amber-400" />
                          Featured
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500 font-mono">Standard</span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-2.5 rounded-xl text-slate-400 hover:text-[#00f3ff] hover:bg-[#00f3ff]/10 border border-transparent hover:border-[#00f3ff]/30 transition-all min-w-[40px] min-h-[40px]"
                        title="Edit Project"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteProject(item._id)}
                        className="p-2.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/30 transition-all min-w-[40px] min-h-[40px]"
                        title="Delete Project"
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

        {/* Mobile Card List View (<768px) */}
        <div className="md:hidden divide-y divide-white/10 p-4 space-y-4">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-slate-500 font-mono flex flex-col items-center gap-2">
              <FolderGit2 className="w-8 h-8 text-slate-600" />
              <span>No projects found.</span>
            </div>
          ) : (
            filtered.map((item) => (
              <div key={item._id} className="pt-4 first:pt-0 space-y-3">
                <div className="flex items-start gap-3">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-16 h-12 object-cover rounded-lg border border-white/10 shadow-md bg-slate-900 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-bold text-white text-base truncate">{item.title}</h4>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#00f3ff]/10 text-[#00f3ff] border border-[#00f3ff]/30 shrink-0">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">{item.subtitle || item.description}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="flex flex-wrap gap-1">
                    {(item.tags || []).slice(0, 3).map((tag, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    {item.featured && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/30">
                        <Star className="w-2.5 h-2.5 fill-amber-400" />
                        Featured
                      </span>
                    )}
                    {item.liveUrl && (
                      <a href={item.liveUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-[#00f3ff]">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {item.githubUrl && (
                      <a href={item.githubUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-[#9d4edd]">
                        <GithubIcon className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
                  <button
                    onClick={() => openEditModal(item)}
                    className="flex-1 py-2 px-3 rounded-xl text-slate-300 hover:text-[#00f3ff] bg-slate-900 border border-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5 min-h-[40px]"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => onDeleteProject(item._id)}
                    className="py-2 px-3 rounded-xl text-rose-400 hover:bg-rose-500/10 bg-slate-900 border border-rose-500/20 text-xs font-semibold flex items-center justify-center gap-1.5 min-h-[40px]"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create / Edit Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="glass-panel max-w-lg w-full p-4 sm:p-6 rounded-2xl border border-[#00f3ff]/30 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto my-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#00f3ff]" />
                {editingProject ? 'Edit Portfolio Project' : 'Create New Project'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs font-mono px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 min-h-[36px]"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Project Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 focus:border-[#00f3ff] rounded-xl text-sm text-white focus:outline-none"
                    placeholder="e.g. Aetheria 3D NFT Exchange"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 focus:border-[#00f3ff] rounded-xl text-sm text-white focus:outline-none"
                  >
                    <option value="Web3">Web3</option>
                    <option value="SaaS">SaaS</option>
                    <option value="Interactive">Interactive</option>
                    <option value="E-commerce">E-commerce</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Subtitle / Short Tagline</label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 focus:border-[#00f3ff] rounded-xl text-sm text-white focus:outline-none"
                  placeholder="e.g. Next-Gen 3D WebGL Trading Engine"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Full Description *</label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 focus:border-[#00f3ff] rounded-xl text-sm text-white focus:outline-none"
                  placeholder="Comprehensive description of the architecture, tech features, and client results..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Live Web URL *</label>
                  <input
                    type="url"
                    required
                    value={formData.liveUrl}
                    onChange={(e) => setFormData({ ...formData, liveUrl: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 focus:border-[#00f3ff] rounded-xl text-sm text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">GitHub Repository URL *</label>
                  <input
                    type="url"
                    required
                    value={formData.githubUrl}
                    onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 focus:border-[#00f3ff] rounded-xl text-sm text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Image Thumbnail URL *</label>
                <div className="flex gap-3 items-center">
                  <input
                    type="url"
                    required
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="flex-1 px-3.5 py-2.5 bg-slate-900 border border-slate-800 focus:border-[#00f3ff] rounded-xl text-sm text-white focus:outline-none"
                  />
                  {formData.image && (
                    <img src={formData.image} alt="Preview" className="w-12 h-9 object-cover rounded-lg border border-white/10 shrink-0" />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Tech Stack Tags (Comma Separated)</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 focus:border-[#00f3ff] rounded-xl text-sm text-white focus:outline-none"
                  placeholder="React, Three.js, Node.js, Express, MongoDB"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-800 bg-slate-900 text-[#00f3ff] focus:ring-0"
                />
                <label htmlFor="featured" className="text-xs sm:text-sm text-slate-300 font-medium cursor-pointer">
                  Feature this project on main showcase
                </label>
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-mono text-slate-400 hover:text-white bg-slate-800 min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto glow-button px-6 py-2.5 rounded-xl text-xs font-bold text-white disabled:opacity-50 min-h-[44px]"
                >
                  {isSubmitting ? 'Saving...' : (editingProject ? 'Save Changes' : 'Create Project')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectManager;
