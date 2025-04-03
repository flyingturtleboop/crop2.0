import React from "react";
import { NavLink } from "react-router-dom";
import { IconType } from "react-icons";
import {
  FiDollarSign,
  FiHome,
  FiPaperclip,
  FiBarChart,
} from "react-icons/fi";

interface RouteSelectProps {
  collapsed: boolean; // ← new prop
}

export const RouteSelect: React.FC<RouteSelectProps> = ({ collapsed }) => {
  return (
    <div className="space-y-2">
      <SidebarRoute
        Icon={FiHome}
        to="/dashboard"
        title="Dashboard"
        collapsed={collapsed}
      />
      <SidebarRoute
        Icon={FiDollarSign}
        to="/dashboard/finances"
        title="Finances"
        collapsed={collapsed}
      />
      <SidebarRoute
        Icon={FiPaperclip}
        to="/dashboard/crops"
        title="Crops"
        collapsed={collapsed}
      />
      <SidebarRoute
        Icon={FiBarChart}
        to="/dashboard/analysis"
        title="Analysis"
        collapsed={collapsed}
      />
    </div>
  );
};

// ---- SidebarRoute subcomponent ----

interface SidebarRouteProps {
  Icon: IconType;
  title: string;
  to: string;
  collapsed: boolean; // ← new prop
}

const SidebarRoute: React.FC<SidebarRouteProps> = ({
  Icon,
  title,
  to,
  collapsed,
}) => {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        `flex items-center gap-2 w-full rounded px-3 py-2 text-sm transition-colors ring-0 outline-none focus:outline-none focus:ring-0 ${
          isActive
            ? "bg-gray-100 text-green-800 font-bold"
            : "hover:bg-stone-200 bg-transparent text-stone-500"
        }`
      }
    >
      {/* Always show the icon */}
      <span className="text-gray-400 font-bold">
        <Icon size={18} />
      </span>

      {/* Hide the text if collapsed */}
      {!collapsed && <span>{title}</span>}
    </NavLink>
  );
};
