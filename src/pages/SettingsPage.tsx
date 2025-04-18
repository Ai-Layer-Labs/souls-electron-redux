import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Outlet } from 'react-router-dom';

const SettingsPage = () => {
  const { t } = useTranslation();

  // This component acts as a layout/hub for settings sub-pages.
  // It could include shared settings elements or navigation.

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">{t("settings.title")}</h1>
      </header>

      {/* Optional: Add tabs or links for sub-navigation */}
      <nav className="mb-6 border-b border-border">
        <ul className="flex gap-4">
          <li>
            <Link
              to="/settings/model"
              className="pb-2 border-b-2 border-transparent hover:border-primary hover:text-primary transition-colors"
            // Add active styling based on route match if desired
            >
              {t("sidebar.models")}
            </Link>
          </li>
          <li>
            <Link
              to="/settings/system"
              className="pb-2 border-b-2 border-transparent hover:border-primary hover:text-primary transition-colors"
            // Add active styling based on route match if desired
            >
              {t("sidebar.system")}
            </Link>
          </li>
          {/* Add other settings sections here */}
        </ul>
      </nav>

      {/* Render the child route component */}
      <Outlet />
    </div>
  );
};

export default SettingsPage;