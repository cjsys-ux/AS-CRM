import { motion, AnimatePresence } from 'motion/react';
import { Palette, Plus, Search, Eye, Edit2, Trash2, Download, ChevronLeft, ChevronRight, User, Calendar, Image as ImageIcon, FileText } from 'lucide-react';
import { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { DesignOrderDetailView } from './DesignOrderDetailView';

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-c0840c88`;

type DesignProject = {
  id: string;
  name: string;
  client: string;
  designer: string;
  status: string;
  type: string;
  createdDate: string;
  dueDate: string;
  revisions: number;
  thumbnail: string;
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Approved':
      return 'bg-green-100 text-green-700 border-green-200';
    case 'Ready':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'Revision':
      return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'Pending':
      return 'bg-slate-100 text-slate-700 border-slate-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

// Fake data for testing
const fakeProjects: DesignProject[] = [
  {
    id: 'DES-2401',
    name: 'Corporate Logo Redesign',
    client: 'TechCorp Industries',
    designer: 'Sarah Johnson',
    status: 'Approved',
    type: 'Logo Design',
    createdDate: '2026-02-12',
    dueDate: '2026-02-25',
    revisions: 3,
    thumbnail: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=200&h=200&fit=crop'
  },
  {
    id: 'DES-2402',
    name: 'Product Packaging Design',
    client: 'Fresh Foods Co',
    designer: 'Mike Chen',
    status: 'Ready',
    type: 'Packaging Design',
    createdDate: '2026-02-14',
    dueDate: '2026-02-28',
    revisions: 2,
    thumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=200&h=200&fit=crop'
  },
  {
    id: 'DES-2403',
    name: 'T-Shirt Graphics',
    client: 'Urban Wear Boutique',
    designer: 'Lisa Martinez',
    status: 'Revision',
    type: 'Apparel Design',
    createdDate: '2026-02-10',
    dueDate: '2026-02-22',
    revisions: 5,
    thumbnail: 'https://images.unsplash.com/photo-1609921212029-bb5a28e60960?w=200&h=200&fit=crop'
  },
  {
    id: 'DES-2404',
    name: 'Marketing Brochure',
    client: 'Global Solutions LLC',
    designer: 'David Park',
    status: 'Pending',
    type: 'Print Design',
    createdDate: '2026-02-18',
    dueDate: '2026-03-05',
    revisions: 0,
    thumbnail: 'https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=200&h=200&fit=crop'
  },
  {
    id: 'DES-2405',
    name: 'Social Media Graphics Pack',
    client: 'Influence Marketing',
    designer: 'Emma Wilson',
    status: 'Ready',
    type: 'Marketing Materials',
    createdDate: '2026-02-15',
    dueDate: '2026-02-26',
    revisions: 1,
    thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=200&h=200&fit=crop'
  },
  {
    id: 'DES-2406',
    name: 'Custom Water Bottle Design',
    client: 'Hydrate Plus',
    designer: 'Alex Turner',
    status: 'Approved',
    type: 'Product Design',
    createdDate: '2026-02-08',
    dueDate: '2026-02-20',
    revisions: 4,
    thumbnail: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=200&h=200&fit=crop'
  },
  {
    id: 'DES-2407',
    name: 'Event Banner Design',
    client: 'Summit Conference Center',
    designer: 'Sarah Johnson',
    status: 'Pending',
    type: 'Print Design',
    createdDate: '2026-02-19',
    dueDate: '2026-03-01',
    revisions: 0,
    thumbnail: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=200&h=200&fit=crop'
  },
  {
    id: 'DES-2408',
    name: 'Business Card Design',
    client: 'Executive Consulting Group',
    designer: 'Mike Chen',
    status: 'Revision',
    type: 'Print Design',
    createdDate: '2026-02-13',
    dueDate: '2026-02-24',
    revisions: 2,
    thumbnail: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=200&h=200&fit=crop'
  },
];

export function DesignLabModule() {
  const [projects, setProjects] = useState<DesignProject[]>(fakeProjects);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [isDetailViewOpen, setIsDetailViewOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<DesignProject | null>(null);

  // Fetch design projects from database
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/design-projects`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setProjects(data.projects || []);
      } else {
        console.error('Error fetching design projects:', data.error);
      }
    } catch (error) {
      console.error('Error fetching design projects:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Comment out fetch for now to use fake data
    // fetchProjects();
  }, []);

  const handleDeleteProject = async (projectId: string) => {
    try {
      const response = await fetch(`${API_URL}/design-projects/${projectId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        await fetchProjects();
      } else {
        console.error('Error deleting design project:', data.error);
      }
    } catch (error) {
      console.error('Error deleting design project:', error);
    }
  };

  // Calculate KPIs
  const totalProjects = projects.length;
  const inProgressCount = projects.filter(p => p.status === 'In Progress').length;
  const inReviewCount = projects.filter(p => p.status === 'In Review').length;
  const completedCount = projects.filter(p => p.status === 'Completed' || p.status === 'Approved').length;

  // Filter and pagination
  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.designer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All Status' || project.status === statusFilter;
    const matchesType = typeFilter === 'All Types' || project.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const totalPages = Math.ceil(filteredProjects.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedProjects = filteredProjects.slice(startIndex, endIndex);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleRowsPerPageChange = (value: number) => {
    setRowsPerPage(value);
    setCurrentPage(1);
  };

  return (
    <>
      {/* Design Order Detail View - Full Screen */}
      {isDetailViewOpen && selectedProject ? (
        <DesignOrderDetailView
          project={selectedProject}
          onBack={() => setIsDetailViewOpen(false)}
          onEdit={() => {
            setIsDetailViewOpen(false);
            // Open edit drawer here
          }}
          onDelete={() => {
            setIsDetailViewOpen(false);
            handleDeleteProject(selectedProject.id);
          }}
        />
      ) : (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-600 relative overflow-hidden">
        {/* Animated Background Elements */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [0, -90, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute bottom-0 left-0 w-80 h-80 bg-white/10 rounded-full blur-3xl"
        />

        <div className="relative z-10 max-w-[1800px] mx-auto px-4 md:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-0"
          >
            <div className="flex items-center gap-4">
              <motion.div
                whileHover={{ scale: 1.05, rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-xl"
              >
                <Palette className="w-8 h-8 text-white" />
              </motion.div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">Design Lab</h1>
                <p className="text-pink-50">Create, manage, and review design projects</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-8 py-4 bg-white text-pink-600 font-bold rounded-2xl shadow-2xl hover:shadow-pink-500/20 transition-all"
            >
              <Plus className="w-5 h-5" />
              New Design
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="px-8 -mt-6 mb-6 relative z-10">
        <div className="max-w-[1800px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xl"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Palette className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-xs font-medium text-slate-600 mb-1">Total Projects</p>
              <motion.h3
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-3xl font-bold text-slate-900"
              >
                {totalProjects}
              </motion.h3>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xl"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Edit2 className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-xs font-medium text-slate-600 mb-1">In Progress</p>
              <motion.h3
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-3xl font-bold text-slate-900"
              >
                {inProgressCount}
              </motion.h3>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xl"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Eye className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-xs font-medium text-slate-600 mb-1">In Review</p>
              <motion.h3
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-3xl font-bold text-slate-900"
              >
                {inReviewCount}
              </motion.h3>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xl"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                  <ImageIcon className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-xs font-medium text-slate-600 mb-1">Completed</p>
              <motion.h3
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-3xl font-bold text-slate-900"
              >
                {completedCount}
              </motion.h3>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="px-8 mb-6">
        <div className="max-w-[1800px] mx-auto">
          <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-xl p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search designs, clients, or designers..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white border-2 border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all shadow-sm"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-5 py-3 bg-white border-2 border-slate-200 rounded-2xl text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all shadow-sm"
              >
                <option>All Status</option>
                <option>Pending</option>
                <option>Ready</option>
                <option>Revision</option>
                <option>Approved</option>
              </select>

              {/* Type Filter */}
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-5 py-3 bg-white border-2 border-slate-200 rounded-2xl text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all shadow-sm"
              >
                <option>All Types</option>
                <option>Logo Design</option>
                <option>Packaging Design</option>
                <option>Apparel Design</option>
                <option>Print Design</option>
                <option>Marketing Materials</option>
                <option>Product Design</option>
              </select>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-fuchsia-600 text-white font-semibold rounded-2xl hover:shadow-xl transition-all shadow-lg"
              >
                <Download className="w-4 h-4" />
                Export
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Table Container with Horizontal Scroll */}
      <div className="flex-1 px-8 pb-8 overflow-hidden">
        <div className="max-w-[1800px] mx-auto h-full">
          <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-2xl overflow-hidden h-full flex flex-col">
            <div className="overflow-x-auto flex-1">
              <table className="w-full min-w-[1400px]">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-gradient-to-r from-slate-50 via-slate-100 to-slate-50 border-b-2 border-slate-200">
                    <th className="px-6 py-5 text-left text-xs font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap">
                      Thumbnail
                    </th>
                    <th className="px-6 py-5 text-left text-xs font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap">
                      Project ID
                    </th>
                    <th className="px-6 py-5 text-left text-xs font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap">
                      Project Name
                    </th>
                    <th className="px-6 py-5 text-left text-xs font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap">
                      Client
                    </th>
                    <th className="px-6 py-5 text-left text-xs font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap">
                      Designer
                    </th>
                    <th className="px-6 py-5 text-left text-xs font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap">
                      Type
                    </th>
                    <th className="px-6 py-5 text-left text-xs font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap">
                      Status
                    </th>
                    <th className="px-6 py-5 text-left text-xs font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap">
                      Created
                    </th>
                    <th className="px-6 py-5 text-left text-xs font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap">
                      Due Date
                    </th>
                    <th className="px-6 py-5 text-left text-xs font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap">
                      Revisions
                    </th>
                    <th className="px-6 py-5 text-center text-xs font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  <AnimatePresence mode="popLayout">
                    {paginatedProjects.length === 0 ? (
                      <tr>
                        <td colSpan={11} className="px-8 py-20">
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center justify-center text-center"
                          >
                            <motion.div
                              animate={{ 
                                y: [0, -10, 0],
                              }}
                              transition={{ 
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut" 
                              }}
                              className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl flex items-center justify-center mb-6 shadow-lg"
                            >
                              <Palette className="w-12 h-12 text-slate-400" />
                            </motion.div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-2">No Design Projects Yet</h3>
                            <p className="text-slate-500 mb-6 max-w-md">
                              Get started by creating your first design project to manage and track creative work.
                            </p>
                          </motion.div>
                        </td>
                      </tr>
                    ) : (
                      paginatedProjects.map((project, index) => (
                        <motion.tr
                          key={project.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ delay: index * 0.03 }}
                          className="border-b border-slate-100 group hover:bg-slate-50"
                        >
                          <td className="px-6 py-5">
                            <motion.img
                              whileHover={{ scale: 1.2, rotate: 5 }}
                              src={project.thumbnail}
                              alt={project.name}
                              className="w-20 h-20 rounded-xl object-cover border-2 border-slate-200 shadow-md cursor-pointer"
                            />
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-slate-400" />
                              <span className="text-sm font-medium text-slate-900">{project.id}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <span className="text-sm font-medium text-slate-900">{project.name}</span>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <User className="w-4 h-4 text-blue-600" />
                              </div>
                              <span className="text-sm text-slate-700">{project.client}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <span className="text-sm text-slate-700">{project.designer}</span>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <span className="text-sm text-slate-700">{project.type}</span>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium border ${getStatusColor(project.status)}`}>
                              {project.status}
                            </span>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-slate-400" />
                              <span className="text-sm text-slate-700">{project.createdDate}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-red-400" />
                              <span className="text-sm text-slate-700">{project.dueDate}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <span className="text-sm font-semibold text-slate-900">{project.revisions}</span>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <div className="flex items-center justify-center gap-2">
                              <motion.button
                                whileHover={{ scale: 1.15, backgroundColor: 'rgb(219 234 254)' }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                  setSelectedProject(project);
                                  setIsDetailViewOpen(true);
                                }}
                                className="p-1.5 hover:bg-blue-50 rounded-md transition-colors group/btn border-2 border-transparent hover:border-blue-200"
                                title="View"
                              >
                                <Eye className="w-4 h-4 text-slate-400 group-hover/btn:text-blue-600" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.15, backgroundColor: 'rgb(243 244 246)' }}
                                whileTap={{ scale: 0.95 }}
                                className="p-1.5 hover:bg-slate-100 rounded-md transition-colors group/btn border-2 border-transparent hover:border-slate-200"
                                title="Edit"
                              >
                                <Edit2 className="w-4 h-4 text-slate-400 group-hover/btn:text-slate-600" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.15, backgroundColor: 'rgb(254 226 226)' }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleDeleteProject(project.id)}
                                className="p-1.5 hover:bg-red-50 rounded-md transition-colors group/btn border-2 border-transparent hover:border-red-200"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4 text-slate-400 group-hover/btn:text-red-600" />
                              </motion.button>
                            </div>
                          </td>
                        </motion.tr>
                      ))
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Pagination */}
      <div className="px-8 pb-8">
        <div className="max-w-[1800px] mx-auto">
          <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <label className="text-sm font-bold text-slate-700">Rows per page:</label>
                <select
                  value={rowsPerPage}
                  onChange={(e) => handleRowsPerPageChange(Number(e.target.value))}
                  className="px-5 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span className="text-sm text-slate-600 font-medium">
                  Showing <span className="font-bold text-slate-900">{startIndex + 1}</span> to <span className="font-bold text-slate-900">{Math.min(endIndex, filteredProjects.length)}</span> of <span className="font-bold text-slate-900">{filteredProjects.length}</span> projects
                </span>
              </div>
              <div className="flex items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-6 py-3 bg-slate-100 border-2 border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-6 py-3 bg-gradient-to-r from-pink-500 to-fuchsia-600 text-white rounded-xl text-sm font-bold hover:shadow-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-lg"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
      )}
    </>
  );
}