import React from "react";
import { User } from "lucide-react";
import SettingSection from "./SettingsSection";

const Profile: React.FC = () => {
  // TODO: swap for real data / edit form
  const name = "John Doe";
  const email = "john.doe@example.com";
  const avatarUrl = "https://randomuser.me/api/portraits/men/3.jpg";

  return (
    <SettingSection icon={User} title="Profile">
      <div className="flex flex-col sm:flex-row items-center mb-6">
        <img
          src={avatarUrl}
          alt="Profile avatar"
          className="rounded-full w-20 h-20 object-cover mr-4"
        />
        <div>
          <h3 className="text-lg font-semibold text-gray-100">{name}</h3>
          <p className="text-gray-400">{email}</p>
        </div>
      </div>
      <button
        className="
          bg-indigo-600 hover:bg-indigo-700 
          text-white font-bold py-2 px-4 
          rounded transition duration-200
          w-full sm:w-auto
        "
      >
        Edit Profile
      </button>
    </SettingSection>
  );
};

export default Profile;
