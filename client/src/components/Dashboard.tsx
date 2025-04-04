import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './Sidebar/Sidebar';
import Dashboard_main from './Dashboard/Dashboard_main';
import Finances from './Dashboard/Finances';
import Crops from './Dashboard/Crops';
import Analysis from './Dashboard/Analysis';
import Settings from './Dashboard/Settings';

interface DashboardProps {
  removeToken: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ removeToken }) => {
  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar: remains stationary */}
      <aside className="w-64 h-screen fixed top-0 left-0 bg-white p-4">
        <Sidebar removeToken={removeToken} />
      </aside>

      {/* Main content area: switches based on nested routes */}
      <main className="ml-64 flex-1 p-8 w-full">
        <Routes>
          {/* Default nested route: Dashboard_main */}
          <Route index element={<Dashboard_main />} />
          <Route path="finances" element={<Finances />} />
          <Route path="crops/" element={<Crops />} />
          <Route path="analysis" element={<Analysis />} />
          <Route path="settings" element={<Settings />} />
          {/* Fallback: if no match, render Dashboard_main */}
          <Route path="*" element={<Dashboard_main />} />
        </Routes>
      </main>
    </div>
  );
};

export default Dashboard;
