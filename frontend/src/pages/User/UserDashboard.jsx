import React from 'react'
import Button from "@/components/Button.jsx";
import { CHART_COLORS } from '@/config/theme';
import StatCard, { MiniChart } from '@/components/ui/stat-card';

const UserDashboard = () => {
  return (
      <div className="p-1 overflow-scroll">
      {/* User header start from here  */}
      <header className="mb-8">
        <div className='flex flex-row'>
          <div><h1 className="text-2xl font-bold text-slate-900">Users Dashboard</h1>
        <p className="text-sm text-slate-500">You will find everything about users in this platform.</p></div>
          <div className='ml-auto'> <Button text="Add User" variant="primary" /></div>
        </div>
      </header>
      {/* User Header End here  */}
      {/* //chart start here  */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <StatCard title="Total Users" value="2,75,197" color={CHART_COLORS.success} trend="up" />
              <StatCard title="Active Users" value="1,22,182" color={CHART_COLORS.danger} trend="down" />
              <StatCard title="Paid Users" value="6,22,182" color={CHART_COLORS.success} trend="up" />
            </div>
      {/* Chart end here  */}
      </div>
  )
}

export default UserDashboard