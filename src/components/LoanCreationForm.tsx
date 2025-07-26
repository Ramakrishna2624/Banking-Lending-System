import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { bankingService } from '@/services/bankingService';
import { Customer, LoanCreationRequest } from '@/types/banking';

interface LoanCreationFormProps {
  customers: Customer[];
  onLoanCreated: () => void;
}

export const LoanCreationForm = ({ customers, onLoanCreated }: LoanCreationFormProps) => {
  const [formData, setFormData] = useState<LoanCreationRequest>({
    customer_id: '',
    loan_amount: 0,
    loan_period_years: 0,
    interest_rate_yearly: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!formData.customer_id) {
        throw new Error('Please select a customer');
      }

      const response = await bankingService.createLoan(formData);
      
      toast({
        title: 'Loan Created Successfully',
        description: `Loan ID: ${response.loan_id}`,
      });

      // Reset form
      setFormData({
        customer_id: '',
        loan_amount: 0,
        loan_period_years: 0,
        interest_rate_yearly: 0
      });
      
      onLoanCreated();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create loan',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Loan</CardTitle>
        <CardDescription>
          Fill in the details to create a new loan for a customer
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customer">Customer</Label>
            <Select value={formData.customer_id} onValueChange={(value) => 
              setFormData(prev => ({ ...prev, customer_id: value }))
            }>
              <SelectTrigger>
                <SelectValue placeholder="Select a customer" />
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

          <div className="space-y-2">
            <Label htmlFor="amount">Loan Amount ($)</Label>
            <Input
              id="amount"
              type="number"
              min="1"
              step="0.01"
              value={formData.loan_amount || ''}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                loan_amount: parseFloat(e.target.value) || 0 
              }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="period">Loan Period (Years)</Label>
            <Input
              id="period"
              type="number"
              min="1"
              max="30"
              value={formData.loan_period_years || ''}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                loan_period_years: parseInt(e.target.value) || 0 
              }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rate">Interest Rate (% per year)</Label>
            <Input
              id="rate"
              type="number"
              min="0.1"
              max="50"
              step="0.1"
              value={formData.interest_rate_yearly || ''}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                interest_rate_yearly: parseFloat(e.target.value) || 0 
              }))}
              required
            />
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'Creating Loan...' : 'Create Loan'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};