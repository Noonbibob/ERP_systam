import { Product, Customer, Project, Payment, UserProfile } from '../types';

const STORAGE_KEYS = {
  PRODUCTS: 'acousticpro_products',
  CUSTOMERS: 'acousticpro_customers',
  PROJECTS: 'acousticpro_projects',
  PAYMENTS: 'acousticpro_payments',
  USER_PROFILE: 'acousticpro_user_profile'
};

const get = <T>(key: string, defaultValue: T): T => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
};

const set = <T>(key: string, data: T) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const storageService = {
  // Products
  getProducts: (): Product[] => get(STORAGE_KEYS.PRODUCTS, []),
  saveProduct: (product: Product) => {
    const products = storageService.getProducts();
    const index = products.findIndex(p => p.id === product.id);
    if (index >= 0) {
      products[index] = product;
    } else {
      products.push(product);
    }
    set(STORAGE_KEYS.PRODUCTS, products);
  },
  deleteProduct: (id: string) => {
    const products = storageService.getProducts().filter(p => p.id !== id);
    set(STORAGE_KEYS.PRODUCTS, products);
  },

  // Customers
  getCustomers: (): Customer[] => get(STORAGE_KEYS.CUSTOMERS, []),
  saveCustomer: (customer: Customer) => {
    const customers = storageService.getCustomers();
    const index = customers.findIndex(c => c.id === customer.id);
    if (index >= 0) {
      customers[index] = customer;
    } else {
      customers.push(customer);
    }
    set(STORAGE_KEYS.CUSTOMERS, customers);
  },
  deleteCustomer: (id: string) => {
    const customers = storageService.getCustomers().filter(c => c.id !== id);
    set(STORAGE_KEYS.CUSTOMERS, customers);
  },

  // Projects
  getProjects: (): Project[] => get(STORAGE_KEYS.PROJECTS, []),
  saveProject: (project: Project) => {
    const projects = storageService.getProjects();
    const index = projects.findIndex(p => p.id === project.id);
    if (index >= 0) {
      projects[index] = project;
    } else {
      projects.push(project);
    }
    set(STORAGE_KEYS.PROJECTS, projects);
  },
  deleteProject: (id: string) => {
    const projects = storageService.getProjects().filter(p => p.id !== id);
    set(STORAGE_KEYS.PROJECTS, projects);
  },

  updateProductStock: (id: string, quantity: number, type: 'add' | 'remove') => {
    const products = storageService.getProducts();
    const index = products.findIndex(p => p.id === id);
    if (index >= 0) {
      if (type === 'add') {
        products[index].stock += quantity;
      } else {
        products[index].stock = Math.max(0, products[index].stock - quantity);
      }
      set(STORAGE_KEYS.PRODUCTS, products);
    }
  },

  setProductStock: (id: string, stock: number) => {
    const products = storageService.getProducts();
    const index = products.findIndex(p => p.id === id);
    if (index >= 0) {
      products[index].stock = stock;
      set(STORAGE_KEYS.PRODUCTS, products);
    }
  },

  // Payments
  getPayments: (): Payment[] => get(STORAGE_KEYS.PAYMENTS, []),
  savePayment: (payment: Payment) => {
    const payments = storageService.getPayments();
    const index = payments.findIndex(p => p.id === payment.id);
    if (index >= 0) {
      payments[index] = payment;
    } else {
      payments.push(payment);
    }
    set(STORAGE_KEYS.PAYMENTS, payments);
  },
  deletePayment: (id: string) => {
    const payments = storageService.getPayments().filter(p => p.id !== id);
    set(STORAGE_KEYS.PAYMENTS, payments);
  },

  // User Profile
  getUserProfile: (): UserProfile | null => get(STORAGE_KEYS.USER_PROFILE, null),
  setUserProfile: (profile: UserProfile | null) => set(STORAGE_KEYS.USER_PROFILE, profile)
};
