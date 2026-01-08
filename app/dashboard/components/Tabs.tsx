'use client';

import { useState, ReactNode, createContext, useContext } from 'react';

// Context para compartilhar o estado das tabs
interface TabsContextType {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

function useTabsContext() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs components must be used within Tabs');
  }
  return context;
}

// Componente principal Tabs
interface TabsProps {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: ReactNode;
  className?: string;
}

export function Tabs({ defaultValue, value: controlledValue, onValueChange, children, className = '' }: TabsProps) {
  const [internalValue, setInternalValue] = useState(defaultValue || '');
  const isControlled = controlledValue !== undefined;
  const currentValue = isControlled ? controlledValue : internalValue;

  const handleValueChange = (newValue: string) => {
    if (!isControlled) {
      setInternalValue(newValue);
    }
    onValueChange?.(newValue);
  };

  return (
    <TabsContext.Provider value={{ value: currentValue, onValueChange: handleValueChange }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

// TabsList - Container dos botões
interface TabsListProps {
  children: ReactNode;
  className?: string;
}

export function TabsList({ children, className = '' }: TabsListProps) {
  // Classes base - se className já tem grid, não adiciona flex
  const hasGrid = className.includes('grid');
  const baseClasses = hasGrid
    ? 'rounded-md bg-gray-100 p-1 text-gray-500'
    : 'inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 text-gray-500';
  
  return (
    <div className={`${baseClasses} ${className}`}>
      {children}
    </div>
  );
}

// TabsTrigger - Botão da aba
interface TabsTriggerProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export function TabsTrigger({ value, children, className = '' }: TabsTriggerProps) {
  const { value: currentValue, onValueChange } = useTabsContext();
  const isActive = currentValue === value;

  return (
    <button
      type="button"
      onClick={() => onValueChange(value)}
      className={`
        inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50
        ${
          isActive
            ? 'bg-white text-indigo-600 shadow-sm'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        }
        ${className}
      `}
      role="tab"
      aria-selected={isActive}
    >
      {children}
    </button>
  );
}

// TabsContent - Conteúdo da aba
interface TabsContentProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export function TabsContent({ value, children, className = '' }: TabsContentProps) {
  const { value: currentValue } = useTabsContext();
  const isActive = currentValue === value;

  if (!isActive) {
    return null;
  }

  return (
    <div
      className={`mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 ${className}`}
      role="tabpanel"
    >
      {children}
    </div>
  );
}

// Componente de compatibilidade para manter o código existente funcionando
interface Tab {
  id: string;
  label: string;
  content: ReactNode;
}

interface TabsPropsLegacy {
  tabs: Tab[];
  defaultTab?: string;
}

export default function TabsLegacy({ tabs, defaultTab }: TabsPropsLegacy) {
  const initialTab = defaultTab && tabs.some(t => t.id === defaultTab) 
    ? defaultTab 
    : tabs[0]?.id || '';

  if (!tabs || tabs.length === 0) {
    return <div>Nenhuma aba disponível</div>;
  }

  return (
    <Tabs defaultValue={initialTab} className="w-full">
      <TabsList>
        {tabs.map((tab) => (
          <TabsTrigger key={tab.id} value={tab.id}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent key={tab.id} value={tab.id}>
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}
