import type { Auth, Firestore, Storage } from 'firebase/app';

export type Task = {
  id: string;
  title: string;
  completed: boolean;
};

export type DealStatus = "Upcoming" | "In Progress" | "Awaiting Payment" | "Completed" | "Overdue";

export type Deal = {
  id: string;
  brandName: string;
  campaignName: string;
  status: DealStatus;
  deliverables: string;
  dueDate: string;
  payment: number;
  paid: boolean;
  notificationDismissed?: boolean;
  tasks: Task[];
  aiContentIdeas?: string[];
};

export type Platform = "Instagram" | "TikTok" | "YouTube";

export type PerformancePost = {
  id: string;
  platform: Platform;
  postTitle: string;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  conversion: boolean;
  date: string;
  postDescription?: string;
  aiAnalysis?: {
    analysis: string;
    suggestions: string[];
    rating: number;
  };
};

export type Contract = {
  id: string;
  fileName: string;
  uploadDate: string;
  status: "Processing" | "Done" | "Error";
  brandName?: string;
  startDate?: string;
  endDate?: string;
  payment?: number;
  storagePath?: string;
  deliverables?: string;
};

export type ManualContract = {
  fileName: string;
  brandName: string;
  startDate: string;
  endDate: string;
  deliverables: string;
  payment: number;
};

export type ProfileType = 'influencer' | 'brand';

export interface NotificationSettings {
  email: {
    dealReminders: boolean;
    paymentUpdates: boolean;
    featureNews: boolean;
  };
}

export interface UserProfile {
  email: string;
  profileType: ProfileType;
  niche?: string;
  notificationSettings?: NotificationSettings;
  plan?: 'Free' | 'Pro';
  onboardingCompleted?: boolean;
  pitchGenerationCount?: number;
  metricExtractionCount?: number;
}

import { type User } from 'firebase/auth';

export interface AppDataContextType {
  deals: Deal[];
  contracts: Contract[];
  performancePosts: PerformancePost[];
  user: User | null;
  userProfile: UserProfile | null;
  isAdmin: boolean;
  loadingAuth: boolean;
  loadingData: boolean;
  signOut: () => Promise<void>;
  addDeal: (values: Omit<Deal, 'id' | 'status' | 'paid' | 'tasks'>) => Promise<void>;
  updateDealStatus: (dealId: string, newStatus: DealStatus) => Promise<void>;
  addPerformancePost: (postData: Omit<PerformancePost, 'id' | 'date'>) => Promise<void>;
  updatePerformancePost: (postId: string, postData: Omit<PerformancePost, 'id' | 'date'>) => Promise<void>;
  processContract: (file: File) => Promise<void>;
  addManualContract: (values: ManualContract) => Promise<void>;
  updateContractStatus: (
    contractId: string,
    newStatus: Contract['status']
  ) => Promise<void>;
  updateUserProfile: (data: {
    displayName: string;
    profileType: ProfileType;
    niche?: string;
  }) => Promise<void>;
  updateUserPassword: (password: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
  updateNotificationSettings: (settings: NotificationSettings) => Promise<void>;
  dismissDealNotification: (dealId: string) => Promise<void>;
  updateUserPlan: (plan: 'Free' | 'Pro') => void;
  addTaskToDeal: (dealId: string, taskTitle: string) => Promise<void>;
  updateTaskStatus: (
    dealId: string,
    taskId: string,
    completed: boolean
  ) => Promise<void>;
  deleteTask: (dealId: string, taskId: string) => Promise<void>;
  deleteDeal: (dealId: string) => Promise<void>;
  deleteContract: (contractId: string) => Promise<void>;
  deletePerformancePost: (postId: string) => Promise<void>;
  markOnboardingAsCompleted: () => Promise<void>;
  auth: Auth | null;
  db: Firestore | null;
  storage: Storage | null;
  saveContentIdeasToDeal: (dealId: string, ideas: string[]) => Promise<void>;
  saveAnalysisToPost: (postId: string, analysis: PerformancePost['aiAnalysis']) => Promise<void>;
  incrementPitchGenerationCount: () => Promise<void>;
  incrementMetricExtractionCount: () => Promise<void>;
}
