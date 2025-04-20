import React, { useState } from "react";
import { Bell } from "lucide-react";
import SettingSection from "./SettingsSection";

const Notifications: React.FC = () => {
  const [push, setPush] = useState(true);
  const [email, setEmail] = useState(false);
  const [sms, setSms] = useState(true);

  const rows: Array<[
    label: string,
    value: boolean,
    setter: React.Dispatch<React.SetStateAction<boolean>>
  ]> = [
    ["Push Notifications", push, setPush],
    ["Email Notifications", email, setEmail],
    ["SMS Notifications", sms, setSms],
  ];

  return (
    <SettingSection icon={Bell} title="Notifications">
      {rows.map(([label, val, setter]) => (
        <div
          key={label}
          className="flex items-center justify-between py-2 border-b last:border-b-0 border-gray-700"
        >
          <span className="text-gray-200">{label}</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only"
              checked={val}
              onChange={() => setter(!val)}
            />
            <div
              className={`
                w-10 h-6 rounded-full transition
                ${val ? "bg-indigo-600" : "bg-gray-500"}
              `}
            />
            <div
              className={`
                absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow 
                transform transition
                ${val ? "translate-x-4" : "translate-x-0"}
              `}
            />
          </label>
        </div>
      ))}
    </SettingSection>
  );
};

export default Notifications;
