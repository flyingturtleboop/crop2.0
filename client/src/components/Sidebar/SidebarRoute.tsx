// src/components/Sidebar/SidebarRoute.tsx
import React from "react";
import { NavLink } from "react-router-dom";
import { IconType } from "react-icons";

export interface SidebarRouteProps {
  Icon: IconType;
  title: string;
  to: string;
  collapsed: boolean;
}

export const SidebarRoute: React.FC<SidebarRouteProps> = ({
  Icon,
  title,
  to,
  collapsed,
}) => {
  // choose a larger icon size
  const size = collapsed ? 24 : 18;

  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-2 px-3 py-2 text-sm rounded transition-colors ${
          isActive
            ? "bg-gray-100 text-green-800 font-bold"
            : "hover:bg-stone-200 text-stone-500"
        } ${collapsed ? "justify-center" : "justify-start"}`
      }
      end
    >
      <Icon size={size} />
      {/* only render the label when not collapsed */}
      {!collapsed && <span>{title}</span>}
    </NavLink>
  );
};
