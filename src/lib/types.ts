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
};
