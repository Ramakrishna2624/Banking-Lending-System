import { Building2 } from 'lucide-react';

export const Header = () => {
  return (
    <header className="bg-primary text-primary-foreground shadow-lg">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center space-x-3">
          <Building2 className="h-8 w-8" />
          <div>
            <h1 className="text-2xl font-bold">SecureBank</h1>
            <p className="text-sm opacity-90">Lending Management System</p>
          </div>
        </div>
      </div>
    </header>
  );
};