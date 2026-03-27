import React, { useState, useEffect } from 'react';
import { Project, Customer } from '../types';
import { storageService } from '../services/storageService';
import { Briefcase, Plus, Search, Edit3, X, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newProject, setNewProject] = useState<Partial<Project>>({
    customerId: '',
    title: '',
    status: 'Quoted',
    totalAmount: 0,
    paidAmount: 0
  });

  useEffect(() => {
    setProjects(storageService.getProjects());
    setCustomers(storageService.getCustomers());
  }, []);

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    const customer = customers.find(c => c.id === newProject.customerId);
    const project: Project = {
      ...newProject as Project,
      id: Math.random().toString(36).substr(2, 9),
      customerName: customer?.name || 'Unknown',
      createdAt: new Date().toISOString()
    };
    storageService.saveProject(project);
    setProjects(storageService.getProjects());
    setIsAdding(false);
    setNewProject({ customerId: '', title: '', status: 'Quoted', totalAmount: 0, paidAmount: 0 });
  };

  const updateStatus = (id: string, status: Project['status']) => {
    const projects = storageService.getProjects();
    const project = projects.find(p => p.id === id);
    if (project) {
      project.status = status;
      storageService.saveProject(project);
      setProjects(storageService.getProjects());
    }
  };

  const filteredProjects = projects.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusColors = {
    'Quoted': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    'In-Progress': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    'Completed': 'bg-green-500/10 text-green-500 border-green-500/20',
    'Billed': 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20'
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-[#F27D26] transition-all"
          />
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 bg-[#F27D26] text-black font-bold py-3 px-6 rounded-xl hover:bg-[#ff8c3a] transition-all active:scale-95 shadow-lg shadow-[#F27D26]/20"
        >
          <Plus size={20} />
          <span>New Project</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredProjects.map((project) => (
          <motion.div
            layout
            key={project.id}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:border-zinc-700 transition-all"
          >
            <div className="flex items-center gap-6 flex-1">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${statusColors[project.status]}`}>
                <Briefcase size={24} />
              </div>
              <div>
                <h4 className="text-lg font-bold text-white">{project.title}</h4>
                <div className="flex items-center gap-4 mt-1">
                  <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold">{project.customerName}</p>
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${statusColors[project.status]}`}>
                    {project.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-12">
              <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Project Value</p>
                <p className="text-lg font-mono font-bold text-white">₹{project.totalAmount.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Payment Progress</p>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 transition-all duration-500" 
                      style={{ width: `${(project.paidAmount / project.totalAmount) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs font-mono font-bold text-zinc-400">
                    {Math.round((project.paidAmount / project.totalAmount) * 100)}%
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={project.status}
                  onChange={(e) => project.id && updateStatus(project.id, e.target.value as any)}
                  className="bg-zinc-800 border-none text-xs rounded-lg px-3 py-2 focus:ring-1 ring-[#F27D26]"
                >
                  <option>Quoted</option>
                  <option>In-Progress</option>
                  <option>Completed</option>
                  <option>Billed</option>
                </select>
                <button className="p-2 text-zinc-500 hover:text-white transition-colors">
                  <Edit3 size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
        {filteredProjects.length === 0 && (
          <div className="py-20 text-center text-zinc-500 text-sm italic">
            No projects found. Create a new project to track progress.
          </div>
        )}
      </div>

      {/* Add Project Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-zinc-900 border border-zinc-800 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
                <h3 className="text-xl font-black italic tracking-tighter text-[#F27D26] uppercase">New Project</h3>
                <button onClick={() => setIsAdding(false)} className="p-2 text-zinc-500 hover:text-white">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleAddProject} className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2 space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Project Title</label>
                    <input
                      required
                      type="text"
                      value={newProject.title}
                      onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                      className="w-full bg-zinc-800 border-none rounded-xl py-3 px-4 text-sm focus:ring-1 ring-[#F27D26]"
                      placeholder="e.g. Home Theater Acoustic Treatment"
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Customer</label>
                    <select
                      required
                      value={newProject.customerId}
                      onChange={(e) => setNewProject({ ...newProject, customerId: e.target.value })}
                      className="w-full bg-zinc-800 border-none rounded-xl py-3 px-4 text-sm focus:ring-1 ring-[#F27D26]"
                    >
                      <option value="">Select a customer</option>
                      {customers.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Total Amount (₹)</label>
                    <input
                      required
                      type="number"
                      value={newProject.totalAmount}
                      onChange={(e) => setNewProject({ ...newProject, totalAmount: Number(e.target.value) })}
                      className="w-full bg-zinc-800 border-none rounded-xl py-3 px-4 text-sm focus:ring-1 ring-[#F27D26]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Initial Status</label>
                    <select
                      value={newProject.status}
                      onChange={(e) => setNewProject({ ...newProject, status: e.target.value as any })}
                      className="w-full bg-zinc-800 border-none rounded-xl py-3 px-4 text-sm focus:ring-1 ring-[#F27D26]"
                    >
                      <option>Quoted</option>
                      <option>In-Progress</option>
                      <option>Completed</option>
                      <option>Billed</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="px-6 py-3 text-sm font-bold text-zinc-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-2 bg-[#F27D26] text-black font-bold py-3 px-8 rounded-xl hover:bg-[#ff8c3a] transition-all active:scale-95"
                  >
                    <Save size={18} />
                    <span>Create Project</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
