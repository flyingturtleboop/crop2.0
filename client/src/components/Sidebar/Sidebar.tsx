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
        fixed top-0 left-0 h-full bg-gray-50 border-r
        transition-all duration-300 ease-in-out shadow-sm border-gray-300
        ${collapsed ? "w-16" : "w-64"}
      `}
    >
      <div className="flex flex-col h-full">
        <AccountToggle collapsed={collapsed} removeToken={removeToken} />
        
      

        <div className="mt-2 border-b border-gray-200"></div>

        <nav className="flex-1 overflow-y-auto px-1 py-2">
          <RouteSelect collapsed={collapsed} />
        </nav>

        <div className="border-t border-gray-200 py-2">
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="p-2 mx-auto flex justify-center w-full hover:bg-gray-100 rounded-md transition-colors"
          >
            {collapsed ? (
              <FiChevronRight size={18} className="text-gray-500" />
            ) : (
              <FiChevronLeft size={18} className="text-gray-500" />
            )}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;