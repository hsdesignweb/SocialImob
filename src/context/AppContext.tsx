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
  derivedContent: Array<{
    title: string;
    category: string;
    body: string;
  }>;
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
}

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [propertyData, setPropertyData] = useState<PropertyData>({ description: '' });
  const [campaign, setCampaign] = useState<GeneratedContent | null>(null);
  const [strategy, setStrategy] = useState<CampaignStrategy | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const updatePropertyData = (updates: Partial<PropertyData>) => {
    setPropertyData(prev => ({ ...prev, ...updates }));
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
      setIsLoading
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
