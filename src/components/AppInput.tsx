type AppInputProps = React.ComponentPropsWithoutRef<'input'> & {
  className?: string;
};

export function AppInput({ className = "", ...props }: AppInputProps) {
  return (
    <input
      {...props}
      className={`w-full px-4 py-3 bg-[#2a2a2a] rounded-lg border border-gray-700 
        focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 
        text-white placeholder-gray-500 
        ${className}`}
    />
  );
} 