
'use client';

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
  useEffect,
} from 'react';
import type { Deal, Contract, DealStatus } from '@/lib/types';
import { mockContracts, mockDeals } from '@/lib/mock-data';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';

interface AppDataContextType {
  deals: Deal[];
  contracts: Contract[];
  addDeal: (values: Omit<Deal, 'id' | 'status' | 'paid'>) => Promise<void>;
  updateDealStatus: (dealId: string, newStatus: DealStatus) => Promise<void>;
  processContract: (file: File) => Promise<void>;
  updateContractStatus: (
    contractId: string,
    newStatus: Contract['status']
  ) => void;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [contracts, setContracts] = useState<Contract[]>(mockContracts);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchDeals = async () => {
      if (!db) {
        console.warn('Firebase not configured. Using mock data for Deals.');
        setDeals(mockDeals);
        setLoading(false);
        return;
      }
      try {
        const dealsCollection = collection(db, 'deals');
        const q = query(dealsCollection, orderBy('createdAt', 'desc'));
        const dealSnapshot = await getDocs(q);
        const dealsList = dealSnapshot.docs.map((doc) => {
          const data = doc.data();
          const dueDate = (data.dueDate as Timestamp)
            .toDate()
            .toISOString()
            .split('T')[0];
          return {
            id: doc.id,
            ...data,
            dueDate,
          } as Deal;
        });
        setDeals(dealsList);
      } catch (error) {
        console.error('Error fetching deals: ', error);
        toast({
          title: 'Firebase Error',
          description: 'Could not fetch deals. Using mock data as fallback.',
          variant: 'destructive',
        });
        setDeals(mockDeals);
      } finally {
        setLoading(false);
      }
    };

    fetchDeals();
  }, [toast]);

  const addDeal = async (values: Omit<Deal, 'id' | 'status' | 'paid'>) => {
    if (!db) {
      const newDeal: Deal = {
        id: crypto.randomUUID(),
        ...values,
        status: 'Upcoming',
        paid: false,
      };
      setDeals((prev) => [newDeal, ...prev]);
      toast({
        title: 'Success (Offline)!',
        description: `New deal with ${newDeal.brandName} has been added locally.`,
      });
      return;
    }
    try {
      const newDealData = {
        ...values,
        dueDate: new Date(values.dueDate),
        status: 'Upcoming' as DealStatus,
        paid: false,
        createdAt: serverTimestamp(),
      };
      const docRef = await addDoc(collection(db, 'deals'), newDealData);

      const newDeal: Deal = {
        id: docRef.id,
        ...values,
        status: 'Upcoming',
        paid: false,
      };
      setDeals((prev) => [newDeal, ...prev]);

      toast({
        title: 'Success!',
        description: `New deal with ${newDeal.brandName} has been added.`,
      });
    } catch (error) {
      console.error('Error adding deal: ', error);
      toast({
        title: 'Error adding deal',
        description:
          'Could not save the deal to the database. Please check your connection and Firebase setup.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateDealStatus = async (dealId: string, newStatus: DealStatus) => {
    const originalDeals = deals;
    setDeals((prev) =>
      prev.map((deal) =>
        deal.id === dealId ? { ...deal, status: newStatus } : deal
      )
    );

    if (!db) {
      toast({
        title: 'Status Updated (Offline)!',
        description: `Deal status has been changed to "${newStatus}" locally.`,
      });
      return;
    }

    try {
      const dealRef = doc(db, 'deals', dealId);
      await updateDoc(dealRef, {
        status: newStatus,
      });
      toast({
        title: 'Status Updated!',
        description: `Deal status has been changed to "${newStatus}".`,
      });
    } catch (error) {
      console.error('Error updating deal status: ', error);
      setDeals(originalDeals);
      toast({
        title: 'Error updating status',
        description: 'Could not update the deal status in the database.',
        variant: 'destructive',
      });
    }
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

    return new Promise<void>((resolve) => {
      setTimeout(async () => {
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

        await addDeal({
          brandName: processedContract.brandName || 'Unnamed Brand',
          campaignName: `Campaign for ${processedContract.fileName}`,
          deliverables: '1 post, 2 stories',
          dueDate:
            processedContract.endDate ||
            new Date().toISOString().split('T')[0],
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
