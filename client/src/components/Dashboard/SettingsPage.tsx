// src/pages/SettingsPage.tsx
import React from "react";
import Profile from "../Dashboard/Settings/Profile";
import Notifications from "../Dashboard/Settings/Notification";

const SettingsPage: React.FC = () => (
  <div className="flex-1 overflow-auto relative z-10 bg-gray-900">
    <main className="max-w-4xl mx-auto py-6 px-4 lg:px-8">
      <Profile />
      <Notifications />
    </main>
  </div>
);

export default SettingsPage;
