interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <main className="max-w-6xl mx-auto px-4 py-8 text-white">
        {children}
      </main>
    </div>
  );
}

export function TwoColumns({ children }: LayoutProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      {children}
    </div>
  );
} 