/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { LayoutDashboard, Package, Users, Briefcase, CreditCard, Menu, X, Search, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserProfile } from './types';
import { storageService } from './services/storageService';

// Components
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import Customers from './components/Customers';
import Projects from './components/Projects';
import Billing from './components/Billing';

type View = 'dashboard' | 'inventory' | 'customers' | 'projects' | 'billing';

export default function App() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const profile = storageService.getUserProfile();
    if (profile) {
      setUserProfile(profile);
    } else {
      const defaultProfile: UserProfile = {
        uid: 'local-admin',
        email: 'admin@acousticpro.local',
        displayName: 'AcousticPro Admin',
        role: 'admin'
      };
      storageService.setUserProfile(defaultProfile);
      setUserProfile(defaultProfile);
    }
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'projects', label: 'Projects', icon: Briefcase },
    { id: 'billing', label: 'Billing', icon: CreditCard },
  ];

  if (!userProfile) return null;

  return (
    <div className="flex min-h-screen bg-[#0a0a0a] text-zinc-100 font-sans selection:bg-[#F27D26] selection:text-white">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className="fixed left-0 top-0 h-full bg-zinc-900 border-r border-zinc-800 z-50 flex flex-col"
      >
        <div className="p-6 flex items-center justify-between">
          <AnimatePresence mode="wait">
            {isSidebarOpen ? (
              <motion.h1
                key="full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-xl font-black italic tracking-tighter text-[#F27D26]"
              >
                ACOUSTICPRO
              </motion.h1>
            ) : (
              <motion.div
                key="icon"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-8 h-8 bg-[#F27D26] rounded flex items-center justify-center text-black font-black"
              >
                A
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-400"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id as View)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all group ${
                currentView === item.id
                  ? 'bg-[#F27D26] text-black font-bold shadow-lg shadow-[#F27D26]/20'
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
              }`}
            >
              <item.icon size={20} className={currentView === item.id ? 'text-black' : 'text-zinc-500 group-hover:text-white'} />
              {isSidebarOpen && <span className="text-sm">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-zinc-800">
          <div className={`flex items-center gap-3 ${isSidebarOpen ? 'px-2' : 'justify-center'}`}>
            <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] font-bold">
              AD
            </div>
            {isSidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold truncate">{userProfile.displayName}</p>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest">{userProfile.role}</p>
              </div>
            )}
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main
        className="flex-1 transition-all duration-300"
        style={{ marginLeft: isSidebarOpen ? 280 : 80 }}
      >
        <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-8 bg-[#0a0a0a]/80 backdrop-blur-md sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400">
              {navItems.find(i => i.id === currentView)?.label}
            </h2>
          </div>
          <div className="flex items-center gap-6">
             <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                <input
                  type="text"
                  placeholder="Global search..."
                  className="bg-zinc-900 border border-zinc-800 rounded-full py-1.5 pl-10 pr-4 text-xs focus:outline-none focus:border-[#F27D26] w-64 transition-all"
                />
             </div>
             <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
                <TrendingUp size={14} className="text-green-500" />
                <span>Local Mode: Active</span>
             </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {currentView === 'dashboard' && <Dashboard />}
              {currentView === 'inventory' && <Inventory />}
              {currentView === 'customers' && <Customers />}
              {currentView === 'projects' && <Projects />}
              {currentView === 'billing' && <Billing />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
