// src/components/Sidebar/Sidebar.tsx
import React from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { AccountToggle } from "./AccountToggle";
import { RouteSelect } from "./RouteSelect";

export interface SidebarProps {
  removeToken: () => void;
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}

const Sidebar: React.FC<SidebarProps> = ({
  removeToken,
  collapsed,
  setCollapsed,
}) => {
  return (
    <aside
      className={`
        fixed top-0 left-0 h-full bg-white border-r
        transition-all duration-300 ease-in-out border-b border-stone-300 mb-4
        ${collapsed ? "w-16" : "w-64"}
      `}
    >
      <div className="flex flex-col h-full">
        <AccountToggle collapsed={collapsed} removeToken={removeToken} />

        <nav className="flex-1 overflow-y-auto">
          <RouteSelect collapsed={collapsed} />
        </nav>

        <button
          onClick={() => setCollapsed((c) => !c)}
          className={`"p-5 m-1 rounded hover:bg-stone-200 self-end transition-colors"
          ${collapsed ? 'ml-10' : 'ml-auto'} `}
        >
          {collapsed ? (
            <FiChevronRight size={20} />
          ) : (
            <FiChevronLeft size={20} />
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
