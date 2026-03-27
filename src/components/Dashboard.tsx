import { useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { Product, Customer, Project } from '../types';
import { Package, Users, Briefcase, IndianRupee, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCustomers: 0,
    activeProjects: 0,
    totalRevenue: 0,
    outstanding: 0
  });

  const [recentProjects, setRecentProjects] = useState<Project[]>([]);

  useEffect(() => {
    const products = storageService.getProducts();
    const customers = storageService.getCustomers();
    const projects = storageService.getProjects();

    const outstanding = customers.reduce((acc, curr) => acc + (curr.outstandingBalance || 0), 0);
    const active = projects.filter(p => p.status !== 'Billed').length;
    const revenue = projects.reduce((acc, curr) => acc + (curr.paidAmount || 0), 0);

    setStats({
      totalProducts: products.length,
      totalCustomers: customers.length,
      activeProjects: active,
      totalRevenue: revenue,
      outstanding
    });

    const payments = storageService.getPayments();

    const monthlyRevenue = payments.reduce((acc: any, p) => {
      const month = new Date(p.date).toLocaleString('default', { month: 'short' });
      acc[month] = (acc[month] || 0) + p.amount;
      return acc;
    }, {});

    const chartData = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(month => ({
      name: month,
      revenue: monthlyRevenue[month] || 0
    })).filter(d => d.revenue > 0 || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].includes(d.name)); // Show at least first 6 months

    setChartData(chartData);
  }, []);

  const [chartData, setChartData] = useState<any[]>([]);

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Total Revenue" 
          value={`₹${stats.totalRevenue.toLocaleString()}`} 
          icon={IndianRupee} 
          trend="+12.5%" 
          trendUp={true} 
        />
        <StatCard 
          label="Outstanding" 
          value={`₹${stats.outstanding.toLocaleString()}`} 
          icon={AlertCircleIcon} 
          trend="-2.4%" 
          trendUp={false} 
          color="text-red-500"
        />
        <StatCard 
          label="Active Projects" 
          value={stats.activeProjects.toString()} 
          icon={Briefcase} 
        />
        <StatCard 
          label="Inventory Items" 
          value={stats.totalProducts.toString()} 
          icon={Package} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart */}
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold">Revenue Overview</h3>
            <select className="bg-zinc-800 border-none text-xs rounded-lg px-3 py-1.5 focus:ring-1 ring-[#F27D26]">
              <option>Last 6 Months</option>
              <option>Last Year</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#71717a" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="#71717a" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(value) => `₹${value}`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                  itemStyle={{ color: '#F27D26' }}
                />
                <Bar dataKey="revenue" fill="#F27D26" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h3 className="text-lg font-bold mb-6">Recent Projects</h3>
          <div className="space-y-4">
            {recentProjects.map((project) => (
              <div key={project.id} className="flex items-center justify-between p-3 hover:bg-zinc-800/50 rounded-xl transition-colors border border-transparent hover:border-zinc-800">
                <div>
                  <p className="text-sm font-bold">{project.title}</p>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest">{project.status}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-mono font-bold text-[#F27D26]">₹{project.totalAmount.toLocaleString()}</p>
                  <p className="text-[10px] text-zinc-500">{new Date(project.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
            {recentProjects.length === 0 && (
              <p className="text-center text-zinc-500 text-sm py-8">No recent projects found.</p>
            )}
          </div>
          <button className="w-full mt-6 py-3 text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-white transition-colors border-t border-zinc-800">
            View All Projects
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, trend, trendUp, color = "text-[#F27D26]" }: any) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Icon size={48} />
      </div>
      <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1">{label}</p>
      <h4 className={`text-2xl font-black ${color}`}>{value}</h4>
      {trend && (
        <div className="flex items-center gap-1 mt-2">
          {trendUp ? <ArrowUpRight size={14} className="text-green-500" /> : <ArrowDownRight size={14} className="text-red-500" />}
          <span className={`text-[10px] font-bold ${trendUp ? 'text-green-500' : 'text-red-500'}`}>{trend}</span>
          <span className="text-[10px] text-zinc-600 ml-1">vs last month</span>
        </div>
      )}
    </div>
  );
}

function AlertCircleIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}
