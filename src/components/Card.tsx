type CardProps = React.PropsWithChildren<{
  className?: string;
}>;

export function Card({ children, className = "" }: CardProps) {
  return (
    <div className={`bg-[#1a1a1a] rounded-xl p-6 border border-gray-800 ${className}`}>
      {children}
    </div>
  );
}

type CardTitleProps = React.PropsWithChildren<{
  className?: string;
}>;

export function CardTitle({ children, className = "" }: CardTitleProps) {
  return (
    <h2 className={`text-xl font-semibold mb-4 ${className}`}>
      {children}
    </h2>
  );
} 