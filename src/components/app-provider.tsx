
'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Deal, Contract, DealStatus } from '@/lib/types';
import { mockDeals, mockContracts } from '@/lib/mock-data';
import { useToast } from '@/hooks/use-toast';

interface AppDataContextType {
  deals: Deal[];
  contracts: Contract[];
  addDeal: (values: Omit<Deal, 'id' | 'status' | 'paid'>) => void;
  updateDealStatus: (dealId: string, newStatus: DealStatus) => void;
  processContract: (file: File) => Promise<void>;
  updateContractStatus: (
    contractId: string,
    newStatus: Contract['status']
  ) => void;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [deals, setDeals] = useState<Deal[]>(mockDeals);
  const [contracts, setContracts] = useState<Contract[]>(mockContracts);
  const { toast } = useToast();

  const addDeal = (values: Omit<Deal, 'id' | 'status' | 'paid'>) => {
    const newDeal: Deal = {
      id: crypto.randomUUID(),
      status: 'Upcoming',
      paid: false,
      ...values,
    };
    setDeals((prev) => [newDeal, ...prev]);
    toast({
      title: 'Success!',
      description: `New deal with ${newDeal.brandName} has been added.`,
    });
  };

  const updateDealStatus = (dealId: string, newStatus: DealStatus) => {
    setDeals((prev) =>
      prev.map((deal) =>
        deal.id === dealId ? { ...deal, status: newStatus } : deal
      )
    );
    toast({
      title: 'Status Updated!',
      description: `Deal status has been changed to "${newStatus}".`,
    });
  };

  const updateContractStatus = (
    contractId: string,
    newStatus: Contract['status']
  ) => {
    setContracts((prev) =>
      prev.map((contract) =>
        contract.id === contractId
          ? { ...contract, status: newStatus }
          : contract
      )
    );
    toast({
      title: 'Status Updated!',
      description: `Contract status has been changed to "${newStatus}".`,
    });
  };

  const processContract = async (file: File) => {
    const newContract: Contract = {
      id: crypto.randomUUID(),
      fileName: file.name,
      uploadDate: new Date().toISOString().split('T')[0],
      status: 'Processing',
    };
    setContracts((prev) => [newContract, ...prev]);

    // Simulate AI processing
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const processedContract = {
          ...newContract,
          status: 'Done' as const,
          brandName: 'AI Extracted Brand',
          startDate: '2024-08-01',
          endDate: '2024-09-01',
          payment: Math.floor(Math.random() * 2000) + 500,
        };

        setContracts((prev) =>
          prev.map((c) => (c.id === newContract.id ? processedContract : c))
        );

        // Create a corresponding deal
        addDeal({
          brandName: processedContract.brandName || 'Unnamed Brand',
          campaignName: `Campaign for ${processedContract.fileName}`,
          deliverables: '1 post, 2 stories', // Default deliverables
          dueDate:
            processedContract.endDate || new Date().toISOString().split('T')[0],
          payment: processedContract.payment || 0,
        });

        toast({
          title: 'Success!',
          description: `Contract "${newContract.fileName}" processed and a new deal was created.`,
        });
        resolve();
      }, 3000);
    });
  };

  return (
    <AppDataContext.Provider
      value={{
        deals,
        contracts,
        addDeal,
        updateDealStatus,
        processContract,
        updateContractStatus,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (context === undefined) {
    throw new Error('useAppData must be used within an AppProvider');
  }
  return context;
}
