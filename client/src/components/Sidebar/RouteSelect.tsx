import React from "react";
import { IconType } from "react-icons";
import {
  FiDollarSign,
  FiHome,
  FiLink,
  FiPaperclip,
  FiUsers,
} from "react-icons/fi";

export const RouteSelect = () => {
  return (
    <div className="space-y-1">
      <SidebarRoute Icon={FiHome} selected={true} title="Dashboard" />
      <SidebarRoute Icon={FiUsers} selected={false} title="Team" />
      <SidebarRoute Icon={FiPaperclip} selected={false} title="Invoices" />
      <SidebarRoute Icon={FiLink} selected={false} title="Integrations" />
      <SidebarRoute Icon={FiDollarSign} selected={false} title="Finance" />
    </div>
  );
};

const SidebarRoute = ({
    selected,
    Icon,
    title,
  }: {
    selected: boolean;
    Icon: IconType;
    title: string;
  }) => {
    return (
        <button
        className={`flex items-center justify-start gap-2 w-full rounded px-3 py-2 text-sm transition-colors
    ring-0 outline-none focus:outline-none focus:ring-0 ${
          selected
            ? "bg-green-100 text-green-800 font-semibold"
            : "hover:bg-stone-200 bg-transparent text-stone-500 shadow-none"
        }`}
      >
        <span className={selected ? "text-green-600" : "text-gray-400"}>
          <Icon size={18} />
        </span>
        <span>{title}</span>
      </button>
    );
  };