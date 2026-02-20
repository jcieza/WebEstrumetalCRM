'use client';

import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import Dashboard from '@/components/crm/Dashboard';
import ProductionPage from '@/components/crm/production/ProductionPage';
import InventoryPage from '@/components/crm/inventory/InventoryPage';
import ClientList from '@/components/crm/clients/ClientList';
import ClientView from '@/components/crm/clients/ClientView';
import MarketIntelligencePage from '@/components/crm/intelligence/MarketIntelligencePage';
import WhatsAppPage from '@/components/crm/messages/WhatsAppPage';
import MailPage from '@/components/crm/mail/MailPage';
import CostStructurePage from '@/components/crm/cost-structure/CostStructurePage';
import SettingsPage from '@/components/crm/settings/SettingsPage';

export default function CRMPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hostname.startsWith('mail.')) {
      setActiveTab('emails');
    }
  }, []);

  const handleNavigate = (tab: string, clientId: string | null = null) => {
    setActiveTab(tab);
    if (clientId) {
      setSelectedClientId(clientId);
    } else if (tab !== 'clients') {
      setSelectedClientId(null);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigate} />;
      case 'production':
        return <ProductionPage />;
      case 'inventory':
        return <InventoryPage />;
      case 'clients':
        if (selectedClientId) {
          return <ClientView clientId={selectedClientId} onBack={() => setSelectedClientId(null)} />;
        }
        return <ClientList onNavigate={handleNavigate} />;
      case 'market-intelligence':
        return <MarketIntelligencePage />;
      case 'messages':
        return <WhatsAppPage />;
      case 'emails':
        return <MailPage />;
      case 'cost-structure':
        return <CostStructurePage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <Dashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={handleNavigate}>
      {renderContent()}
    </Layout>
  );
}
