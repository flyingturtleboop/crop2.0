import React from "react";
import { NavLink } from "react-router-dom";
import { IconType } from "react-icons";
import {
  FiDollarSign,
  FiHome,
  FiPaperclip,
  FiBarChart,
} from "react-icons/fi";

export const RouteSelect = () => {
  return (
    <div className="space-y-1">
      <SidebarRoute 
        Icon={FiHome} 
        to="/dashboard" 
        title="Dashboard" 
      />
      <SidebarRoute 
        Icon={FiDollarSign} 
        to="/dashboard/finances" 
        title="Finances" 
      />
      <SidebarRoute 
        Icon={FiPaperclip} 
        to="/dashboard/crops" 
        title="Crops" 
      />
      <SidebarRoute 
        Icon={FiBarChart} 
        to="/dashboard/analysis" 
        title="Analysis" 
      />
    </div>
  );
};

interface SidebarRouteProps {
  Icon: IconType;
  title: string;
  to: string;
}

const SidebarRoute: React.FC<SidebarRouteProps> = ({ Icon, title, to }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center justify-start gap-2 w-full rounded px-3 py-2 text-sm transition-colors ring-0 outline-none focus:outline-none focus:ring-0 ${
          isActive
            ? "bg-gray-100 text-green-800 font-bold"
            : "hover:bg-stone-200 bg-transparent text-stone-500"
        }`
      }
      end
    >
      <span className="text-gray-400">
        <Icon size={18} />
      </span>
      <span>{title}</span>
    </NavLink>
  );
};
