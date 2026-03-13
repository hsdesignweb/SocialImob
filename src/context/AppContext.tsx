import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define types for our app data

export interface PropertyData {
  description: string;
  type?: string;
  location?: string;
  price?: string;
  features?: string[];
  buyerProfile?: string;
  goal?: string;
  missingInfo?: string[];
}

export interface CampaignStrategy {
  angle: string;
  persona: string;
  approach: string;
  narrative: string;
  sequence: string[];
}

export interface GeneratedContent {
  reelScript: {
    hooks: string[];
    body: string;
    cta: string;
    scenes: string;
  };
  funnelMessages: {
    abordagem: string[];
    followup: string[];
    encerramento: string[];
  };
  planner: Array<{
    day: number;
    title: string;
    topic: string;
    content: string;
  }>;
  traffic: {
    creatives: {
      top: string;
      middle: string;
      bottom: string;
    };
    segmentation: string;
  };
  executionGuide: {
    creativeTips: string[];
    publishingAdvice: string;
    engagementStrategy: string;
  };
  derivedContent10: Array<{
    type: string;
    content: string;
  }>;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  propertyData: PropertyData;
  strategy: CampaignStrategy;
  campaign: GeneratedContent;
}

interface AppState {
  propertyData: PropertyData;
  setPropertyData: (data: PropertyData) => void;
  updatePropertyData: (updates: Partial<PropertyData>) => void;
  campaign: GeneratedContent | null;
  setCampaign: (campaign: GeneratedContent) => void;
  strategy: CampaignStrategy | null;
  setStrategy: (strategy: CampaignStrategy) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  history: HistoryItem[];
  setHistory: (history: HistoryItem[]) => void;
  addToHistory: (item: Omit<HistoryItem, 'id' | 'timestamp'>) => void;
  loadFromHistory: (item: HistoryItem) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [propertyData, setPropertyData] = useState<PropertyData>({ description: '' });
  const [campaign, setCampaign] = useState<GeneratedContent | null>(null);
  const [strategy, setStrategy] = useState<CampaignStrategy | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    const saved = localStorage.getItem('socialimob_history');
    return saved ? JSON.parse(saved) : [];
  });

  const updatePropertyData = (updates: Partial<PropertyData>) => {
    setPropertyData(prev => ({ ...prev, ...updates }));
  };

  const addToHistory = (item: Omit<HistoryItem, 'id' | 'timestamp'>) => {
    const newItem: HistoryItem = {
      ...item,
      id: Math.random().toString(36).substring(7),
      timestamp: Date.now()
    };
    const newHistory = [newItem, ...history].slice(0, 3); // Keep only last 3
    setHistory(newHistory);
    localStorage.setItem('socialimob_history', JSON.stringify(newHistory));
  };

  const loadFromHistory = (item: HistoryItem) => {
    setPropertyData(item.propertyData);
    setStrategy(item.strategy);
    setCampaign(item.campaign);
  };

  return (
    <AppContext.Provider value={{
      propertyData,
      setPropertyData,
      updatePropertyData,
      campaign,
      setCampaign,
      strategy,
      setStrategy,
      isLoading,
      setIsLoading,
      history,
      setHistory,
      addToHistory,
      loadFromHistory
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppStore = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppStore must be used within an AppProvider');
  }
  return context;
};
