import React, { createContext, useContext, useState } from 'react';

interface TabsContextValue {
    value: string;
    onValueChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue | undefined>(undefined);

interface TabsProps {
    children: React.ReactNode;
    defaultValue?: string;
    value?: string;
    onValueChange?: (value: string) => void;
    className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
    children,
    defaultValue = '',
    value: controlledValue,
    onValueChange,
    className = ''
}) => {
    const [internalValue, setInternalValue] = useState(defaultValue);

    const value = controlledValue ?? internalValue;

    const handleValueChange = (newValue: string) => {
        if (!controlledValue) {
            setInternalValue(newValue);
        }
        onValueChange?.(newValue);
    };

    return (
        <TabsContext.Provider value={{ value, onValueChange: handleValueChange }}>
            <div className={className}>
                {children}
            </div>
        </TabsContext.Provider>
    );
};

interface TabsListProps {
    children: React.ReactNode;
    className?: string;
}

export const TabsList: React.FC<TabsListProps> = ({ children, className = '' }) => {
    return (
        <div className={`inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground ${className}`}>
            {children}
        </div>
    );
};

interface TabsTriggerProps {
    children: React.ReactNode;
    value: string;
    className?: string;
}

export const TabsTrigger: React.FC<TabsTriggerProps> = ({ children, value: triggerValue, className = '' }) => {
    const context = useContext(TabsContext);

    if (!context) {
        throw new Error('TabsTrigger must be used within a Tabs component');
    }

    const { value, onValueChange } = context;
    const isActive = value === triggerValue;

    return (
        <button
            type="button"
            className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${isActive
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                } ${className}`}
            onClick={() => onValueChange(triggerValue)}
        >
            {children}
        </button>
    );
};

interface TabsContentProps {
    children: React.ReactNode;
    value: string;
    className?: string;
}

export const TabsContent: React.FC<TabsContentProps> = ({ children, value: contentValue, className = '' }) => {
    const context = useContext(TabsContext);

    if (!context) {
        throw new Error('TabsContent must be used within a Tabs component');
    }

    const { value } = context;

    if (value !== contentValue) {
        return null;
    }

    return (
        <div className={`mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${className}`}>
            {children}
        </div>
    );
};
