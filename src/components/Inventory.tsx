import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { storageService } from '../services/storageService';
import { tallyService } from '../services/tallyService';
import { Package, Plus, Search, Trash2, Edit3, X, Save, Filter, RefreshCw, Settings, ArrowDown, ArrowUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Inventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isTallySettingsOpen, setIsTallySettingsOpen] = useState(false);
  const [isAdjustingStock, setIsAdjustingStock] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [adjustmentType, setAdjustmentType] = useState<'add' | 'remove'>('remove');
  const [adjustmentQty, setAdjustmentQty] = useState(1);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [adjustmentStatus, setAdjustmentStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error', message: string }>({ type: 'idle', message: '' });
  const [tallyConfig, setTallyConfig] = useState(tallyService.getConfig());
  const [searchTerm, setSearchTerm] = useState('');
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    category: 'Speakers',
    stock: 0,
    unitPrice: 0,
    description: ''
  });

  useEffect(() => {
    const data = storageService.getProducts();
    setProducts(data);
  }, []);

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const product: Product = {
      ...newProduct as Product,
      id: Math.random().toString(36).substr(2, 9)
    };
    storageService.saveProduct(product);
    setProducts(storageService.getProducts());
    setIsAdding(false);
    setNewProduct({ name: '', category: 'Speakers', stock: 0, unitPrice: 0, description: '' });
  };

  const handleSyncTally = async () => {
    setIsSyncing(true);
    try {
      const tallyItems = await tallyService.fetchStockItems();
      
      if (tallyItems.length === 0) {
        // No items found
        return;
      }

      const currentProducts = storageService.getProducts();
      let updatedCount = 0;

      tallyItems.forEach(tItem => {
        const localProduct = currentProducts.find(p => p.name.toLowerCase() === tItem.name.toLowerCase());
        if (localProduct && localProduct.id) {
          storageService.setProductStock(localProduct.id, tItem.stock);
          updatedCount++;
        }
      });

      setProducts(storageService.getProducts());
    } catch (error) {
      console.error('Tally Sync Error:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    try {
      // Temporarily save config to test
      tallyService.saveConfig(tallyConfig);
      await tallyService.fetchStockItems();
      alert('Connection to Tally Prime (Varthuval) successful!');
    } catch (error) {
      alert('Connection failed. Please ensure the Varthuval URL is correct and the Tally XML API is accessible.');
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedProduct?.id) {
      setAdjustmentStatus({ type: 'loading', message: 'Syncing with Tally Prime...' });
      
      try {
        // Try to send to Tally
        await tallyService.sendStockAdjustment(
          selectedProduct.name, 
          adjustmentQty, 
          adjustmentType === 'add' ? 'Inward' : 'Outward'
        );
        
        // If Tally succeeds, update local
        storageService.updateProductStock(selectedProduct.id, adjustmentQty, adjustmentType);
        setProducts(storageService.getProducts());
        
        setAdjustmentStatus({ type: 'success', message: 'Stock adjusted locally and in Tally!' });
        
        // Close modal after success
        setTimeout(() => {
          setIsAdjustingStock(false);
          setSelectedProduct(null);
          setAdjustmentQty(1);
          setAdjustmentStatus({ type: 'idle', message: '' });
        }, 1500);
      } catch (error) {
        console.error('Tally Adjustment Error:', error);
        
        // If Tally fails, we still update local but inform the user
        storageService.updateProductStock(selectedProduct.id, adjustmentQty, adjustmentType);
        setProducts(storageService.getProducts());
        
        setAdjustmentStatus({ 
          type: 'error', 
          message: 'Tally sync failed. Stock updated LOCALLY only.' 
        });

        // Close modal after a bit longer to let them read the error
        setTimeout(() => {
          setIsAdjustingStock(false);
          setSelectedProduct(null);
          setAdjustmentQty(1);
          setAdjustmentStatus({ type: 'idle', message: '' });
        }, 3000);
      }
    }
  };

  const handleDelete = (id: string) => {
    storageService.deleteProduct(id);
    setProducts(storageService.getProducts());
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
          <input
            type="text"
            placeholder="Search inventory..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-[#F27D26] transition-all"
          />
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsTallySettingsOpen(true)}
            className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-colors"
            title="Tally Settings"
          >
            <Settings size={20} />
          </button>
          <button 
            onClick={handleSyncTally}
            disabled={isSyncing}
            className={`p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 hover:text-[#F27D26] transition-colors ${isSyncing ? 'animate-spin' : ''}`}
            title="Sync with Tally Prime"
          >
            <RefreshCw size={20} />
          </button>
          <button className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-colors">
            <Filter size={20} />
          </button>
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 bg-[#F27D26] text-black font-bold py-3 px-6 rounded-xl hover:bg-[#ff8c3a] transition-all active:scale-95 shadow-lg shadow-[#F27D26]/20"
          >
            <Plus size={20} />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/50">
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Product Details</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Category</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Stock</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Unit Price</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {filteredProducts.map((product) => (
              <tr key={product.id} className="hover:bg-zinc-800/30 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center text-zinc-400 group-hover:text-[#F27D26] transition-colors">
                      <Package size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{product.name}</p>
                      <p className="text-xs text-zinc-500 truncate max-w-[200px]">{product.description || 'No description'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs font-bold px-2 py-1 bg-zinc-800 text-zinc-400 rounded-md uppercase tracking-wider">
                    {product.category}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-mono font-bold ${product.stock < 5 ? 'text-red-500' : 'text-white'}`}>
                      {product.stock}
                    </span>
                    {product.stock < 5 && (
                      <span className="text-[10px] font-black uppercase text-red-500/50 tracking-tighter">Low Stock</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-mono font-bold text-[#F27D26]">₹{product.unitPrice.toLocaleString()}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => {
                        setSelectedProduct(product);
                        setAdjustmentType('remove');
                        setIsAdjustingStock(true);
                      }}
                      className="p-2 text-zinc-500 hover:text-red-500 transition-colors"
                      title="Less Stock"
                    >
                      <ArrowDown size={16} />
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedProduct(product);
                        setAdjustmentType('add');
                        setIsAdjustingStock(true);
                      }}
                      className="p-2 text-zinc-500 hover:text-green-500 transition-colors"
                      title="Add Stock"
                    >
                      <ArrowUp size={16} />
                    </button>
                    <button className="p-2 text-zinc-500 hover:text-white transition-colors">
                      <Edit3 size={16} />
                    </button>
                    <button 
                      onClick={() => product.id && handleDelete(product.id)}
                      className="p-2 text-zinc-500 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredProducts.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-zinc-500 text-sm italic">
                  No products found in inventory.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Product Modal */}
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
                <h3 className="text-xl font-black italic tracking-tighter text-[#F27D26] uppercase">Add New Product</h3>
                <button onClick={() => setIsAdding(false)} className="p-2 text-zinc-500 hover:text-white">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleAddProduct} className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2 space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Product Name</label>
                    <input
                      required
                      type="text"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                      className="w-full bg-zinc-800 border-none rounded-xl py-3 px-4 text-sm focus:ring-1 ring-[#F27D26]"
                      placeholder="e.g. Studio Monitor X1"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Category</label>
                    <select
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value as any })}
                      className="w-full bg-zinc-800 border-none rounded-xl py-3 px-4 text-sm focus:ring-1 ring-[#F27D26]"
                    >
                      <option>Speakers</option>
                      <option>Acoustic Panels</option>
                      <option>Cables</option>
                      <option>Amplifiers</option>
                      <option>Accessories</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Stock Quantity</label>
                    <input
                      required
                      type="number"
                      value={newProduct.stock}
                      onChange={(e) => setNewProduct({ ...newProduct, stock: Number(e.target.value) })}
                      className="w-full bg-zinc-800 border-none rounded-xl py-3 px-4 text-sm focus:ring-1 ring-[#F27D26]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Unit Price (₹)</label>
                    <input
                      required
                      type="number"
                      value={newProduct.unitPrice}
                      onChange={(e) => setNewProduct({ ...newProduct, unitPrice: Number(e.target.value) })}
                      className="w-full bg-zinc-800 border-none rounded-xl py-3 px-4 text-sm focus:ring-1 ring-[#F27D26]"
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Description</label>
                    <textarea
                      value={newProduct.description}
                      onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                      className="w-full bg-zinc-800 border-none rounded-xl py-3 px-4 text-sm focus:ring-1 ring-[#F27D26] h-24 resize-none"
                      placeholder="Brief details about the product..."
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
                    <span>Save Product</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Stock Adjustment Modal */}
        {isAdjustingStock && selectedProduct && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
                <h3 className="text-xl font-black italic tracking-tighter text-[#F27D26] uppercase">
                  {adjustmentType === 'add' ? 'Add Stock' : 'Less Stock'}
                </h3>
                <button onClick={() => setIsAdjustingStock(false)} className="p-2 text-zinc-500 hover:text-white">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleAdjustStock} className="p-6 space-y-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-bold text-white">{selectedProduct.name}</p>
                    <p className="text-xs text-zinc-500">Current Stock: {selectedProduct.stock}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Quantity to {adjustmentType === 'add' ? 'Add' : 'Remove'}</label>
                    <input
                      required
                      type="number"
                      min="1"
                      value={adjustmentQty}
                      onChange={(e) => setAdjustmentQty(Number(e.target.value))}
                      className="w-full bg-zinc-800 border-none rounded-xl py-3 px-4 text-sm focus:ring-1 ring-[#F27D26]"
                    />
                  </div>
                </div>

                {adjustmentStatus.type !== 'idle' && (
                  <div className={`p-3 rounded-xl text-xs font-bold text-center ${
                    adjustmentStatus.type === 'loading' ? 'bg-zinc-800 text-zinc-400 animate-pulse' :
                    adjustmentStatus.type === 'success' ? 'bg-green-900/30 text-green-500' :
                    'bg-red-900/30 text-red-500'
                  }`}>
                    {adjustmentStatus.message}
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    disabled={adjustmentStatus.type === 'loading'}
                    onClick={() => setIsAdjustingStock(false)}
                    className="px-6 py-3 text-sm font-bold text-zinc-400 hover:text-white disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={adjustmentStatus.type === 'loading'}
                    className={`flex items-center gap-2 ${adjustmentType === 'add' ? 'bg-green-600 hover:bg-green-500' : 'bg-red-600 hover:bg-red-500'} text-white font-bold py-3 px-8 rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:scale-100`}
                  >
                    {adjustmentStatus.type === 'loading' ? (
                      <RefreshCw size={18} className="animate-spin" />
                    ) : (
                      <Save size={18} />
                    )}
                    <span>{adjustmentStatus.type === 'loading' ? 'Processing...' : 'Confirm Adjustment'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Tally Settings Modal */}
        {isTallySettingsOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
                <h3 className="text-xl font-black italic tracking-tighter text-[#F27D26] uppercase">Tally Prime Settings</h3>
                <button onClick={() => setIsTallySettingsOpen(false)} className="p-2 text-zinc-500 hover:text-white">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Tally XML URL</label>
                    <input
                      type="text"
                      value={tallyConfig.url}
                      onChange={(e) => setTallyConfig({ ...tallyConfig, url: e.target.value })}
                      className="w-full bg-zinc-800 border-none rounded-xl py-3 px-4 text-sm focus:ring-1 ring-[#F27D26]"
                      placeholder="http://localhost:9000"
                    />
                    <p className="text-[10px] text-zinc-500 italic">Default Tally port is 9000. Ensure Tally is running and ODBC is enabled.</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Company Name (Optional)</label>
                    <input
                      type="text"
                      value={tallyConfig.company}
                      onChange={(e) => setTallyConfig({ ...tallyConfig, company: e.target.value })}
                      className="w-full bg-zinc-800 border-none rounded-xl py-3 px-4 text-sm focus:ring-1 ring-[#F27D26]"
                      placeholder="Your Tally Company Name"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={handleTestConnection}
                    disabled={isTestingConnection}
                    className="px-6 py-3 text-sm font-bold text-zinc-400 hover:text-white disabled:opacity-50"
                  >
                    {isTestingConnection ? 'Testing...' : 'Test Connection'}
                  </button>
                  <button
                    onClick={() => {
                      tallyService.saveConfig(tallyConfig);
                      setIsTallySettingsOpen(false);
                    }}
                    className="flex items-center gap-2 bg-[#F27D26] text-black font-bold py-3 px-8 rounded-xl hover:bg-[#ff8c3a] transition-all active:scale-95"
                  >
                    <Save size={18} />
                    <span>Save Config</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
