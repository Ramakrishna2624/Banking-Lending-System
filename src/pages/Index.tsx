import { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { Navigation } from '@/components/Navigation';
import { LoanCreationForm } from '@/components/LoanCreationForm';
import { PaymentForm } from '@/components/PaymentForm';
import { LedgerView } from '@/components/LedgerView';
import { CustomerOverview } from '@/components/CustomerOverview';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { bankingService } from '@/services/bankingService';
import { Customer } from '@/types/banking';

type NavigationTab = 'loans' | 'payments' | 'ledger' | 'overview';

const Index = () => {
  const [activeTab, setActiveTab] = useState<NavigationTab>('loans');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedLoanId, setSelectedLoanId] = useState<string>('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    // Initialize sample data if needed
    bankingService.initializeSampleData();
    
    // Load customers
    const customerList = await bankingService.getCustomers();
    setCustomers(customerList);
  };

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleLoanSelect = (loanId: string) => {
    setSelectedLoanId(loanId);
    setActiveTab('ledger');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'loans':
        return (
          <LoanCreationForm 
            customers={customers} 
            onLoanCreated={handleRefresh}
          />
        );
      
      case 'payments':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Select Loan for Payment</CardTitle>
                <CardDescription>
                  Enter the loan ID to record a payment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="loanId">Loan ID</Label>
                  <Input
                    id="loanId"
                    placeholder="Enter loan ID..."
                    value={selectedLoanId}
                    onChange={(e) => setSelectedLoanId(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
            
            {selectedLoanId && (
              <PaymentForm 
                loanId={selectedLoanId}
                onPaymentRecorded={handleRefresh}
              />
            )}
          </div>
        );
      
      case 'ledger':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Select Loan for Ledger</CardTitle>
                <CardDescription>
                  Enter the loan ID to view transaction history
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="ledgerLoanId">Loan ID</Label>
                  <Input
                    id="ledgerLoanId"
                    placeholder="Enter loan ID..."
                    value={selectedLoanId}
                    onChange={(e) => setSelectedLoanId(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
            
            {selectedLoanId && (
              <LedgerView key={`${selectedLoanId}-${refreshTrigger}`} loanId={selectedLoanId} />
            )}
          </div>
        );
      
      case 'overview':
        return (
          <CustomerOverview 
            customers={customers}
            onLoanSelect={handleLoanSelect}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="container mx-auto px-4 py-8">
        {renderTabContent()}
      </main>
    </div>
  );
};

export default Index;
