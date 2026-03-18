import { useState } from 'react';
import { AmazonDistributionModule } from './components/AmazonDistributionModule';
import { AnimatePresence } from 'motion/react';
import { Dashboard } from './components/Dashboard';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { ProductPipeline } from './components/ProductPipeline';
import { Customers } from './components/Customers';
import { VendorsPage } from './components/VendorsPage';
import { InventoryModule } from './components/InventoryModule';
import { ProductionModule } from './components/ProductionModule';
import { DesignLabModule } from './components/DesignLabModule';
import { OrdersPage } from './components/OrdersPage';
import { ProfileSettings } from './components/ProfileSettings';
import { SettingsPage } from './components/SettingsPage';
import { LoginPage } from './components/LoginPage';
import { ShipmentsModule } from './components/ShipmentsModule';
import { ContactsModule } from './components/ContactsModule';
import { ProductDatabaseModule } from './components/ProductDatabaseModule';
import { AnalyticsModule } from './components/AnalyticsModule';
import { PurchasingModule } from './components/PurchasingModule';
import { EmailTemplatesModule } from './components/EmailTemplatesModule';
import { WMSModule } from './components/WMSModule';
import { SalesLeadModule } from './components/SalesLeadModule';
import { Toaster } from './components/ui/sonner';

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profileImage: string;
  jobTitle: string;
  department: string;
  timezone: string;
}

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    firstName: 'Patrick',
    lastName: 'Lowenthal',
    email: 'patrick@activateswag.com',
    phone: '(305) 215-2199',
    profileImage: 'https://images.unsplash.com/photo-1655249493799-9cee4fe983bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBidXNpbmVzcyUyMHBlcnNvbiUyMGhlYWRzaG90fGVufDF8fHx8MTc3MDI1NDAyM3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    jobTitle: 'Product Manager',
    department: 'Product',
    timezone: 'America/New_York',
  });

  const handleNavigate = (page: string) => {
    if (page === 'logout') {
      setIsLoggedIn(false);
      setCurrentPage('dashboard');
    } else {
      setCurrentPage(page);
    }
  };

  const handleProfileUpdate = (updatedProfile: UserProfile) => {
    setUserProfile(updatedProfile);
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'profile':
        return <ProfileSettings userProfile={userProfile} onUpdate={handleProfileUpdate} />;
      case 'settings':
        return <SettingsPage />;
      case 'pipeline':
        return <ProductPipeline />;
      case 'customers':
        return <Customers />;
      case 'vendors':
        return <VendorsPage />;
      case 'inventory':
        return <InventoryModule />;
      case 'production':
      case 'manufacturing':
        return <ProductionModule />;
      case 'design-lab':
        return <DesignLabModule />;
      case 'all-orders':
      case 'orders':
      case 'pending-orders':
      case 'in-progress-orders':
      case 'completed-orders':
        return <OrdersPage onNavigate={handleNavigate} />;
      case 'shipments':
        return <ShipmentsModule />;
      case 'contacts':
        return <ContactsModule />;
      case 'product-database':
        return <ProductDatabaseModule />;
      case 'analytics':
        return <AnalyticsModule />;
      case 'sales-leads':
        return <SalesLeadModule />;
      case 'purchasing':
        return <PurchasingModule onNavigate={handleNavigate} />;
      case 'email-templates':
        return <EmailTemplatesModule />;
      case 'amazon-distribution':
        return <AmazonDistributionModule />;
      case 'wms':
      case 'wms-overview':
      case 'wms-warehouses':
      case 'wms-inventory':
      case 'wms-receiving':
      case 'wms-picking':
      case 'wms-shipping':
        return <WMSModule key={currentPage} initialTab={currentPage.replace('wms-', '').replace('wms', 'overview')} onNavigate={handleNavigate} />;
      default:
        return <Dashboard />;
    }
  };

  // Show login page if not logged in
  if (!isLoggedIn) {
    return <LoginPage onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="size-full flex bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <Sidebar 
        onNavigate={handleNavigate} 
        isMobileMenuOpen={isMobileMenuOpen}
        onCloseMobileMenu={() => setIsMobileMenuOpen(false)}
      />
      
      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar 
          onNavigate={handleNavigate} 
          userProfile={userProfile}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        />
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence>
            {renderContent()}
          </AnimatePresence>
        </div>
      </div>
      <Toaster position="top-right" richColors />
    </div>
  );
}
