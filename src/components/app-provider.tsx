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
import { auth, db, storage } from '@/lib/firebase';
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
  where,
  setDoc,
} from 'firebase/firestore';
import { type User, onAuthStateChanged, signOut } from 'firebase/auth';
import { ref, uploadBytes } from 'firebase/storage';

interface AppDataContextType {
  deals: Deal[];
  contracts: Contract[];
  user: User | null;
  loadingAuth: boolean;
  signOut: () => Promise<void>;
  addDeal: (values: Omit<Deal, 'id' | 'status' | 'paid'>) => Promise<void>;
  updateDealStatus: (dealId: string, newStatus: DealStatus) => Promise<void>;
  processContract: (file: File) => Promise<void>;
  updateContractStatus: (
    contractId: string,
    newStatus: Contract['status']
  ) => Promise<void>;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!auth) {
      setLoadingAuth(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setDeals([]);
      setContracts([]);
      setLoading(false);
      return;
    }
    const fetchAllData = async () => {
      if (!db) {
        console.warn(
          'Firebase not configured. Using mock data for Deals & Contracts.'
        );
        setDeals(mockDeals);
        setContracts(mockContracts);
        setLoading(false);
        return;
      }
      try {
        // Fetch Deals
        const dealsCollection = collection(db, 'deals');
        const qDeals = query(
          dealsCollection,
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const dealSnapshot = await getDocs(qDeals);
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

        // Fetch Contracts
        const contractsCollection = collection(db, 'contracts');
        const qContracts = query(
          contractsCollection,
          where('userId', '==', user.uid),
          orderBy('uploadDate', 'desc')
        );
        const contractSnapshot = await getDocs(qContracts);
        const contractsList = contractSnapshot.docs.map((doc) => {
          const data = doc.data();
          const uploadDate = data.uploadDate
            ? (data.uploadDate as Timestamp).toDate().toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0];
          return {
            id: doc.id,
            ...data,
            uploadDate,
          } as Contract;
        });
        setContracts(contractsList);
      } catch (error) {
        console.error('Error fetching data: ', error);
        toast({
          title: 'Firebase Error',
          description:
            'Could not fetch data. This may be due to a missing Firestore index. Please check the browser console for a link to create it.',
          variant: 'destructive',
        });
        setDeals(mockDeals);
        setContracts(mockContracts);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [toast, user]);

  const addDeal = async (values: Omit<Deal, 'id' | 'status' | 'paid'>) => {
    if (!db || !user) {
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
        userId: user.uid,
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

  const updateContractStatus = async (
    contractId: string,
    newStatus: Contract['status']
  ) => {
    const originalContracts = contracts;
    setContracts((prev) =>
      prev.map((contract) =>
        contract.id === contractId
          ? { ...contract, status: newStatus }
          : contract
      )
    );

    if (!db) {
      toast({
        title: 'Status Updated (Offline)!',
        description: `Contract status has been changed to "${newStatus}" locally.`,
      });
      return;
    }
    try {
      const contractRef = doc(db, 'contracts', contractId);
      await updateDoc(contractRef, {
        status: newStatus,
      });
      toast({
        title: 'Status Updated!',
        description: `Contract status has been changed to "${newStatus}".`,
      });
    } catch (error) {
      console.error('Error updating contract status: ', error);
      setContracts(originalContracts); // Revert on failure
      toast({
        title: 'Error updating status',
        description: 'Could not update the contract status in the database.',
        variant: 'destructive',
      });
    }
  };

  const processContract = async (file: File) => {
    if (!db || !storage || !user) {
      toast({
        title: 'Firebase Not Configured',
        description:
          'Please configure Firebase in your .env file to upload contracts.',
        variant: 'destructive',
      });
      return;
    }

    const contractId = doc(collection(db, 'temp')).id;
    const newContract: Contract = {
      id: contractId,
      fileName: file.name,
      uploadDate: new Date().toISOString().split('T')[0],
      status: 'Processing',
    };
    setContracts((prev) => [newContract, ...prev]);

    try {
      const storagePath = `contracts/${user.uid}/${contractId}-${file.name}`;
      const storageRef = ref(storage, storagePath);
      await uploadBytes(storageRef, file);

      const contractDocRef = doc(db, 'contracts', contractId);
      await setDoc(contractDocRef, {
        fileName: file.name,
        uploadDate: serverTimestamp(),
        status: 'Processing',
        userId: user.uid,
        storagePath: storagePath,
      });

      // Simulate AI processing for now
      setTimeout(async () => {
        const processedData = {
          status: 'Done' as const,
          brandName: 'AI Extracted Brand',
          startDate: '2024-08-01',
          endDate: '2024-09-01',
          payment: Math.floor(Math.random() * 2000) + 500,
        };

        await updateDoc(contractDocRef, processedData);

        setContracts((prev) =>
          prev.map((c) =>
            c.id === contractId ? { ...c, ...newContract, ...processedData } : c
          )
        );

        await addDeal({
          brandName: processedData.brandName,
          campaignName: `Campaign for ${file.name}`,
          deliverables: '1 post, 2 stories',
          dueDate: processedData.endDate,
          payment: processedData.payment,
        });

        toast({
          title: 'Success!',
          description: `Contract "${file.name}" processed and a new deal was created.`,
        });
      }, 3000);
    } catch (error) {
      console.error('Error processing contract:', error);
      setContracts((prev) => prev.filter((c) => c.id !== contractId));
      toast({
        title: 'Upload Failed',
        description: 'Could not upload or process the contract file.',
        variant: 'destructive',
      });
    }
  };

  const signOutUser = async () => {
    if (auth) {
      await signOut(auth);
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
      });
    }
  };

  return (
    <AppDataContext.Provider
      value={{
        user,
        loadingAuth,
        signOut: signOutUser,
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
