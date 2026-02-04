import { HTMLAttributes, ReactNode } from 'react';

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'destructive';
  children?: ReactNode;
}

export function Alert({ variant = 'default', className = '', children, ...props }: AlertProps) {
  const variantClasses = {
    default: 'bg-blue-50 border-blue-200 text-blue-900',
    destructive: 'bg-red-50 border-red-200 text-red-900',
  };

  return (
    <div
      className={`border rounded-lg p-4 ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

interface AlertDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {}

export function AlertDescription({ className = '', ...props }: AlertDescriptionProps) {
  return <p className={`text-sm ${className}`} {...props} />;
}
