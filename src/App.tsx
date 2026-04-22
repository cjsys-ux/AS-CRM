import { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
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
import { SetPasswordPage } from './components/SetPasswordPage';
import { ResetPasswordPage } from './components/ResetPasswordPage';
import { ShipmentsModule } from './components/ShipmentsModule';
import { ContactsModule } from './components/ContactsModule';
import { ProductDatabaseModule } from './components/ProductDatabaseModule';
import { AnalyticsModule } from './components/AnalyticsModule';
import { PurchasingModule } from './components/PurchasingModule';
import { EmailTemplatesModule } from './components/EmailTemplatesModule';
import { AmazonDistributionModule } from './components/AmazonDistributionModule';
import { WMSModule } from './components/WMSModule';
import { SalesLeadModule } from './components/SalesLeadModule';
import { BillingModule } from './components/BillingModule';
import { CustomerServiceModule } from './components/CustomerServiceModule';
import { AnimatePresence } from 'motion/react';
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
  const { isAuthenticated, isLoading, user, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    profileImage: '',
    jobTitle: '',
    department: '',
    timezone: 'America/New_York',
  });

  useEffect(() => {
    if (user) {
      const nameParts = (user.name || '').split(' ');
      setUserProfile((prev) => ({
        ...prev,
        firstName: user.given_name || nameParts[0] || '',
        lastName: user.family_name || nameParts.slice(1).join(' ') || '',
        email: user.email || '',
        profileImage: user.picture || prev.profileImage,
      }));
    }
  }, [user]);

  useEffect(() => {
    if (!user?.sub || user.sub.startsWith('local|')) return;
    fetch(`/api/users/me?userId=${encodeURIComponent(user.sub)}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data) {
          setUserProfile((prev) => ({
            ...prev,
            ...(data.profile_image_key ? { profileImage: data.profile_image_key } : {}),
            ...(data.phone ? { phone: data.phone } : {}),
            ...(data.timezone ? { timezone: data.timezone } : {}),
            ...(data.jobTitle ? { jobTitle: data.jobTitle } : {}),
            ...(data.department ? { department: data.department } : {}),
          }));
        }
      })
      .catch(() => {});
  }, [user?.sub]);

  const handleNavigate = (page: string) => {
    if (page === 'logout') {
      logout();
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
        return <OrdersPage />;
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
        return <PurchasingModule />;
      case 'email-templates':
        return <EmailTemplatesModule />;
      case 'amazon-distribution':
        return <AmazonDistributionModule />;
      case 'billing':
        return <BillingModule />;
      case 'customer-service':
        return <CustomerServiceModule />;
      case 'wms':
      case 'wms-overview':
      case 'wms-warehouses':
      case 'wms-inventory':
      case 'wms-receiving':
      case 'wms-picking':
      case 'wms-shipping':
        return (
          <WMSModule
            key={currentPage}
            initialTab={currentPage.replace('wms-', '').replace('wms', 'overview')}
            onNavigate={handleNavigate}
          />
        );
      default:
        return <Dashboard />;
    }
  };

  // Intercept invite password-setup links before the auth gate
  const urlParams = new URLSearchParams(window.location.search);
  const inviteToken = urlParams.get('token');
  if (window.location.pathname === '/set-password' && inviteToken) {
    return <SetPasswordPage token={inviteToken} />;
  }
  if (window.location.pathname === '/reset-password' && inviteToken) {
    return <ResetPasswordPage token={inviteToken} />;
  }

  if (isLoading) {
    return (
      <div className="size-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="text-white text-xl font-semibold animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="w-full h-screen overflow-hidden flex bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
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