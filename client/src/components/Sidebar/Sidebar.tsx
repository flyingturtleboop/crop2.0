import React, { useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { AccountToggle } from "./AccountToggle";
import { RouteSelect } from "./RouteSelect";

interface SidebarProps {
  removeToken: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ removeToken }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
        <div className="relative h-screen flex">
      {/* Sidebar container with border */}
      <div
        className={`bg-white border-r transition-all duration-200 ${
          collapsed ? "w-10" : "w-[28rem]" 
        }`}
      >
        <div className="overflow-y-scroll sticky top-4 h-[calc(100vh-32px-48px)] ">
          <AccountToggle collapsed={collapsed} removeToken={removeToken} />
          <RouteSelect />
        </div>
      </div>

      {/* Collapse/Expand Button with transition on left position */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute top-0 text-gray-500 hover:text-green-600 transition-all duration-100"
        style={{
          left: collapsed ? "4rem" : "15rem",
        }}
      >
        {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
      </button>

      {/* Main content area */}
      <div className="flex-1">
        {/* Your main content goes here */}
      </div>
    </div>
  );
};

export default Sidebar;
