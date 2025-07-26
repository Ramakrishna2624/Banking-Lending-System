import { Button } from '@/components/ui/button';
import { CreditCard, DollarSign, FileText, Users } from 'lucide-react';

type NavigationTab = 'loans' | 'payments' | 'ledger' | 'overview';

interface NavigationProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
}

export const Navigation = ({ activeTab, onTabChange }: NavigationProps) => {
  const tabs = [
    { id: 'loans' as const, label: 'Create Loan', icon: CreditCard },
    { id: 'payments' as const, label: 'Record Payment', icon: DollarSign },
    { id: 'ledger' as const, label: 'View Ledger', icon: FileText },
    { id: 'overview' as const, label: 'Customer Overview', icon: Users },
  ];

  return (
    <nav className="bg-card border-b">
      <div className="container mx-auto px-4">
        <div className="flex space-x-1 overflow-x-auto py-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'default' : 'ghost'}
                onClick={() => onTabChange(tab.id)}
                className="flex items-center space-x-2 whitespace-nowrap"
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};