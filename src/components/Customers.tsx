import React, { useState, useEffect } from 'react';
import { Customer } from '../types';
import { storageService } from '../services/storageService';
import { Users, Plus, Search, Trash2, Edit3, X, Save, Phone, Mail, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newCustomer, setNewCustomer] = useState<Partial<Customer>>({
    name: '',
    email: '',
    phone: '',
    address: '',
    totalSpent: 0,
    outstandingBalance: 0
  });

  useEffect(() => {
    setCustomers(storageService.getCustomers());
  }, []);

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    const customer: Customer = {
      ...newCustomer as Customer,
      id: Math.random().toString(36).substr(2, 9)
    };
    storageService.saveCustomer(customer);
    setCustomers(storageService.getCustomers());
    setIsAdding(false);
    setNewCustomer({ name: '', email: '', phone: '', address: '', totalSpent: 0, outstandingBalance: 0 });
  };

  const handleDelete = (id: string) => {
    storageService.deleteCustomer(id);
    setCustomers(storageService.getCustomers());
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
          <input
            type="text"
            placeholder="Search customers..."
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
          <span>Add Customer</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.map((customer) => (
          <motion.div
            layout
            key={customer.id}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6 group hover:border-zinc-700 transition-all shadow-xl hover:shadow-2xl"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center text-[#F27D26] font-black italic text-xl">
                  {customer.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">{customer.name}</h4>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Customer ID: {customer.id?.slice(-6)}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-2 text-zinc-500 hover:text-white transition-colors">
                  <Edit3 size={16} />
                </button>
                <button 
                  onClick={() => customer.id && handleDelete(customer.id)}
                  className="p-2 text-zinc-500 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-zinc-400">
                <Phone size={14} className="text-zinc-600" />
                <span>{customer.phone}</span>
              </div>
              {customer.email && (
                <div className="flex items-center gap-3 text-sm text-zinc-400">
                  <Mail size={14} className="text-zinc-600" />
                  <span className="truncate">{customer.email}</span>
                </div>
              )}
              {customer.address && (
                <div className="flex items-center gap-3 text-sm text-zinc-400">
                  <MapPin size={14} className="text-zinc-600" />
                  <span className="truncate">{customer.address}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-800">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Total Spent</p>
                <p className="text-sm font-mono font-bold text-white">₹{customer.totalSpent.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Outstanding</p>
                <p className={`text-sm font-mono font-bold ${customer.outstandingBalance > 0 ? 'text-red-500' : 'text-green-500'}`}>
                  ₹{customer.outstandingBalance.toLocaleString()}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
        {filteredCustomers.length === 0 && (
          <div className="col-span-full py-20 text-center text-zinc-500 text-sm italic">
            No customers found. Add your first customer to get started.
          </div>
        )}
      </div>

      {/* Add Customer Modal */}
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
                <h3 className="text-xl font-black italic tracking-tighter text-[#F27D26] uppercase">Add New Customer</h3>
                <button onClick={() => setIsAdding(false)} className="p-2 text-zinc-500 hover:text-white">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleAddCustomer} className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2 space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Customer Name</label>
                    <input
                      required
                      type="text"
                      value={newCustomer.name}
                      onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                      className="w-full bg-zinc-800 border-none rounded-xl py-3 px-4 text-sm focus:ring-1 ring-[#F27D26]"
                      placeholder="e.g. John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Phone Number</label>
                    <input
                      required
                      type="tel"
                      value={newCustomer.phone}
                      onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                      className="w-full bg-zinc-800 border-none rounded-xl py-3 px-4 text-sm focus:ring-1 ring-[#F27D26]"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Email Address</label>
                    <input
                      type="email"
                      value={newCustomer.email}
                      onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                      className="w-full bg-zinc-800 border-none rounded-xl py-3 px-4 text-sm focus:ring-1 ring-[#F27D26]"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Address</label>
                    <textarea
                      value={newCustomer.address}
                      onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                      className="w-full bg-zinc-800 border-none rounded-xl py-3 px-4 text-sm focus:ring-1 ring-[#F27D26] h-24 resize-none"
                      placeholder="Full address for billing..."
                    />
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
                    <span>Save Customer</span>
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
