
'use client';

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
  useEffect,
} from 'react';
import type {
  Deal,
  Contract,
  DealStatus,
  PerformancePost,
  UserProfile,
  ProfileType,
  NotificationSettings,
  Task,
} from '@/lib/types';
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
  getDoc,
  deleteDoc,
} from 'firebase/firestore';
import {
  type User,
  onAuthStateChanged,
  signOut,
  updateProfile,
  deleteUser,
  updatePassword,
} from 'firebase/auth';
import { ref, uploadBytes } from 'firebase/storage';
import { extractContractDetails } from '@/ai/flows/extract-contract-details';

interface AppDataContextType {
  deals: Deal[];
  contracts: Contract[];
  performancePosts: PerformancePost[];
  user: User | null;
  userProfile: UserProfile | null;
  loadingAuth: boolean;
  loadingData: boolean;
  signOut: () => Promise<void>;
  addDeal: (values: Omit<Deal, 'id' | 'status' | 'paid' | 'tasks'>) => Promise<void>;
  updateDealStatus: (dealId: string, newStatus: DealStatus) => Promise<void>;
  addPerformancePost: (
    postData: Omit<PerformancePost, 'id' | 'date'>
  ) => Promise<void>;
  processContract: (file: File) => Promise<void>;
  updateContractStatus: (
    contractId: string,
    newStatus: Contract['status']
  ) => Promise<void>;
  updateUserProfile: (data: {
    displayName: string;
    profileType: ProfileType;
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
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

function fileToDataUri(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const defaultNotificationSettings: NotificationSettings = {
  email: {
    dealReminders: true,
    paymentUpdates: true,
    featureNews: false,
  },
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [performancePosts, setPerformancePosts] = useState<PerformancePost[]>(
    []
  );
  const [loadingData, setLoadingData] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
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
      setPerformancePosts([]);
      setUserProfile(null);
      setLoadingData(false);
      return;
    }
    const fetchAllData = async () => {
      setLoadingData(true);
      if (!db) {
        console.warn('Firebase not configured. Using empty data arrays.');
        setDeals([]);
        setContracts([]);
        setPerformancePosts([]);
        setLoadingData(false);
        return;
      }
      try {
        // Fetch User Profile
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const profileData = userDocSnap.data() as UserProfile;
          if (!profileData.notificationSettings) {
            profileData.notificationSettings = defaultNotificationSettings;
          }
          if (!profileData.plan) {
            profileData.plan = 'Free';
          }
          setUserProfile(profileData);
        } else {
          // Create a default profile if it doesn't exist
          const defaultProfile: UserProfile = {
            profileType: 'influencer',
            notificationSettings: defaultNotificationSettings,
            plan: 'Free',
          };
          await setDoc(userDocRef, defaultProfile);
          setUserProfile(defaultProfile);
        }

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
          let dueDate: string;
          const dueDateVal = data.dueDate;

          if (dueDateVal && typeof dueDateVal.toDate === 'function') {
            dueDate = (dueDateVal as Timestamp)
              .toDate()
              .toISOString()
              .split('T')[0];
          } else if (typeof dueDateVal === 'string') {
            dueDate = dueDateVal.split('T')[0];
          } else {
            dueDate = new Date().toISOString().split('T')[0];
          }

          return {
            id: doc.id,
            ...data,
            dueDate,
            tasks: data.tasks || [],
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
          let uploadDate: string;
          const uploadDateVal = data.uploadDate;

          if (uploadDateVal && typeof uploadDateVal.toDate === 'function') {
            uploadDate = (uploadDateVal as Timestamp).toDate().toISOString();
          } else if (typeof uploadDateVal === 'string') {
            uploadDate = uploadDateVal;
          } else {
            uploadDate = new Date().toISOString();
          }

          return {
            id: doc.id,
            ...data,
            uploadDate: uploadDate.split('T')[0],
          } as Contract;
        });
        setContracts(contractsList);

        // Fetch Performance Posts
        const postsCollection = collection(db, 'performancePosts');
        const qPosts = query(
          postsCollection,
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const postSnapshot = await getDocs(qPosts);
        const postsList = postSnapshot.docs.map((doc) => {
          const data = doc.data();
          let date: string;
          const createdAtVal = data.createdAt;

          if (createdAtVal && typeof createdAtVal.toDate === 'function') {
            date = (createdAtVal as Timestamp)
              .toDate()
              .toISOString()
              .split('T')[0];
          } else {
            date = new Date().toISOString().split('T')[0];
          }
          return {
            id: doc.id,
            ...data,
            date,
          } as PerformancePost;
        });
        setPerformancePosts(postsList);
      } catch (error) {
        console.error('Error fetching data: ', error);
        toast({
          title: 'Firebase Error',
          description:
            'Could not fetch data. This may be due to a missing Firestore index. Please check the browser console for a link to create it.',
          variant: 'destructive',
        });
        setDeals([]);
        setContracts([]);
        setPerformancePosts([]);
      } finally {
        setLoadingData(false);
      }
    };

    fetchAllData();
  }, [toast, user]);

  const updateUserProfile = async (data: {
    displayName: string;
    profileType: ProfileType;
  }) => {
    if (!user || !db || !auth.currentUser) return;
    const { displayName, profileType } = data;

    const originalUser = { ...user };
    const originalProfile = { ...userProfile };

    // Optimistic update
    setUser({ ...user, displayName } as User);
    setUserProfile({ ...userProfile, profileType } as UserProfile);

    try {
      if (auth.currentUser.displayName !== displayName) {
        await updateProfile(auth.currentUser, { displayName });
      }
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, { profileType }, { merge: true });

      toast({
        title: 'Success',
        description: 'Your profile has been updated.',
      });
    } catch (error) {
      // Revert on failure
      setUser(originalUser);
      setUserProfile(originalProfile as UserProfile);
      console.error('Error updating profile: ', error);
      toast({
        title: 'Error',
        description: 'Could not update your profile. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const addDeal = async (values: Omit<Deal, 'id' | 'status' | 'paid' | 'tasks'>) => {
    if (!db || !user) {
      toast({
        title: 'Offline Mode',
        description: 'Cannot add deal while offline.',
        variant: 'destructive',
      });
      return;
    }
    
    if (userProfile?.plan === 'Free' && deals.length >= 10) {
      toast({
        title: 'Free Plan Limit Reached',
        description: 'Upgrade to the Pro plan to add more than 10 deals.',
        variant: 'destructive',
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
        tasks: [],
      };
      const docRef = await addDoc(collection(db, 'deals'), newDealData);

      const newDeal: Deal = {
        id: docRef.id,
        ...values,
        status: 'Upcoming',
        paid: false,
        tasks: [],
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

  const addPerformancePost = async (
    postData: Omit<PerformancePost, 'id' | 'date'>
  ) => {
    if (!db || !user) {
      toast({
        title: 'Offline Mode',
        description: 'Cannot add post while offline.',
        variant: 'destructive',
      });
      return;
    }
    try {
      const newPostData = {
        ...postData,
        createdAt: serverTimestamp(),
        userId: user.uid,
      };
      const docRef = await addDoc(
        collection(db, 'performancePosts'),
        newPostData
      );

      const newPost: PerformancePost = {
        id: docRef.id,
        date: new Date().toISOString().split('T')[0],
        ...postData,
      };
      setPerformancePosts((prev) => [newPost, ...prev]);

      toast({
        title: 'Success!',
        description: `New post "${newPost.postTitle}" has been added.`,
      });
    } catch (error) {
      console.error('Error adding performance post: ', error);
      toast({
        title: 'Error adding post',
        description: 'Could not save the post to the database.',
        variant: 'destructive',
      });
      throw error;
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
      // 1. Upload file to Firebase Storage
      const storagePath = `contracts/${user.uid}/${contractId}-${file.name}`;
      const storageRef = ref(storage, storagePath);
      await uploadBytes(storageRef, file);

      // 2. Create initial contract document in Firestore
      const contractDocRef = doc(db, 'contracts', contractId);
      await setDoc(contractDocRef, {
        fileName: file.name,
        uploadDate: serverTimestamp(),
        status: 'Processing',
        userId: user.uid,
        storagePath: storagePath,
      });

      // 3. Call AI flow to process the contract
      const contractDataUri = await fileToDataUri(file);
      const processedData = await extractContractDetails({ contractDataUri });

      const finalContractData = {
        status: 'Done' as const,
        brandName: processedData.brandName,
        startDate: processedData.startDate,
        endDate: processedData.endDate,
        payment: processedData.payment,
        deliverables: processedData.deliverables,
      };

      // 4. Update contract document with extracted details
      await updateDoc(contractDocRef, finalContractData);

      setContracts((prev) =>
        prev.map((c) =>
          c.id === contractId ? { ...c, ...newContract, ...finalContractData } : c
        )
      );

      // 5. Create a new deal based on the contract
      if (
        processedData.brandName &&
        processedData.endDate &&
        processedData.payment &&
        processedData.deliverables
      ) {
        await addDeal({
          brandName: processedData.brandName,
          campaignName: `Campaign for ${processedData.brandName}`,
          deliverables: processedData.deliverables,
          dueDate: processedData.endDate,
          payment: processedData.payment,
        });
      }

      toast({
        title: 'Success!',
        description: `Contract "${file.name}" processed and a new deal was created.`,
      });
    } catch (error) {
      console.error('Error processing contract:', error);
      // Update contract status to 'Error' if something went wrong
      setContracts((prev) =>
        prev.map((c) =>
          c.id === contractId ? { ...c, status: 'Error' } : c
        )
      );
      if (db) {
        const contractRef = doc(db, 'contracts', contractId);
        updateDoc(contractRef, { status: 'Error' }).catch(console.error);
      }
      toast({
        title: 'Processing Failed',
        description:
          'Could not analyze the contract file. Please check the file and try again.',
        variant: 'destructive',
      });
    }
  };

  const updateUserPassword = async (password: string) => {
    if (!auth) {
      throw new Error('Firebase not configured');
    }
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('No user is currently signed in.');
    }

    try {
      await updatePassword(currentUser, password);
    } catch (error) {
      console.error('Error updating password:', error);
      // Re-throw the error so the component can handle it and show a specific toast.
      throw error;
    }
  };

  const deleteAccount = async () => {
    if (!auth || !db) {
      throw new Error('Firebase not configured');
    }
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('No user is currently signed in.');
    }

    const userId = currentUser.uid;

    try {
      // For more robust data cleanup (e.g., deleting all deals, contracts),
      // using a Cloud Function triggered by user deletion is recommended.
      // Here, we'll just delete the main user profile document.
      const userDocRef = doc(db, 'users', userId);
      await deleteDoc(userDocRef);

      // Finally, delete the user from Firebase Authentication
      await deleteUser(currentUser);
    } catch (error) {
      console.error('Error deleting account:', error);
      // Re-throw the error so the component can handle it and show a specific toast.
      throw error;
    }
  };
  
  const updateNotificationSettings = async (settings: NotificationSettings) => {
    if (!user || !db) return;

    const originalProfile = { ...userProfile };

    // Optimistic update
    setUserProfile(prev => prev ? { ...prev, notificationSettings: settings } : null);

    try {
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, { notificationSettings: settings }, { merge: true });

      toast({
        title: 'Success',
        description: 'Your notification settings have been updated.',
      });
    } catch (error) {
      // Revert on failure
      setUserProfile(originalProfile as UserProfile);
      console.error('Error updating notification settings: ', error);
      toast({
        title: 'Error',
        description: 'Could not update your notification settings. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const dismissDealNotification = async (dealId: string) => {
    if (!db || !user) {
      toast({
        title: 'Offline Mode',
        description: 'Cannot dismiss notification while offline.',
        variant: 'destructive',
      });
      return;
    }

    const originalDeals = deals;
    setDeals((prev) =>
      prev.map((deal) =>
        deal.id === dealId ? { ...deal, notificationDismissed: true } : deal
      )
    );

    try {
      const dealRef = doc(db, 'deals', dealId);
      await updateDoc(dealRef, {
        notificationDismissed: true,
      });
      toast({
        title: 'Notification Dismissed',
      });
    } catch (error) {
      console.error('Error dismissing notification: ', error);
      setDeals(originalDeals);
      toast({
        title: 'Error',
        description: 'Could not dismiss the notification. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const updateUserPlan = (plan: 'Free' | 'Pro') => {
    if (!user || !db) return;
    const originalProfile = {...userProfile};

    setUserProfile((prev) => (prev ? { ...prev, plan } : null));

    const userDocRef = doc(db, 'users', user.uid);
    setDoc(userDocRef, { plan }, { merge: true }).then(() => {
      toast({
        title: 'Plan Updated!',
        description: `This is a simulation. You are now on the ${plan} plan.`,
      });
    }).catch((error) => {
        // Revert on failure
        setUserProfile(originalProfile as UserProfile);
        console.error('Error updating plan: ', error);
        toast({
            title: 'Error',
            description: 'Could not update your plan. Please try again.',
            variant: 'destructive',
        });
    });
  };

  const addTaskToDeal = async (dealId: string, taskTitle: string) => {
    if (!db || !user) return;
    const dealRef = doc(db, 'deals', dealId);

    const newTask: Task = {
      id: doc(collection(db, 'temp')).id,
      title: taskTitle,
      completed: false,
    };

    const originalDeals = deals;
    setDeals((prev) =>
      prev.map((d) =>
        d.id === dealId ? { ...d, tasks: [...d.tasks, newTask] } : d
      )
    );

    try {
      const dealSnap = await getDoc(dealRef);
      if (dealSnap.exists()) {
        const currentTasks = dealSnap.data().tasks || [];
        await updateDoc(dealRef, { tasks: [...currentTasks, newTask] });
        toast({ title: 'Task added' });
      }
    } catch (error) {
      console.error('Error adding task: ', error);
      setDeals(originalDeals);
      toast({
        title: 'Error',
        description: 'Could not add task.',
        variant: 'destructive',
      });
    }
  };

  const updateTaskStatus = async (
    dealId: string,
    taskId: string,
    completed: boolean
  ) => {
    if (!db || !user) return;
    const dealRef = doc(db, 'deals', dealId);
    const originalDeals = deals;

    setDeals((prevDeals) =>
      prevDeals.map((deal) => {
        if (deal.id === dealId) {
          return {
            ...deal,
            tasks: deal.tasks.map((task) =>
              task.id === taskId ? { ...task, completed } : task
            ),
          };
        }
        return deal;
      })
    );

    try {
      const dealSnap = await getDoc(dealRef);
      if (dealSnap.exists()) {
        const dealData = dealSnap.data();
        const updatedTasks = (dealData.tasks || []).map((task: Task) =>
          task.id === taskId ? { ...task, completed } : task
        );
        await updateDoc(dealRef, { tasks: updatedTasks });
      }
    } catch (error) {
      console.error('Error updating task: ', error);
      setDeals(originalDeals);
      toast({
        title: 'Error',
        description: 'Could not update task status.',
        variant: 'destructive',
      });
    }
  };

  const deleteTask = async (dealId: string, taskId: string) => {
    if (!db || !user) return;
    const dealRef = doc(db, 'deals', dealId);
    const originalDeals = deals;

    setDeals((prevDeals) =>
      prevDeals.map((deal) => {
        if (deal.id === dealId) {
          return { ...deal, tasks: deal.tasks.filter((t) => t.id !== taskId) };
        }
        return deal;
      })
    );

    try {
      const dealSnap = await getDoc(dealRef);
      if (dealSnap.exists()) {
        const dealData = dealSnap.data();
        const updatedTasks = (dealData.tasks || []).filter(
          (task: Task) => task.id !== taskId
        );
        await updateDoc(dealRef, { tasks: updatedTasks });
        toast({ title: 'Task deleted' });
      }
    } catch (error) {
      console.error('Error deleting task: ', error);
      setDeals(originalDeals);
      toast({
        title: 'Error',
        description: 'Could not delete task.',
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
        userProfile,
        loadingAuth,
        loadingData,
        signOut: signOutUser,
        deals,
        contracts,
        performancePosts,
        addDeal,
        updateDealStatus,
        addPerformancePost,
        processContract,
        updateContractStatus,
        updateUserProfile,
        updateUserPassword,
        deleteAccount,
        updateNotificationSettings,
        dismissDealNotification,
        updateUserPlan,
        addTaskToDeal,
        updateTaskStatus,
        deleteTask,
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
