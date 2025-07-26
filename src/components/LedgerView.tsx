import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { bankingService } from '@/services/bankingService';
import { LedgerResponse } from '@/types/banking';
import { formatCurrency, formatDate } from '@/utils/formatters';

interface LedgerViewProps {
  loanId: string;
}

export const LedgerView = ({ loanId }: LedgerViewProps) => {
  const [ledger, setLedger] = useState<LedgerResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLedger();
  }, [loanId]);

  const fetchLedger = async () => {
    try {
      setIsLoading(true);
      const response = await bankingService.getLedger(loanId);
      setLedger(response);
      setError(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch ledger');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading ledger...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-destructive">{error}</div>
        </CardContent>
      </Card>
    );
  }

  if (!ledger) return null;

  const progressPercentage = ((ledger.amount_paid / ledger.total_amount) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Loan Ledger</CardTitle>
          <CardDescription>
            Complete transaction history and current status for Loan ID: {ledger.loan_id}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Customer ID</p>
              <p className="text-lg font-semibold">{ledger.customer_id}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Principal Amount</p>
              <p className="text-lg font-semibold">{formatCurrency(ledger.principal)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
              <p className="text-lg font-semibold">{formatCurrency(ledger.total_amount)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Monthly EMI</p>
              <p className="text-lg font-semibold">{formatCurrency(ledger.monthly_emi)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-success/10 rounded-lg">
              <p className="text-sm font-medium text-success">Amount Paid</p>
              <p className="text-2xl font-bold text-success">{formatCurrency(ledger.amount_paid)}</p>
              <p className="text-xs text-muted-foreground">{progressPercentage}% of total</p>
            </div>
            <div className="p-4 bg-warning/10 rounded-lg">
              <p className="text-sm font-medium text-warning">Balance Amount</p>
              <p className="text-2xl font-bold text-warning">{formatCurrency(ledger.balance_amount)}</p>
            </div>
            <div className="p-4 bg-primary/10 rounded-lg">
              <p className="text-sm font-medium text-primary">EMIs Left</p>
              <p className="text-2xl font-bold text-primary">{ledger.emis_left}</p>
            </div>
          </div>

          <div className="w-full bg-secondary rounded-full h-2">
            <div 
              className="bg-success h-2 rounded-full transition-all duration-500" 
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">Loan Progress: {progressPercentage}%</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>
            All payments recorded for this loan
          </CardDescription>
        </CardHeader>
        <CardContent>
          {ledger.transactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No transactions recorded yet
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ledger.transactions.map((transaction) => (
                  <TableRow key={transaction.transaction_id}>
                    <TableCell className="font-mono text-sm">
                      {transaction.transaction_id.slice(0, 12)}...
                    </TableCell>
                    <TableCell>{formatDate(transaction.date)}</TableCell>
                    <TableCell className="font-semibold">
                      {formatCurrency(transaction.amount)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={transaction.type === 'EMI' ? 'default' : 'secondary'}>
                        {transaction.type}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};