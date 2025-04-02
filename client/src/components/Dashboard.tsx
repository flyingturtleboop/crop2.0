import Dashboard_main from "./Dashboard/Dashboard_main"
import Sidebar from "./Sidebar/Sidebar"

const Dashboard = () => {
  return (
    <div className="flex min-h-screen bg-white">
      {/*  Sidebar: left */}
      <aside className="w-64 h-screen fixed top-0 left-0 border-r bg-white p-4">
        <Sidebar />
      </aside>

      {/* Main content*/}
      <main className="ml-64 flex-1 p-8">
        <Dashboard_main />
      </main>
    </div>
    /*
    <main className="grid gap-4 p-4 grid-cols-[220px,_1fr] ">
      <Dashboard_main />
      <Sidebar />
    </main>*/
  )
}

export default Dashboard
