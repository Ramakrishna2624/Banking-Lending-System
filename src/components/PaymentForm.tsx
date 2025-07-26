import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { bankingService } from '@/services/bankingService';
import { PaymentRequest } from '@/types/banking';

interface PaymentFormProps {
  loanId: string;
  onPaymentRecorded: () => void;
}

export const PaymentForm = ({ loanId, onPaymentRecorded }: PaymentFormProps) => {
  const [formData, setFormData] = useState<PaymentRequest>({
    amount: 0,
    payment_type: 'EMI'
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (formData.amount <= 0) {
        throw new Error('Payment amount must be greater than 0');
      }

      const response = await bankingService.recordPayment(loanId, formData);
      
      toast({
        title: 'Payment Recorded',
        description: `${response.message} Remaining balance: $${response.remaining_balance.toFixed(2)}`,
      });

      // Reset form
      setFormData({
        amount: 0,
        payment_type: 'EMI'
      });
      
      onPaymentRecorded();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to record payment',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Record Payment</CardTitle>
        <CardDescription>
          Record a payment for loan ID: {loanId}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Payment Amount ($)</Label>
            <Input
              id="amount"
              type="number"
              min="0.01"
              step="0.01"
              value={formData.amount || ''}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                amount: parseFloat(e.target.value) || 0 
              }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Payment Type</Label>
            <Select 
              value={formData.payment_type} 
              onValueChange={(value: 'EMI' | 'LUMP_SUM') => 
                setFormData(prev => ({ ...prev, payment_type: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EMI">EMI Payment</SelectItem>
                <SelectItem value="LUMP_SUM">Lump Sum Payment</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'Recording Payment...' : 'Record Payment'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};