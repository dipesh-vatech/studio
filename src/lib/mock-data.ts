import type { Deal, PerformancePost, Contract } from './types';

export const mockDeals: Deal[] = [
  {
    id: '1',
    brandName: 'BrandFresh',
    campaignName: 'Summer Launch',
    status: 'In Progress',
    deliverables: '2 posts, 3 stories',
    dueDate: '2024-08-15',
    payment: 1500,
    paid: false,
  },
  {
    id: '2',
    brandName: 'TechGizmo',
    campaignName: 'Gadget Showcase',
    status: 'Upcoming',
    deliverables: '1 video review',
    dueDate: '2024-09-01',
    payment: 2500,
    paid: false,
  },
  {
    id: '3',
    brandName: 'EcoWear',
    campaignName: 'Green Collection',
    status: 'Completed',
    deliverables: '1 post, 1 story',
    dueDate: '2024-07-20',
    payment: 800,
    paid: true,
  },
  {
    id: '4',
    brandName: 'FitFuel',
    campaignName: 'Protein Power',
    status: 'Awaiting Payment',
    deliverables: '3 posts',
    dueDate: '2024-07-10',
    payment: 1200,
    paid: false,
  },
  {
    id: '5',
    brandName: 'GourmetBox',
    campaignName: 'Recipe Challenge',
    status: 'Overdue',
    deliverables: '1 reel',
    dueDate: '2024-07-01',
    payment: 950,
    paid: false,
  },
];

export const mockPerformancePosts: PerformancePost[] = [
    { id: 'p1', platform: 'Instagram', postTitle: 'My new favorite gadget from TechGizmo', likes: 12045, comments: 834, shares: 212, saves: 1503, conversion: true, date: '2024-06-28' },
    { id: 'p2', platform: 'TikTok', postTitle: 'Unboxing the Summer Launch kit', likes: 250832, comments: 4892, shares: 1204, saves: 5400, conversion: true, date: '2024-06-15' },
    { id: 'p3', platform: 'YouTube', postTitle: 'Styling the new EcoWear line', likes: 8023, comments: 1203, shares: 450, saves: 980, conversion: false, date: '2024-05-20' },
    { id: 'p4', platform: 'Instagram', postTitle: 'Protein shake secrets with FitFuel', likes: 9876, comments: 543, shares: 150, saves: 1100, conversion: true, date: '2024-05-05' },
];

export const mockContracts: Contract[] = [
  { id: 'c1', fileName: 'BrandFresh_Summer_Contract.pdf', uploadDate: '2024-06-10', status: 'Done', brandName: 'BrandFresh', startDate: '2024-07-01', endDate: '2024-08-15', payment: 1500 },
  { id: 'c2', fileName: 'TechGizmo_Q3_Agreement.pdf', uploadDate: '2024-06-05', status: 'Done', brandName: 'TechGizmo', startDate: '2024-08-01', endDate: '2024-09-01', payment: 2500 },
  { id: 'c3', fileName: 'new_deal_terms.pdf', uploadDate: '2024-07-22', status: 'Processing' },
  { id: 'c4', fileName: 'old_contract.pdf', uploadDate: '2024-02-14', status: 'Error' },
];

export const engagementChartData = [
  { date: 'Jan', likes: 6500, comments: 2400 },
  { date: 'Feb', likes: 7200, comments: 2800 },
  { date: 'Mar', likes: 8100, comments: 3200 },
  { date: 'Apr', likes: 7800, comments: 3000 },
  { date: 'May', likes: 9500, comments: 4100 },
  { date: 'Jun', likes: 11200, comments: 4500 },
];
