import { Routes, Route, Navigate } from 'react-router';
import { DashboardLayout } from './layouts/DashboardLayout';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { OverviewPage } from './pages/OverviewPage';
import { PropertiesPage } from './pages/PropertiesPage';
import { PropertyFormPage } from './pages/PropertyFormPage';
import { LeadsPage } from './pages/LeadsPage';
import { BrandingPage } from './pages/BrandingPage';
import { ContactPage } from './pages/ContactPage';
import { TeamPage } from './pages/TeamPage';
import { SubscriptionPage } from './pages/SubscriptionPage';
import { SettingsPage } from './pages/SettingsPage';
import { OrganizationPage } from './pages/OrganizationPage';
import { DomainPage } from './pages/DomainPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { TwoFactorPage } from './pages/TwoFactorPage';
import { NoOrganizationPage } from './pages/NoOrganizationPage';
import { SiteEditor } from './pages/editor/SiteEditor';

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/two-factor" element={<TwoFactorPage />} />
      <Route path="/no-organization" element={<NoOrganizationPage />} />
      <Route path="/dashboard/editor" element={<SiteEditor />} />
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<OverviewPage />} />
        <Route path="properties" element={<PropertiesPage />} />
        <Route path="properties/new" element={<PropertyFormPage />} />
        <Route path="properties/:id/edit" element={<PropertyFormPage />} />
        <Route path="leads" element={<LeadsPage />} />
        <Route path="branding" element={<BrandingPage />} />
        <Route path="domain" element={<DomainPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="team" element={<TeamPage />} />
        <Route path="subscription" element={<SubscriptionPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="organization" element={<OrganizationPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
