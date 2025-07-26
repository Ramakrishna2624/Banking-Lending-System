import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { bankingService } from '@/services/bankingService';
import { Customer, CustomerOverviewResponse } from '@/types/banking';
import { formatCurrency } from '@/utils/formatters';

interface CustomerOverviewProps {
  customers: Customer[];
  onLoanSelect?: (loanId: string) => void;
}

export const CustomerOverview = ({ customers, onLoanSelect }: CustomerOverviewProps) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [overview, setOverview] = useState<CustomerOverviewResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedCustomerId) {
      fetchOverview();
    }
  }, [selectedCustomerId]);

  const fetchOverview = async () => {
    if (!selectedCustomerId) return;
    
    try {
      setIsLoading(true);
      const response = await bankingService.getCustomerOverview(selectedCustomerId);
      setOverview(response);
      setError(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch customer overview');
      setOverview(null);
    } finally {
      setIsLoading(false);
    }
  };

  const getTotalPortfolioValue = () => {
    if (!overview) return 0;
    return overview.loans.reduce((sum, loan) => sum + loan.total_amount, 0);
  };

  const getTotalPaidValue = () => {
    if (!overview) return 0;
    return overview.loans.reduce((sum, loan) => sum + loan.amount_paid, 0);
  };

  const getTotalOutstanding = () => {
    if (!overview) return 0;
    return overview.loans.reduce((sum, loan) => sum + (loan.total_amount - loan.amount_paid), 0);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Customer Account Overview</CardTitle>
          <CardDescription>
            View all loans and financial details for a specific customer
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Select Customer</label>
              <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a customer to view their portfolio" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map(customer => (
                    <SelectItem key={customer.customer_id} value={customer.customer_id}>
                      {customer.name} ({customer.customer_id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center">Loading customer overview...</div>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-destructive">{error}</div>
          </CardContent>
        </Card>
      )}

      {overview && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Summary</CardTitle>
              <CardDescription>
                Financial overview for {overview.customer_id}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-primary/10 rounded-lg">
                  <p className="text-sm font-medium text-primary">Total Loans</p>
                  <p className="text-2xl font-bold text-primary">{overview.total_loans}</p>
                </div>
                <div className="p-4 bg-accent/10 rounded-lg">
                  <p className="text-sm font-medium text-accent-foreground">Portfolio Value</p>
                  <p className="text-2xl font-bold text-accent-foreground">{formatCurrency(getTotalPortfolioValue())}</p>
                </div>
                <div className="p-4 bg-success/10 rounded-lg">
                  <p className="text-sm font-medium text-success">Total Paid</p>
                  <p className="text-2xl font-bold text-success">{formatCurrency(getTotalPaidValue())}</p>
                </div>
                <div className="p-4 bg-warning/10 rounded-lg">
                  <p className="text-sm font-medium text-warning">Outstanding</p>
                  <p className="text-2xl font-bold text-warning">{formatCurrency(getTotalOutstanding())}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Loan Details</CardTitle>
              <CardDescription>
                All loans for this customer
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Loan ID</TableHead>
                    <TableHead>Principal</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>EMI Amount</TableHead>
                    <TableHead>Amount Paid</TableHead>
                    <TableHead>EMIs Left</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {overview.loans.map((loan) => (
                    <TableRow key={loan.loan_id}>
                      <TableCell className="font-mono text-sm">
                        {loan.loan_id.slice(0, 12)}...
                      </TableCell>
                      <TableCell>{formatCurrency(loan.principal)}</TableCell>
                      <TableCell>{formatCurrency(loan.total_amount)}</TableCell>
                      <TableCell>{formatCurrency(loan.emi_amount)}</TableCell>
                      <TableCell className="font-semibold text-success">
                        {formatCurrency(loan.amount_paid)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={loan.emis_left === 0 ? 'secondary' : 'default'}>
                          {loan.emis_left}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={loan.status === 'PAID_OFF' ? 'secondary' : 'default'}>
                          {loan.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {onLoanSelect && (
                          <button
                            onClick={() => onLoanSelect(loan.loan_id)}
                            className="text-primary hover:underline text-sm"
                          >
                            View Details
                          </button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};