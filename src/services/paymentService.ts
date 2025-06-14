import { supabase } from '../lib/supabase';

export type PaymentStatus = 'pending' | 'paid' | 'overdue' | 'partial';
export type FeeType = 'tuition' | 'visa' | 'application' | 'insurance' | 'other';

export interface PaymentMethod {
  id: string;
  userId: string;
  type: 'card' | 'bank';
  // Card specific
  cardBrand?: string;
  last4?: string;
  expiryMonth?: string;
  expiryYear?: string;
  // Bank specific
  accountName?: string;
  accountNumber?: string;
  routingNumber?: string;
  bankName?: string;
  // Common
  isDefault: boolean;
  createdAt: string;
}

class PaymentService {
  private static instance: PaymentService;

  static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService();
    }
    return PaymentService.instance;
  }

  async getOutstandingFees(userId: string, applicationId?: string, courseId?: string): Promise<any[]> {
    // In a real app, this would fetch from your API
    // For demo purposes, we'll return mock data
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return [
      {
        id: 'fee-001',
        name: 'Tuition Fee - First Semester',
        type: 'tuition',
        amount: 15000,
        currency: 'USD',
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days from now
        status: 'pending',
        breakdown: [
          { description: 'Core Courses', amount: 9000 },
          { description: 'Lab Fees', amount: 3000 },
          { description: 'Technology Fee', amount: 2000 },
          { description: 'Library Access', amount: 1000 }
        ]
      },
      {
        id: 'fee-002',
        name: 'Visa Processing Fee',
        type: 'visa',
        amount: 535,
        currency: 'USD',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
        status: 'pending',
        breakdown: [
          { description: 'SEVIS Fee', amount: 350 },
          { description: 'Visa Application Fee', amount: 185 }
        ],
        notes: 'This fee is required for your F-1 student visa application. The receipt will be needed during your visa interview.'
      },
      {
        id: 'fee-003',
        name: 'Application Fee',
        type: 'application',
        amount: 100,
        currency: 'USD',
        dueDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
        status: 'paid',
        paidAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
        breakdown: [
          { description: 'Application Processing', amount: 75 },
          { description: 'Document Verification', amount: 25 }
        ],
        receipt: {
          id: 'rcpt-001',
          date: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
          amount: 100,
          currency: 'USD',
          description: 'Application Fee',
          paymentMethod: {
            type: 'card',
            cardBrand: 'Visa',
            last4: '4242'
          }
        }
      },
      {
        id: 'fee-004',
        name: 'Health Insurance - Annual',
        type: 'insurance',
        amount: 1200,
        currency: 'USD',
        dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
        status: 'overdue',
        breakdown: [
          { description: 'Basic Coverage', amount: 800 },
          { description: 'Dental Coverage', amount: 250 },
          { description: 'Vision Coverage', amount: 150 }
        ],
        notes: 'Health insurance is mandatory for all international students. Coverage period is for the entire academic year.'
      }
    ];
  }

  async getSavedPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    // In a real app, this would fetch from your API
    // For demo purposes, we'll return mock data
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 600));
    
    return [
      {
        id: 'pm-001',
        userId,
        type: 'card',
        cardBrand: 'Visa',
        last4: '4242',
        expiryMonth: '12',
        expiryYear: '25',
        isDefault: true,
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'pm-002',
        userId,
        type: 'card',
        cardBrand: 'Mastercard',
        last4: '5678',
        expiryMonth: '09',
        expiryYear: '26',
        isDefault: false,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'pm-003',
        userId,
        type: 'bank',
        accountName: 'John Smith',
        accountNumber: '****6789',
        routingNumber: '****4321',
        bankName: 'Bank of America',
        isDefault: false,
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
  }

  async addPaymentMethod(userId: string, paymentMethodData: any): Promise<PaymentMethod> {
    // In a real app, this would securely store payment info via a payment processor
    // For demo purposes, we'll simulate adding a payment method
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (paymentMethodData.type === 'card') {
      // Determine card brand based on first digit
      const firstDigit = paymentMethodData.cardNumber.replace(/\s+/g, '').charAt(0);
      let cardBrand = 'Unknown';
      
      if (firstDigit === '4') {
        cardBrand = 'Visa';
      } else if (firstDigit === '5') {
        cardBrand = 'Mastercard';
      } else if (firstDigit === '3') {
        cardBrand = 'Amex';
      } else if (firstDigit === '6') {
        cardBrand = 'Discover';
      }
      
      const last4 = paymentMethodData.cardNumber.replace(/\s+/g, '').slice(-4);
      
      return {
        id: `pm-${Date.now().toString(36)}`,
        userId,
        type: 'card',
        cardBrand,
        last4,
        expiryMonth: paymentMethodData.expiryMonth,
        expiryYear: paymentMethodData.expiryYear,
        isDefault: true,
        createdAt: new Date().toISOString()
      };
    } else {
      // Bank account
      const last4 = paymentMethodData.accountNumber.slice(-4);
      
      return {
        id: `pm-${Date.now().toString(36)}`,
        userId,
        type: 'bank',
        accountName: paymentMethodData.accountName,
        accountNumber: `****${last4}`,
        routingNumber: `****${paymentMethodData.routingNumber.slice(-4)}`,
        bankName: paymentMethodData.bankName,
        isDefault: true,
        createdAt: new Date().toISOString()
      };
    }
  }

  async processPayment(paymentData: {
    userId: string;
    feeId: string;
    paymentMethodId: string;
    amount: number;
    currency: string;
  }): Promise<any> {
    // In a real app, this would process the payment via a payment processor
    // For demo purposes, we'll simulate a payment
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Get payment method details
    const paymentMethods = await this.getSavedPaymentMethods(paymentData.userId);
    const paymentMethod = paymentMethods.find(pm => pm.id === paymentData.paymentMethodId);
    
    if (!paymentMethod) {
      throw new Error('Payment method not found');
    }
    
    // Get fee details
    const fees = await this.getOutstandingFees(paymentData.userId);
    const fee = fees.find(f => f.id === paymentData.feeId);
    
    if (!fee) {
      throw new Error('Fee not found');
    }
    
    // Generate receipt
    return {
      id: `rcpt-${Date.now().toString(36).toUpperCase()}`,
      date: new Date().toISOString(),
      amount: paymentData.amount,
      currency: paymentData.currency,
      description: fee.name,
      paymentMethod: {
        type: paymentMethod.type,
        cardBrand: paymentMethod.cardBrand,
        last4: paymentMethod.last4,
        bankName: paymentMethod.bankName
      },
      feeId: paymentData.feeId,
      userId: paymentData.userId
    };
  }

  async getPaymentHistory(userId: string): Promise<any[]> {
    // In a real app, this would fetch from your API
    // For demo purposes, we'll return mock data
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 700));
    
    return [
      {
        id: 'rcpt-001',
        date: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
        amount: 100,
        currency: 'USD',
        description: 'Application Fee',
        paymentMethod: {
          type: 'card',
          cardBrand: 'Visa',
          last4: '4242'
        }
      },
      {
        id: 'rcpt-002',
        date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        amount: 50,
        currency: 'USD',
        description: 'Document Processing Fee',
        paymentMethod: {
          type: 'card',
          cardBrand: 'Mastercard',
          last4: '5678'
        }
      }
    ];
  }
}

export const paymentService = PaymentService.getInstance();