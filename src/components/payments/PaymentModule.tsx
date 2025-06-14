import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  CreditCard, 
  CheckCircle, 
  AlertTriangle, 
  Download, 
  FileText, 
  Calendar, 
  Clock, 
  ChevronDown, 
  ChevronUp,
  Globe,
  Briefcase,
  Plane,
  Shield
} from 'lucide-react';
import { Card, CardHeader, CardBody } from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { paymentService, PaymentMethod, PaymentStatus, FeeType } from '../../services/paymentService';
import { useAuth } from '../../context/AuthContext';
import PaymentMethodModal from './PaymentMethodModal';
import PaymentReceiptModal from './PaymentReceiptModal';

interface PaymentModuleProps {
  applicationId?: string;
  courseId?: string;
}

const PaymentModule: React.FC<PaymentModuleProps> = ({ applicationId, courseId }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [fees, setFees] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedFeeId, setSelectedFeeId] = useState<string | null>(null);
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string | null>(null);
  const [expandedFeeId, setExpandedFeeId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentMethodModal, setShowPaymentMethodModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        if (user) {
          const [feesData, methodsData, historyData] = await Promise.all([
            paymentService.getOutstandingFees(user.id, applicationId, courseId),
            paymentService.getSavedPaymentMethods(user.id),
            paymentService.getPaymentHistory(user.id)
          ]);
          
          setFees(feesData);
          setPaymentMethods(methodsData);
          setPaymentHistory(historyData);
          
          // Select first fee by default if available
          if (feesData.length > 0) {
            setSelectedFeeId(feesData[0].id);
          }
          
          // Select first payment method by default if available
          if (methodsData.length > 0) {
            setSelectedPaymentMethodId(methodsData[0].id);
          }
        }
      } catch (error) {
        console.error('Error loading payment data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, applicationId, courseId]);

  const handlePaymentMethodAdded = (newMethod: PaymentMethod) => {
    setPaymentMethods(prev => [...prev, newMethod]);
    setSelectedPaymentMethodId(newMethod.id);
    setShowPaymentMethodModal(false);
  };

  const handleToggleExpand = (feeId: string) => {
    setExpandedFeeId(expandedFeeId === feeId ? null : feeId);
  };

  const handleMakePayment = async () => {
    if (!selectedFeeId || !selectedPaymentMethodId) {
      alert('Please select a fee and payment method');
      return;
    }

    try {
      setIsProcessing(true);
      
      const selectedFee = fees.find(fee => fee.id === selectedFeeId);
      const selectedMethod = paymentMethods.find(method => method.id === selectedPaymentMethodId);
      
      if (!selectedFee || !selectedMethod) {
        throw new Error('Selected fee or payment method not found');
      }
      
      const receipt = await paymentService.processPayment({
        userId: user!.id,
        feeId: selectedFeeId,
        paymentMethodId: selectedPaymentMethodId,
        amount: selectedFee.amount,
        currency: selectedFee.currency
      });
      
      // Update fees list to mark this fee as paid
      setFees(prev => 
        prev.map(fee => 
          fee.id === selectedFeeId 
            ? { ...fee, status: 'paid', paidAt: new Date().toISOString() } 
            : fee
        )
      );
      
      // Add to payment history
      setPaymentHistory(prev => [receipt, ...prev]);
      
      // Show receipt
      setSelectedReceipt(receipt);
      setShowReceiptModal(true);
      
      // Reset selection
      setSelectedFeeId(fees.find(fee => fee.status === 'pending')?.id || null);
    } catch (error) {
      console.error('Payment processing error:', error);
      alert('Payment processing failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleViewReceipt = (receipt: any) => {
    setSelectedReceipt(receipt);
    setShowReceiptModal(true);
  };

  const getStatusBadge = (status: PaymentStatus) => {
    const statusConfig = {
      'pending': { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300', icon: <Clock size={14} className="mr-1" /> },
      'paid': { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300', icon: <CheckCircle size={14} className="mr-1" /> },
      'overdue': { color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300', icon: <AlertTriangle size={14} className="mr-1" /> },
      'partial': { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300', icon: <DollarSign size={14} className="mr-1" /> }
    };
    
    const config = statusConfig[status] || statusConfig['pending'];
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.icon}
        {status === 'pending' ? 'Pending' : 
         status === 'paid' ? 'Paid' : 
         status === 'overdue' ? 'Overdue' : 
         'Partially Paid'}
      </span>
    );
  };

  const getFeeTypeIcon = (type: FeeType) => {
    switch (type) {
      case 'tuition':
        return <Briefcase className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
      case 'visa':
        return <Plane className="w-5 h-5 text-purple-600 dark:text-purple-400" />;
      case 'application':
        return <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />;
      case 'insurance':
        return <Shield className="w-5 h-5 text-red-600 dark:text-red-400" />;
      default:
        return <DollarSign className="w-5 h-5 text-gray-600 dark:text-gray-400" />;
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getPaymentMethodIcon = (type: string) => {
    switch (type) {
      case 'visa':
        return <div className="w-8 h-5 bg-blue-600 rounded text-white text-xs font-bold flex items-center justify-center">VISA</div>;
      case 'mastercard':
        return <div className="w-8 h-5 bg-red-600 rounded text-white text-xs font-bold flex items-center justify-center">MC</div>;
      case 'amex':
        return <div className="w-8 h-5 bg-blue-800 rounded text-white text-xs font-bold flex items-center justify-center">AMEX</div>;
      case 'bank':
        return <Globe className="w-5 h-5 text-gray-600 dark:text-gray-400" />;
      default:
        return <CreditCard className="w-5 h-5 text-gray-600 dark:text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Payments</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your tuition and visa fee payments
          </p>
        </div>
      </div>

      {/* Outstanding Fees */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Outstanding Fees</h3>
        </CardHeader>
        <CardBody className="p-0">
          {fees.length > 0 ? (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {fees.map((fee) => (
                <div key={fee.id} className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 flex-shrink-0 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                        {getFeeTypeIcon(fee.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center">
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                            {fee.name}
                          </h4>
                          <div className="ml-2">
                            {getStatusBadge(fee.status)}
                          </div>
                        </div>
                        <div className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <Calendar size={14} className="mr-1" />
                          <span>Due: {new Date(fee.dueDate).toLocaleDateString()}</span>
                          {fee.status === 'paid' && (
                            <>
                              <span className="mx-2">•</span>
                              <Clock size={14} className="mr-1" />
                              <span>Paid: {new Date(fee.paidAt).toLocaleDateString()}</span>
                            </>
                          )}
                        </div>
                        <div className="mt-2 text-lg font-bold text-gray-900 dark:text-white">
                          {formatCurrency(fee.amount, fee.currency)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 md:mt-0 flex items-center space-x-3">
                      {fee.status === 'pending' || fee.status === 'overdue' ? (
                        <div className="flex items-center">
                          <input
                            type="radio"
                            id={`fee-${fee.id}`}
                            name="selectedFee"
                            checked={selectedFeeId === fee.id}
                            onChange={() => setSelectedFeeId(fee.id)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <label htmlFor={`fee-${fee.id}`} className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                            Select
                          </label>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          leftIcon={<Download size={14} />}
                          onClick={() => handleViewReceipt(fee.receipt)}
                        >
                          Receipt
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleExpand(fee.id)}
                        rightIcon={expandedFeeId === fee.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      >
                        Details
                      </Button>
                    </div>
                  </div>
                  
                  {/* Expanded Details */}
                  {expandedFeeId === fee.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                        Fee Breakdown
                      </h5>
                      <div className="space-y-2">
                        {fee.breakdown.map((item: any, index: number) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">{item.description}</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {formatCurrency(item.amount, fee.currency)}
                            </span>
                          </div>
                        ))}
                        <div className="pt-2 border-t border-gray-200 dark:border-gray-700 flex justify-between text-sm font-bold">
                          <span className="text-gray-900 dark:text-white">Total</span>
                          <span className="text-gray-900 dark:text-white">
                            {formatCurrency(fee.amount, fee.currency)}
                          </span>
                        </div>
                      </div>
                      
                      {fee.notes && (
                        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                          <div className="flex items-start">
                            <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-2 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                                Important Information
                              </p>
                              <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-200">
                                {fee.notes}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Outstanding Fees
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                You have no outstanding fees at this time.
              </p>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Payment Section */}
      {fees.some(fee => fee.status === 'pending' || fee.status === 'overdue') && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Make a Payment</h3>
          </CardHeader>
          <CardBody className="p-6">
            <div className="space-y-6">
              {/* Selected Fee */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Fee to Pay
                </label>
                <select
                  value={selectedFeeId || ''}
                  onChange={(e) => setSelectedFeeId(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a fee</option>
                  {fees
                    .filter(fee => fee.status === 'pending' || fee.status === 'overdue')
                    .map(fee => (
                      <option key={fee.id} value={fee.id}>
                        {fee.name} - {formatCurrency(fee.amount, fee.currency)}
                      </option>
                    ))
                  }
                </select>
              </div>

              {/* Payment Methods */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Payment Method
                  </label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPaymentMethodModal(true)}
                    leftIcon={<CreditCard size={14} />}
                  >
                    Add New
                  </Button>
                </div>
                
                {paymentMethods.length > 0 ? (
                  <div className="space-y-3">
                    {paymentMethods.map(method => (
                      <div 
                        key={method.id}
                        className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedPaymentMethodId === method.id
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-700'
                            : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                        onClick={() => setSelectedPaymentMethodId(method.id)}
                      >
                        <input
                          type="radio"
                          id={`method-${method.id}`}
                          name="paymentMethod"
                          checked={selectedPaymentMethodId === method.id}
                          onChange={() => setSelectedPaymentMethodId(method.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <label htmlFor={`method-${method.id}`} className="ml-3 flex items-center flex-1 cursor-pointer">
                          <div className="mr-3">
                            {getPaymentMethodIcon(method.type)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {method.type === 'bank' ? 'Bank Transfer' : `${method.cardBrand} •••• ${method.last4}`}
                            </p>
                            {method.type !== 'bank' && (
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Expires {method.expiryMonth}/{method.expiryYear}
                              </p>
                            )}
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-6 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                    <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      No payment methods saved yet
                    </p>
                    <Button
                      onClick={() => setShowPaymentMethodModal(true)}
                      leftIcon={<CreditCard size={16} />}
                    >
                      Add Payment Method
                    </Button>
                  </div>
                )}
              </div>

              {/* Payment Summary */}
              {selectedFeeId && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Payment Summary</h4>
                  <div className="space-y-2">
                    {(() => {
                      const selectedFee = fees.find(fee => fee.id === selectedFeeId);
                      if (!selectedFee) return null;
                      
                      return (
                        <>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">{selectedFee.name}</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {formatCurrency(selectedFee.amount, selectedFee.currency)}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Processing Fee</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {formatCurrency(0, selectedFee.currency)}
                            </span>
                          </div>
                          <div className="pt-2 border-t border-gray-200 dark:border-gray-700 flex justify-between text-base font-bold">
                            <span className="text-gray-900 dark:text-white">Total</span>
                            <span className="text-gray-900 dark:text-white">
                              {formatCurrency(selectedFee.amount, selectedFee.currency)}
                            </span>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* Payment Button */}
              <div className="flex justify-end">
                <Button
                  onClick={handleMakePayment}
                  isLoading={isProcessing}
                  disabled={!selectedFeeId || !selectedPaymentMethodId}
                  leftIcon={<DollarSign size={16} />}
                >
                  Make Payment
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Payment History */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Payment History</h3>
        </CardHeader>
        <CardBody className="p-0">
          {paymentHistory.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Description
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Amount
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Receipt
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {paymentHistory.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {new Date(payment.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {payment.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {formatCurrency(payment.amount, payment.currency)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                          <CheckCircle size={12} className="mr-1" />
                          Completed
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewReceipt(payment)}
                          leftIcon={<Download size={14} />}
                        >
                          Receipt
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Payment History
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Your payment history will appear here once you make a payment.
              </p>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Payment Method Modal */}
      <PaymentMethodModal
        isOpen={showPaymentMethodModal}
        onClose={() => setShowPaymentMethodModal(false)}
        onSave={handlePaymentMethodAdded}
      />

      {/* Receipt Modal */}
      <PaymentReceiptModal
        isOpen={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
        receipt={selectedReceipt}
      />
    </div>
  );
};

export default PaymentModule;