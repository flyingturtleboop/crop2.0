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

interface DashboardProps {
  removeToken: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ removeToken }) => {
  // 1) Lift collapse-state here
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-white">
      {/* 2) Pass collapse-state & setter into Sidebar */}
      <Sidebar
        removeToken={removeToken}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      {/* 3) Shift your main content left margin */}
      <main
        className={`
          transition-all duration-300 ease-in-out
          ${collapsed ? "ml-16" : "ml-64"} p-8 flex-1
        `}
      >
        <Routes>
          <Route index element={<Dashboard_main />} />
          <Route path="finances" element={<Finances />} />
          <Route path="crops" element={<Crops />} />
          <Route path="analysis" element={<Analysis />} />
          <Route path="maps" element={<Maps />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<Dashboard_main />} />
        </Routes>
      </main>
    </div>
  );
};

export default Dashboard;
