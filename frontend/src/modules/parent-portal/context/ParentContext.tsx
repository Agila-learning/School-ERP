import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../../../core/api/axios';

export interface ChildProfile {
  _id: string;
  studentId: string; // The user ID or DB ID of the student
  studentIdNumber?: string;
  firstName: string;
  lastName: string;
  admissionNumber: string;
  class: string;
  section: string;
  rollNumber: string;
  gender: string;
  dateOfBirth: string;
  photoUrl?: string;
  currentEnrollmentId?: {
    _id: string;
    academicYearId?: {
      _id: string;
      name: string;
    };
    classId?: any;
    sectionId?: any;
  };
}

export interface ParentInfo {
  _id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  relationship?: string;
}

interface ParentContextType {
  childrenProfiles: ChildProfile[];
  selectedChildId: string | null;
  selectedChild: ChildProfile | null;
  parentInfo: ParentInfo | null;
  allParents: any[];
  selectedParentId: string | null;
  isLoading: boolean;
  error: string | null;
  setSelectedChildId: (id: string) => void;
  setSelectedParentId: (id: string) => void;
  refreshChildren: (overrideParentId?: string) => Promise<void>;
}

const ParentContext = createContext<ParentContextType | undefined>(undefined);

export const ParentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [childrenProfiles, setChildrenProfiles] = useState<ChildProfile[]>([]);
  const [selectedChildId, setSelectedChildIdState] = useState<string | null>(null);
  const [parentInfo, setParentInfo] = useState<ParentInfo | null>(null);
  const [allParents, setAllParents] = useState<any[]>([]);
  const [selectedParentId, setSelectedParentIdState] = useState<string | null>(
    localStorage.getItem('parentPortalActiveParentId') || null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChildren = async (overrideParentId?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const activePId = overrideParentId || selectedParentId;
      const url = activePId 
        ? `/parent-portal/dashboard?parentId=${activePId}` 
        : '/parent-portal/dashboard';
      
      const response = await api.get(url);
      const data = response.data?.data?.children || [];
      const parentsList = response.data?.data?.allParents || [];
      const parent = response.data?.data?.parent || null;

      setChildrenProfiles(data);
      setAllParents(parentsList);
      setParentInfo(parent);
      if (parent?._id && !selectedParentId) {
        setSelectedParentIdState(parent._id);
        localStorage.setItem('parentPortalActiveParentId', parent._id);
      }
      
      // Auto-select first child if none selected, or if selected doesn't exist anymore
      const storedChildId = localStorage.getItem('parentSelectedChildId');
      if (data.length > 0) {
        if (storedChildId && data.some((c: ChildProfile) => c.studentId === storedChildId || c._id === storedChildId)) {
          const match = data.find((c: ChildProfile) => c.studentId === storedChildId || c._id === storedChildId);
          setSelectedChildIdState(match?.studentId || data[0].studentId);
        } else {
          setSelectedChildIdState(data[0].studentId || data[0]._id);
          localStorage.setItem('parentSelectedChildId', data[0].studentId || data[0]._id);
        }
      } else {
        setSelectedChildIdState(null);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch parent dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChildren();
  }, [selectedParentId]);

  const setSelectedChildId = (id: string) => {
    setSelectedChildIdState(id);
    localStorage.setItem('parentSelectedChildId', id);
  };

  const setSelectedParentId = (id: string) => {
    setSelectedParentIdState(id);
    localStorage.setItem('parentPortalActiveParentId', id);
    fetchChildren(id);
  };

  const selectedChild = childrenProfiles.find(c => c.studentId === selectedChildId || c._id === selectedChildId) || null;

  return (
    <ParentContext.Provider 
      value={{ 
        childrenProfiles, 
        selectedChildId, 
        selectedChild, 
        parentInfo,
        allParents,
        selectedParentId,
        isLoading, 
        error, 
        setSelectedChildId,
        setSelectedParentId,
        refreshChildren: fetchChildren
      }}
    >
      {children}
    </ParentContext.Provider>
  );
};

export const useParentContext = () => {
  const context = useContext(ParentContext);
  if (context === undefined) {
    throw new Error('useParentContext must be used within a ParentProvider');
  }
  return context;
};

