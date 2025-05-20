import React from "react";
import { FiDollarSign, FiHome, FiBarChart, FiMapPin, FiSettings, FiUsers, FiFileText, FiLink } from "react-icons/fi";
import { PiPlant } from "react-icons/pi";
import { FaCalendarAlt } from "react-icons/fa";
import { SidebarRoute } from "./SidebarRoute";

interface RouteSelectProps {
  collapsed: boolean;
}

export const RouteSelect: React.FC<RouteSelectProps> = ({ collapsed }) => (
  <div className="space-y-1">
    <SidebarRoute Icon={FiHome} to="/dashboard" title="Dashboard" collapsed={collapsed} />
    <SidebarRoute Icon={FiDollarSign} to="/dashboard/finances" title="Finance" collapsed={collapsed} />
    <SidebarRoute Icon={PiPlant} to="/dashboard/crops" title="Crops" collapsed={collapsed} />
    <SidebarRoute Icon={FiBarChart} to="/dashboard/analysis" title="Analysis" collapsed={collapsed} />
    <SidebarRoute Icon={FiMapPin} to="/dashboard/maps" title="Maps" collapsed={collapsed} />
    <SidebarRoute Icon={FaCalendarAlt} to="/dashboard/calendar" title="Calendar" collapsed={collapsed} />
    <SidebarRoute Icon={FiSettings} to="/dashboard/settings" title="Settings" collapsed={collapsed} />
  </div>
);