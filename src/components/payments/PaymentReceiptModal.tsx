import React from 'react';
import { X, Download, CheckCircle, Calendar, Clock, CreditCard, User, FileText, Copy, Printer } from 'lucide-react';
import Button from '../ui/Button';

interface PaymentReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  receipt: any;
}

const PaymentReceiptModal: React.FC<PaymentReceiptModalProps> = ({
  isOpen,
  onClose,
  receipt
}) => {
  const handleDownload = () => {
    // In a real app, this would generate and download a PDF
    alert('Receipt download would start here');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = () => {
    // In a real app, this would copy the receipt ID to clipboard
    navigator.clipboard.writeText(receipt?.id || '');
    alert('Receipt ID copied to clipboard');
  };

  if (!isOpen || !receipt) return null;

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Payment Receipt
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Receipt #{receipt.id}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            leftIcon={<X size={16} />}
          >
            Close
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Success Message */}
            <div className="text-center mb-6">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Payment Successful!
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Your payment has been processed successfully.
              </p>
            </div>

            {/* Receipt Details */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Receipt Number:</span>
                  <div className="flex items-center">
                    <span className="font-medium text-gray-900 dark:text-white mr-2">{receipt.id}</span>
                    <button 
                      onClick={handleCopy}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Date:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {new Date(receipt.date).toLocaleDateString()} {new Date(receipt.date).toLocaleTimeString()}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Payment Method:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {receipt.paymentMethod.type === 'bank' 
                      ? 'Bank Transfer' 
                      : `${receipt.paymentMethod.cardBrand} •••• ${receipt.paymentMethod.last4}`}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Description:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{receipt.description}</span>
                </div>
                
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Amount:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(receipt.amount, receipt.currency)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Processing Fee:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(0, receipt.currency)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700 mt-2">
                    <span className="font-bold text-gray-900 dark:text-white">Total Paid:</span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {formatCurrency(receipt.amount, receipt.currency)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                This receipt serves as proof of payment. Please keep it for your records. If you have any questions about this payment, please contact our finance department.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-6">
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={handlePrint}
              leftIcon={<Printer size={16} />}
            >
              Print
            </Button>
            <Button
              onClick={handleDownload}
              leftIcon={<Download size={16} />}
            >
              Download PDF
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentReceiptModal;