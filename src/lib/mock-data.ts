import type { Deal, PerformancePost, Contract } from './types';

// This file is kept to prevent potential import errors during development,
// but all mock data has been removed in favor of live data fetching from Firestore.
// The app will now show empty states or loading indicators instead of mock data.

export const mockDeals: Deal[] = [];

export const mockPerformancePosts: PerformancePost[] = [];

export const mockContracts: Contract[] = [];

export const engagementChartData: {
  date: string;
  likes: number;
  comments: number;
}[] = [];
