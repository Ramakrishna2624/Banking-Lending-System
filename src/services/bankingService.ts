import { 
  Customer, 
  Loan, 
  Payment, 
  LoanCreationRequest, 
  LoanCreationResponse,
  PaymentRequest,
  PaymentResponse,
  LedgerResponse,
  CustomerOverviewResponse
} from '@/types/banking';

// Mock database using localStorage
const STORAGE_KEYS = {
  CUSTOMERS: 'banking_customers',
  LOANS: 'banking_loans',
  PAYMENTS: 'banking_payments'
};

class BankingService {
  // Utility methods for localStorage
  private getStorageData<T>(key: string): T[] {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  private setStorageData<T>(key: string, data: T[]): void {
    localStorage.setItem(key, JSON.stringify(data));
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Initialize with sample data
  initializeSampleData(): void {
    const customers = this.getStorageData<Customer>(STORAGE_KEYS.CUSTOMERS);
    if (customers.length === 0) {
      const sampleCustomers: Customer[] = [
        {
          customer_id: 'CUST001',
          name: 'John Doe',
          created_at: new Date().toISOString()
        },
        {
          customer_id: 'CUST002', 
          name: 'Jane Smith',
          created_at: new Date().toISOString()
        },
        {
          customer_id: 'CUST003',
          name: 'Robert Johnson',
          created_at: new Date().toISOString()
        }
      ];
      this.setStorageData(STORAGE_KEYS.CUSTOMERS, sampleCustomers);
    }
  }

  // LEND: Create a new loan
  async createLoan(request: LoanCreationRequest): Promise<LoanCreationResponse> {
    const loans = this.getStorageData<Loan>(STORAGE_KEYS.LOANS);
    
    // Calculate loan details using simple interest
    const principal = request.loan_amount;
    const years = request.loan_period_years;
    const rate = request.interest_rate_yearly;
    
    // I = P * N * (R / 100)
    const totalInterest = principal * years * (rate / 100);
    // A = P + I
    const totalAmount = principal + totalInterest;
    // Monthly EMI = A / (N * 12)
    const monthlyEmi = totalAmount / (years * 12);
    
    const loan: Loan = {
      loan_id: this.generateId(),
      customer_id: request.customer_id,
      principal_amount: principal,
      total_amount: totalAmount,
      interest_rate: rate,
      loan_period_years: years,
      monthly_emi: monthlyEmi,
      status: 'ACTIVE',
      created_at: new Date().toISOString()
    };
    
    loans.push(loan);
    this.setStorageData(STORAGE_KEYS.LOANS, loans);
    
    return {
      loan_id: loan.loan_id,
      customer_id: loan.customer_id,
      total_amount_payable: totalAmount,
      monthly_emi: monthlyEmi
    };
  }

  // PAYMENT: Record a payment for a loan
  async recordPayment(loanId: string, request: PaymentRequest): Promise<PaymentResponse> {
    const loans = this.getStorageData<Loan>(STORAGE_KEYS.LOANS);
    const payments = this.getStorageData<Payment>(STORAGE_KEYS.PAYMENTS);
    
    const loan = loans.find(l => l.loan_id === loanId);
    if (!loan) {
      throw new Error('Loan not found');
    }
    
    const payment: Payment = {
      payment_id: this.generateId(),
      loan_id: loanId,
      amount: request.amount,
      payment_type: request.payment_type,
      payment_date: new Date().toISOString()
    };
    
    payments.push(payment);
    this.setStorageData(STORAGE_KEYS.PAYMENTS, payments);
    
    // Calculate remaining balance
    const totalPaid = this.getTotalPaidForLoan(loanId);
    const remainingBalance = loan.total_amount - totalPaid;
    const emisLeft = Math.ceil(remainingBalance / loan.monthly_emi);
    
    // Update loan status if fully paid
    if (remainingBalance <= 0) {
      loan.status = 'PAID_OFF';
      this.setStorageData(STORAGE_KEYS.LOANS, loans);
    }
    
    return {
      payment_id: payment.payment_id,
      loan_id: loanId,
      message: 'Payment recorded successfully.',
      remaining_balance: Math.max(0, remainingBalance),
      emis_left: Math.max(0, emisLeft)
    };
  }

  // LEDGER: View loan details and transaction history
  async getLedger(loanId: string): Promise<LedgerResponse> {
    const loans = this.getStorageData<Loan>(STORAGE_KEYS.LOANS);
    const payments = this.getStorageData<Payment>(STORAGE_KEYS.PAYMENTS);
    
    const loan = loans.find(l => l.loan_id === loanId);
    if (!loan) {
      throw new Error('Loan not found');
    }
    
    const loanPayments = payments.filter(p => p.loan_id === loanId);
    const totalPaid = loanPayments.reduce((sum, p) => sum + p.amount, 0);
    const remainingBalance = loan.total_amount - totalPaid;
    const emisLeft = Math.ceil(remainingBalance / loan.monthly_emi);
    
    const transactions = loanPayments.map(p => ({
      transaction_id: p.payment_id,
      date: p.payment_date,
      amount: p.amount,
      type: p.payment_type
    }));
    
    return {
      loan_id: loan.loan_id,
      customer_id: loan.customer_id,
      principal: loan.principal_amount,
      total_amount: loan.total_amount,
      monthly_emi: loan.monthly_emi,
      amount_paid: totalPaid,
      balance_amount: Math.max(0, remainingBalance),
      emis_left: Math.max(0, emisLeft),
      transactions
    };
  }

  // ACCOUNT OVERVIEW: View all loans for a customer
  async getCustomerOverview(customerId: string): Promise<CustomerOverviewResponse> {
    const loans = this.getStorageData<Loan>(STORAGE_KEYS.LOANS);
    const customerLoans = loans.filter(l => l.customer_id === customerId);
    
    if (customerLoans.length === 0) {
      throw new Error('No loans found for customer');
    }
    
    const loansWithDetails = customerLoans.map(loan => {
      const totalPaid = this.getTotalPaidForLoan(loan.loan_id);
      const remainingBalance = loan.total_amount - totalPaid;
      const emisLeft = Math.ceil(remainingBalance / loan.monthly_emi);
      
      return {
        loan_id: loan.loan_id,
        principal: loan.principal_amount,
        total_amount: loan.total_amount,
        total_interest: loan.total_amount - loan.principal_amount,
        emi_amount: loan.monthly_emi,
        amount_paid: totalPaid,
        emis_left: Math.max(0, emisLeft),
        status: loan.status
      };
    });
    
    return {
      customer_id: customerId,
      total_loans: customerLoans.length,
      loans: loansWithDetails
    };
  }

  // Get all customers
  async getCustomers(): Promise<Customer[]> {
    return this.getStorageData<Customer>(STORAGE_KEYS.CUSTOMERS);
  }

  // Helper method to calculate total paid for a loan
  private getTotalPaidForLoan(loanId: string): number {
    const payments = this.getStorageData<Payment>(STORAGE_KEYS.PAYMENTS);
    return payments
      .filter(p => p.loan_id === loanId)
      .reduce((sum, p) => sum + p.amount, 0);
  }
}

export const bankingService = new BankingService();