import React, { useState, useEffect } from 'react';
import { Payment, Project, Customer } from '../types';
import { storageService } from '../services/storageService';
import { CreditCard, Plus, Search, X, Save, IndianRupee, Calendar, User, Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Billing() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newPayment, setNewPayment] = useState<Partial<Payment>>({
    projectId: '',
    customerId: '',
    amount: 0,
    method: 'Cash'
  });

  useEffect(() => {
    setPayments(storageService.getPayments());
    setProjects(storageService.getProjects());
    setCustomers(storageService.getCustomers());
  }, []);

  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const project = projects.find(p => p.id === newPayment.projectId);
    if (!project) return;

    const payment: Payment = {
      ...newPayment as Payment,
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString()
    };

    // Add payment record
    storageService.savePayment(payment);

    // Update project paid amount
    const updatedProject = { ...project, paidAmount: project.paidAmount + (newPayment.amount || 0) };
    storageService.saveProject(updatedProject);

    // Update customer outstanding balance
    const customer = customers.find(c => c.id === project.customerId);
    if (customer) {
      const updatedCustomer = { ...customer, outstandingBalance: customer.outstandingBalance - (newPayment.amount || 0) };
      storageService.saveCustomer(updatedCustomer);
    }

    // Refresh data
    setPayments(storageService.getPayments());
    setProjects(storageService.getProjects());
    setCustomers(storageService.getCustomers());
    setIsAdding(false);
    setNewPayment({ projectId: '', customerId: '', amount: 0, method: 'Cash' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h3 className="text-lg font-bold">Payment History</h3>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 bg-[#F27D26] text-black font-bold py-3 px-6 rounded-xl hover:bg-[#ff8c3a] transition-all active:scale-95 shadow-lg shadow-[#F27D26]/20"
        >
          <Plus size={20} />
          <span>Record Payment</span>
        </button>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/50">
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Date</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Project / Customer</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Method</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {payments.map((payment) => {
              const project = projects.find(p => p.id === payment.projectId);
              const customer = customers.find(c => c.id === payment.customerId);
              return (
                <tr key={payment.id} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-zinc-400">
                      <Calendar size={14} className="text-zinc-600" />
                      <span>{new Date(payment.date).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-bold text-white">{project?.title || 'Unknown Project'}</p>
                      <p className="text-[10px] text-zinc-500 uppercase tracking-widest">{customer?.name || 'Unknown Customer'}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold px-2 py-1 bg-zinc-800 text-zinc-400 rounded-md uppercase tracking-wider">
                      {payment.method}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm font-mono font-bold text-green-500">+₹{payment.amount.toLocaleString()}</span>
                  </td>
                </tr>
              );
            })}
            {payments.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-zinc-500 text-sm italic">
                  No payment records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Record Payment Modal */}
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
                <h3 className="text-xl font-black italic tracking-tighter text-[#F27D26] uppercase">Record Payment</h3>
                <button onClick={() => setIsAdding(false)} className="p-2 text-zinc-500 hover:text-white">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleAddPayment} className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2 space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Project</label>
                    <select
                      required
                      value={newPayment.projectId}
                      onChange={(e) => {
                        const project = projects.find(p => p.id === e.target.value);
                        setNewPayment({ 
                          ...newPayment, 
                          projectId: e.target.value,
                          customerId: project?.customerId || ''
                        });
                      }}
                      className="w-full bg-zinc-800 border-none rounded-xl py-3 px-4 text-sm focus:ring-1 ring-[#F27D26]"
                    >
                      <option value="">Select a project</option>
                      {projects.map(p => (
                        <option key={p.id} value={p.id}>{p.title} ({p.customerName})</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Amount (₹)</label>
                    <input
                      required
                      type="number"
                      value={newPayment.amount}
                      onChange={(e) => setNewPayment({ ...newPayment, amount: Number(e.target.value) })}
                      className="w-full bg-zinc-800 border-none rounded-xl py-3 px-4 text-sm focus:ring-1 ring-[#F27D26]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Payment Method</label>
                    <select
                      value={newPayment.method}
                      onChange={(e) => setNewPayment({ ...newPayment, method: e.target.value as any })}
                      className="w-full bg-zinc-800 border-none rounded-xl py-3 px-4 text-sm focus:ring-1 ring-[#F27D26]"
                    >
                      <option>Cash</option>
                      <option>Bank Transfer</option>
                      <option>Card</option>
                      <option>Cheque</option>
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
                    <span>Record Payment</span>
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
