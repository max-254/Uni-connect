import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
}

const Card = ({ children, className = '', hoverable = false }: CardProps) => {
  return (
    <div 
      className={`
        bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-dark-sm
        ${hoverable ? 'transition-all duration-200 hover:shadow-lg dark:hover:shadow-dark-lg hover:scale-[1.02] hover:border-gray-300 dark:hover:border-gray-600' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

const CardHeader = ({ children, className = '' }: CardHeaderProps) => {
  return (
    <div className={`px-6 py-4 border-b border-gray-200 dark:border-gray-700 ${className}`}>
      {children}
    </div>
  );
};

interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
}

const CardBody = ({ children, className = '' }: CardBodyProps) => {
  return (
    <div className={`px-6 py-4 ${className}`}>
      {children}
    </div>
  );
};

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

const CardFooter = ({ children, className = '' }: CardFooterProps) => {
  return (
    <div className={`px-6 py-4 border-t border-gray-200 dark:border-gray-700 ${className}`}>
      {children}
    </div>
  );
};

export { Card, CardHeader, CardBody, CardFooter };