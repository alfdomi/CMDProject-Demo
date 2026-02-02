import React, { createContext, useContext, useState, type ReactNode } from 'react';

interface FinanceContextType {
    selectedProject: string;
    setSelectedProject: (project: string) => void;
    currentProjectData: any | null;
    setCurrentProjectData: (data: any) => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [selectedProject, setSelectedProject] = useState<string>('all');
    const [currentProjectData, setCurrentProjectData] = useState<any | null>(null);

    return (
        <FinanceContext.Provider value={{ selectedProject, setSelectedProject, currentProjectData, setCurrentProjectData }}>
            {children}
        </FinanceContext.Provider>
    );
};

export const useFinanceContext = () => {
    const context = useContext(FinanceContext);
    if (!context) {
        throw new Error('useFinanceContext must be used within a FinanceProvider');
    }
    return context;
};
