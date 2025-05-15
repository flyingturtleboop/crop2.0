// src/components/Dashboard.tsx
import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";

import Sidebar from "./Sidebar/Sidebar";
import Dashboard_main from "./Dashboard/Dashboard_main";
import Finances from "./Dashboard/Finances";
import Crops from "./Dashboard/Crops";
import Analysis from "./Dashboard/Analysis";
import Maps from "./Dashboard/Maps";
import SettingsPage from "./Dashboard/SettingsPage";
import Calendar from "./Dashboard/Calendar"; // Import the Calendar component


interface DashboardProps {
  removeToken: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ removeToken }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        removeToken={removeToken}
      />

      {/* 
        flex-1 to fill rest of screen, 
        ml-16 / ml-64 to push right of sidebar,
        p-0 to remove padding so Maps can go edge-to-edge,
        overflow-visible so nothing gets clipped.
      */}
      <main
        className={`
          flex-1 transition-all duration-300 ease-in-out
          ${collapsed ? "ml-16" : "ml-64"} p-0 overflow-visible
        `}
      >
        <Routes>
          <Route index       element={<Dashboard_main />} />
          <Route path="finances" element={<Finances />} />
          <Route path="crops"    element={<Crops />} />
          <Route path="analysis" element={<Analysis />} />
          <Route path="maps"     element={<Maps />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*"        element={<Dashboard_main />} />
          <Route path="calendar" element={<Calendar />} />
        </Routes>
      </main>
    </div>
  );
};

export default Dashboard;
