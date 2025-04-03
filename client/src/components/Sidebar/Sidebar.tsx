import React from 'react'
import { AccountToggle } from './AccountToggle'
import { RouteSelect } from './RouteSelect'

interface SidebarProps {
  removeToken: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ removeToken }) => {
  return (
    <div>
      <div className="overflow sticky top-4 h-[calc(100vh-32px-48px)]">
        <AccountToggle removeToken={removeToken} />
        <RouteSelect />
      </div>
    </div>
  )
}

export default Sidebar
