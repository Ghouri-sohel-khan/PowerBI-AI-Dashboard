// Realistic sample datasets for Phase 1 Frontend Preview

export const SAMPLE_DATASETS = {
  ecommerce: {
    id: 'ecommerce',
    name: 'ecommerce_sales_q1_2025.xlsx',
    displayName: 'Global E-Commerce Sales Q1 2025',
    category: 'Retail & E-Commerce',
    rowCount: 1250,
    columnCount: 8,
    fileSize: '184 KB',
    description: 'Transaction details including sales revenue, product categories, regions, order counts, and customer ratings.',
    columns: [
      { name: 'Order ID', type: 'String', sample: 'ORD-94821', icon: 'Hash' },
      { name: 'Date', type: 'Date', sample: '2025-01-14', icon: 'Calendar' },
      { name: 'Category', type: 'Categorical', sample: 'Electronics', icon: 'Tag' },
      { name: 'Region', type: 'Categorical', sample: 'North America', icon: 'Globe' },
      { name: 'Revenue', type: 'Currency', sample: '$1,249.00', icon: 'DollarSign' },
      { name: 'Profit', type: 'Currency', sample: '$380.00', icon: 'TrendingUp' },
      { name: 'Quantity', type: 'Numeric', sample: '3', icon: 'Layers' },
      { name: 'Rating', type: 'Numeric', sample: '4.8', icon: 'Star' },
    ],
    previewRows: [
      { id: 'ORD-94821', date: '2025-01-14', category: 'Electronics', region: 'North America', revenue: 1249.00, profit: 380.00, quantity: 3, rating: 4.8 },
      { id: 'ORD-94822', date: '2025-01-16', category: 'Apparel', region: 'Europe', revenue: 450.50, profit: 120.00, quantity: 5, rating: 4.5 },
      { id: 'ORD-94823', date: '2025-01-18', category: 'Home Goods', region: 'Asia-Pacific', revenue: 890.00, profit: 245.00, quantity: 2, rating: 4.9 },
      { id: 'ORD-94824', date: '2025-01-20', category: 'Electronics', region: 'Latin America', revenue: 2100.00, profit: 620.00, quantity: 4, rating: 4.7 },
      { id: 'ORD-94825', date: '2025-01-22', category: 'Software', region: 'North America', revenue: 750.00, profit: 510.00, quantity: 1, rating: 5.0 },
      { id: 'ORD-94826', date: '2025-02-02', category: 'Apparel', region: 'Europe', revenue: 320.00, profit: 95.00, quantity: 2, rating: 4.2 },
      { id: 'ORD-94827', date: '2025-02-05', category: 'Electronics', region: 'Asia-Pacific', revenue: 1650.00, profit: 490.00, quantity: 3, rating: 4.6 },
      { id: 'ORD-94828', date: '2025-02-11', category: 'Home Goods', region: 'North America', revenue: 540.00, profit: 160.00, quantity: 4, rating: 4.4 },
      { id: 'ORD-94829', date: '2025-02-15', category: 'Software', region: 'Europe', revenue: 1200.00, profit: 890.00, quantity: 2, rating: 4.9 },
      { id: 'ORD-94830', date: '2025-03-01', category: 'Electronics', region: 'Latin America', revenue: 1890.00, profit: 540.00, quantity: 3, rating: 4.7 },
      { id: 'ORD-94831', date: '2025-03-08', category: 'Apparel', region: 'North America', revenue: 680.00, profit: 210.00, quantity: 6, rating: 4.3 },
      { id: 'ORD-94832', date: '2025-03-14', category: 'Software', region: 'Asia-Pacific', revenue: 950.00, profit: 710.00, quantity: 1, rating: 4.8 },
    ],
    kpis: {
      totalRevenue: '$482,950',
      revenueChange: '+14.2%',
      totalOrders: '3,420',
      ordersChange: '+8.6%',
      avgOrderValue: '$141.21',
      aovChange: '+5.1%',
      activeRegions: '4 Global Markets',
      regionStatus: 'North America Leading',
      avgRating: '4.7 / 5.0',
      ratingTrend: 'High Satisfaction'
    },
    monthlyTrend: [
      { month: 'Jan', revenue: 142000, profit: 45000, orders: 980 },
      { month: 'Feb', revenue: 158000, profit: 52000, orders: 1120 },
      { month: 'Mar', revenue: 182950, profit: 61000, orders: 1320 },
      { month: 'Apr', revenue: 165000, profit: 54000, orders: 1180 },
      { month: 'May', revenue: 195000, profit: 68000, orders: 1410 },
      { month: 'Jun', revenue: 210000, profit: 74000, orders: 1530 },
    ],
    categoryComparison: [
      { category: 'Electronics', revenue: 185000, profit: 58000 },
      { category: 'Software', revenue: 124000, profit: 92000 },
      { category: 'Apparel', revenue: 98000, profit: 32000 },
      { category: 'Home Goods', revenue: 75950, profit: 24000 },
    ],
    regionDistribution: [
      { name: 'North America', value: 42, amount: '$202,839', color: '#4f46e5' }, // Indigo 600
      { name: 'Europe', value: 28, amount: '$135,226', color: '#0d9488' },      // Teal 600
      { name: 'Asia-Pacific', value: 18, amount: '$86,931', color: '#0284c7' },   // Sky 600
      { name: 'Latin America', value: 12, amount: '$57,954', color: '#6366f1' },  // Indigo 500
    ],
    aiInsights: [
      { title: 'Revenue Surge', text: 'Electronics in North America generated 42% of total Q1 revenue, showing a +18.4% MoM growth rate.' },
      { title: 'High Margin Product', text: 'Software license products achieved a 74.2% net profit margin compared to 31.3% in hardware.' },
      { title: 'Geographic Potential', text: 'Asia-Pacific showed the highest order growth (+22.1%), indicating an expansion opportunity.' }
    ]
  },
  saas: {
    id: 'saas',
    name: 'saas_metrics_2025.csv',
    displayName: 'SaaS ARR & Churn Performance 2025',
    category: 'Subscription Business',
    rowCount: 840,
    columnCount: 7,
    fileSize: '96 KB',
    description: 'Monthly recurring revenue (MRR), subscriber tiers, churn metrics, and net retention statistics.',
    columns: [
      { name: 'Account ID', type: 'String', sample: 'ACC-1092', icon: 'Hash' },
      { name: 'Join Date', type: 'Date', sample: '2024-11-02', icon: 'Calendar' },
      { name: 'Plan Tier', type: 'Categorical', sample: 'Enterprise', icon: 'Tag' },
      { name: 'Region', type: 'Categorical', sample: 'North America', icon: 'Globe' },
      { name: 'MRR', type: 'Currency', sample: '$2,450.00', icon: 'DollarSign' },
      { name: 'Seat Count', type: 'Numeric', sample: '45', icon: 'Layers' },
      { name: 'Churn Status', type: 'Categorical', sample: 'Active', icon: 'CheckCircle' },
    ],
    previewRows: [
      { id: 'ACC-1092', date: '2024-11-02', category: 'Enterprise', region: 'North America', revenue: 2450.00, profit: 1960.00, quantity: 45, rating: 5.0 },
      { id: 'ACC-1093', date: '2024-11-15', category: 'Pro Plan', region: 'Europe', revenue: 490.00, profit: 390.00, quantity: 12, rating: 4.7 },
      { id: 'ACC-1094', date: '2024-12-01', category: 'Starter', region: 'Asia-Pacific', revenue: 99.00, profit: 75.00, quantity: 3, rating: 4.2 },
      { id: 'ACC-1095', date: '2024-12-10', category: 'Enterprise', region: 'North America', revenue: 3800.00, profit: 3040.00, quantity: 90, rating: 4.9 },
      { id: 'ACC-1096', date: '2025-01-05', category: 'Pro Plan', region: 'Europe', revenue: 650.00, profit: 520.00, quantity: 15, rating: 4.6 },
    ],
    kpis: {
      totalRevenue: '$128,400 MRR',
      revenueChange: '+18.5% YoY',
      totalOrders: '840 Subscribers',
      ordersChange: '+12.3%',
      avgOrderValue: '$152.85 ARR/user',
      aovChange: '+6.4%',
      activeRegions: 'Net Retention 114%',
      regionStatus: 'Low Churn 1.8%',
      avgRating: '4.8 / 5.0 CSAT',
      ratingTrend: 'Stable'
    },
    monthlyTrend: [
      { month: 'Jan', revenue: 98000, profit: 78000, orders: 710 },
      { month: 'Feb', revenue: 105000, profit: 84000, orders: 740 },
      { month: 'Mar', revenue: 112000, profit: 89000, orders: 780 },
      { month: 'Apr', revenue: 119000, profit: 95000, orders: 805 },
      { month: 'May', revenue: 124000, profit: 99000, orders: 825 },
      { month: 'Jun', revenue: 128400, profit: 102000, orders: 840 },
    ],
    categoryComparison: [
      { category: 'Enterprise', revenue: 78000, profit: 62400 },
      { category: 'Pro Plan', revenue: 36400, profit: 29120 },
      { category: 'Starter', revenue: 14000, profit: 10500 },
    ],
    regionDistribution: [
      { name: 'North America', value: 50, amount: '$64,200', color: '#4f46e5' },
      { name: 'Europe', value: 30, amount: '$38,520', color: '#0d9488' },
      { name: 'Asia-Pacific', value: 15, amount: '$19,260', color: '#0284c7' },
      { name: 'Latin America', value: 5, amount: '$6,420', color: '#6366f1' },
    ],
    aiInsights: [
      { title: 'Enterprise Dominance', text: 'Enterprise plans constitute 60.7% of monthly recurring revenue with less than 0.5% churn.' },
      { title: 'Expansion Signal', text: 'Customers upgrading from Pro to Enterprise within 90 days increased by 28%.' }
    ]
  },
  healthcare: {
    id: 'healthcare',
    name: 'regional_healthcare_ops.xlsx',
    displayName: 'Regional Healthcare Operations 2025',
    category: 'Healthcare & Ops',
    rowCount: 2150,
    columnCount: 8,
    fileSize: '310 KB',
    description: 'Patient admissions, clinic wait times, operational expenditure, and satisfaction indicators across regional facilities.',
    columns: [
      { name: 'Admission ID', type: 'String', sample: 'ADM-5501', icon: 'Hash' },
      { name: 'Visit Date', type: 'Date', sample: '2025-01-08', icon: 'Calendar' },
      { name: 'Department', type: 'Categorical', sample: 'Cardiology', icon: 'Tag' },
      { name: 'Facility Location', type: 'Categorical', sample: 'Metro General', icon: 'Globe' },
      { name: 'Op Cost', type: 'Currency', sample: '$3,400.00', icon: 'DollarSign' },
      { name: 'Wait Time (m)', type: 'Numeric', sample: '18', icon: 'Clock' },
      { name: 'Bed Utilization', type: 'Numeric', sample: '84%', icon: 'Layers' },
      { name: 'CSAT', type: 'Numeric', sample: '4.6', icon: 'Star' },
    ],
    previewRows: [
      { id: 'ADM-5501', date: '2025-01-08', category: 'Cardiology', region: 'North Facility', revenue: 3400.00, profit: 850.00, quantity: 18, rating: 4.6 },
      { id: 'ADM-5502', date: '2025-01-10', category: 'Orthopedics', region: 'East Facility', revenue: 4200.00, profit: 1100.00, quantity: 24, rating: 4.4 },
      { id: 'ADM-5503', date: '2025-01-14', category: 'Neurology', region: 'West Facility', revenue: 5100.00, profit: 1400.00, quantity: 15, rating: 4.8 },
      { id: 'ADM-5504', date: '2025-01-22', category: 'Pediatrics', region: 'South Facility', revenue: 1800.00, profit: 450.00, quantity: 12, rating: 4.9 },
    ],
    kpis: {
      totalRevenue: '$364,500 Ops Cost',
      revenueChange: '-3.8% Cost Savings',
      totalOrders: '2,150 Patients',
      ordersChange: '+5.4%',
      avgOrderValue: '19.4 min Wait',
      aovChange: '-4.2 min Faster',
      activeRegions: '84% Bed Utilization',
      regionStatus: 'Optimal Capacity',
      avgRating: '4.6 / 5.0 CSAT',
      ratingTrend: '+0.3 Improvement'
    },
    monthlyTrend: [
      { month: 'Jan', revenue: 62000, profit: 15000, orders: 340 },
      { month: 'Feb', revenue: 59000, profit: 14200, orders: 325 },
      { month: 'Mar', revenue: 61000, profit: 14800, orders: 350 },
      { month: 'Apr', revenue: 58000, profit: 13900, orders: 360 },
      { month: 'May', revenue: 60500, profit: 14600, orders: 380 },
      { month: 'Jun', revenue: 64000, profit: 15500, orders: 395 },
    ],
    categoryComparison: [
      { category: 'Cardiology', revenue: 115000, profit: 28000 },
      { category: 'Neurology', revenue: 98000, profit: 24000 },
      { category: 'Orthopedics', revenue: 86000, profit: 21000 },
      { category: 'Pediatrics', revenue: 65500, profit: 16000 },
    ],
    regionDistribution: [
      { name: 'North Facility', value: 38, amount: '$138,510', color: '#0d9488' },
      { name: 'East Facility', value: 26, amount: '$94,770', color: '#4f46e5' },
      { name: 'West Facility', value: 22, amount: '$80,190', color: '#0284c7' },
      { name: 'South Facility', value: 14, amount: '$51,030', color: '#6366f1' },
    ],
    aiInsights: [
      { title: 'Wait Time Optimization', text: 'Triaging efficiency in North Facility reduced average outpatient wait times from 28m to 18m.' },
      { title: 'Department Cost Driver', text: 'Cardiology procedures accounted for 31.5% of operational expenditures.' }
    ]
  }
};
