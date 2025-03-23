import { type ComponentPropsWithoutRef } from "react";

type ButtonVariant = "primary" | "icon" | "gradient";
type ButtonSize = "sm" | "md" | "lg";

type AppButtonProps = ComponentPropsWithoutRef<"button"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
};

export function AppButton({ 
  children, 
  className = "", 
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled,
  ...props 
}: AppButtonProps) {
  const baseStyles = "font-medium transition-colors";
  
  const variants = {
    primary: "bg-cyan-500 text-white hover:bg-cyan-600",
    icon: "text-gray-500 hover:text-red-400",
    gradient: "bg-gradient-to-r from-pink-500 to-cyan-500 hover:from-pink-600 hover:to-cyan-600 text-white",
  };

  const sizes = {
    sm: "px-2 py-1 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3",
  };

  const disabledStyles = "bg-gray-700 cursor-not-allowed hover:bg-gray-700";
  
  const variantStyles = variants[variant];
  const sizeStyles = sizes[size];

  return (
    <button
      className={`
        ${baseStyles}
        ${variantStyles}
        ${sizeStyles}
        ${variant !== 'icon' ? 'rounded-lg' : ''}
        ${(disabled || isLoading) && variant !== 'icon' ? disabledStyles : ''}
        ${className}
      `}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center justify-center space-x-2">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>Loading...</span>
        </div>
      ) : children}
    </button>
  );
} 