'use client';

import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import Dashboard from '@/components/crm/Dashboard';
import ProductionPage from '@/components/crm/production/ProductionPage';
import InventoryPage from '@/components/crm/inventory/InventoryPage';
import ClientList from '@/components/crm/clients/ClientList';
import ClientView from '@/components/crm/clients/ClientView';
import QuotationsPage from '@/components/crm/quotations/QuotationsPage';
import InternalGuidesPage from '@/components/crm/guides/InternalGuidesPage';
import CashReceiptsPage from '@/components/crm/cash/CashReceiptsPage';
import CalendarPage from '@/components/crm/calendar/CalendarPage';
import ReportsPage from '@/components/crm/reports/ReportsPage';
import SuppliersPage from '@/components/crm/suppliers/SuppliersPage';
import SettingsPage from '@/components/crm/settings/SettingsPage';
import GemsPage from '@/components/crm/gems/GemsPage';
import MarketIntelligencePage from '@/components/crm/intelligence/MarketIntelligencePage';
import WhatsAppPage from '@/components/crm/messages/WhatsAppPage';
import IngestorPage from '@/components/crm/ingestor/IngestorPage';
import GeminiChatPage from '@/components/crm/chat/GeminiChatPage';
import PurchasesPage from '@/components/crm/purchases/PurchasesPage';

export default function CRMPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  const handleNavigate = (tab: string, clientId: string | null = null) => {
    setActiveTab(tab);
    if (clientId) {
      setSelectedClientId(clientId);
    } else if (tab !== 'clients') {
      // Reset selection if moving to another module
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
      case 'quotations':
        return <QuotationsPage />;
      case 'guides':
        return <InternalGuidesPage />;
      case 'cash-receipts':
        return <CashReceiptsPage />;
      case 'calendar':
        return <CalendarPage />;
      case 'reports':
        return <ReportsPage />;
      case 'suppliers':
        return <SuppliersPage />;
      case 'gems':
        return <GemsPage />;
      case 'market-intelligence':
        return <MarketIntelligencePage />;
      case 'messages':
        return <WhatsAppPage />;
      case 'ingestor':
        return <IngestorPage />;
      case 'chat':
        return <GeminiChatPage />;
      case 'purchases':
        return <PurchasesPage />;
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
