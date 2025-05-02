"use client";
import ProfileSection from "../Dashboard/Settings/ProfileSection";
import NotificationsSection from "../Dashboard/Settings/NotificationsSection";
import DangerZoneSection from "../Dashboard/Settings/DangerZoneSection";

export default function SettingsPage() {
  return (
    <div className="p-10 flex flex-col items-start space-y-10 min-h-screen bg-gray-50">
      <h1 className="text-4xl font-bold mb-12">Settings</h1>

      <div className="flex flex-col gap-10 w-full">
        <ProfileSection />
        <NotificationsSection />
        <DangerZoneSection />
      </div>
    </div>
  );
}
