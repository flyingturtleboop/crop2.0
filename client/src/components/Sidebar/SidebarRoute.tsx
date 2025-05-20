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
      end
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2 rounded-md transition-all
         ${isActive ? "bg-white shadow-sm" : "hover:bg-gray-100"}
         ${collapsed ? "justify-center" : "justify-start"}`
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            size={20}
            className={isActive ? "text-green-700" : "text-gray-600"}
          />
          {!collapsed && (
            <span
              className={`text-sm ${
                isActive ? "text-green-700" : "text-gray-600"
              }`}
            >
              {title}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
};
