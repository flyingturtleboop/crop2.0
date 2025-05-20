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
  return (
    <NavLink
      to={to}
      className={({ isActive }) => {
        return `flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
          isActive
            ? "bg-green-50 text-green-700 font-medium"
            : "hover:bg-gray-100 text-gray-600"
        } ${collapsed ? "justify-center" : "justify-start"}`;
      }}
      end
    >
      {({ isActive }) => (
        <>
          <Icon size={20} className={isActive ? "text-green-700" : "text-gray-500"} />
          {/* only render the label when not collapsed */}
          {!collapsed && <span className="text-sm">{title}</span>}
        </>
      )}
    </NavLink>
  );
};