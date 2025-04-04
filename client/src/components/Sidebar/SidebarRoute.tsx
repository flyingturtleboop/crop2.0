import React from "react";
import { IconType } from "react-icons";

interface SidebarRouteProps {
  Icon: IconType;
  title: string;
  selected: boolean;
  collapsed: boolean; 
}

const SidebarRoute: React.FC<SidebarRouteProps> = ({
  selected,
  Icon,
  title,
  collapsed
}) => {
  return (
    <button
      className={`flex items-center justify-start gap-2 w-full rounded px-3 py-2 text-sm transition-colors
        ${selected ? "bg-green-100 text-green-800 font-semibold" : "hover:bg-stone-200 text-stone-500"}`}
    >
      <span className={selected ? "text-green-600" : "text-gray-400"}>
        <Icon size={20} />
      </span>

      {/* Hide title when collapsed */}
      {!collapsed && <span>{title}</span>}
    </button>
  );
};

export default SidebarRoute;
