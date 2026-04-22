import React from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbList,
} from '@/components/ui/breadcrumb';
import StatCard from '@/components/ui/stat-card'; // Assuming it has the mini-graph inside
import Button from "@/components/Button.jsx";
import { ChevronRightIcon, SearchIcon, BellIcon } from '@/components/ui/icons';

export default function InfluencerDashboard() {
  const sponsoredMagazines = [
    { id: 1, name: 'Magazines 1', desc: 'List of all the magazines you been looking for' },
    { id: 2, name: 'Magazines', desc: 'List of all the magazines you been looking for' },
    { id: 3, name: 'Magazines', desc: 'List of all the magazines you been looking for' },
  ];

  return (
    <div className="p-1">
      {/* 1. Top Navigation / Search Bar */}
      <div className="flex items-center justify-between mb-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem><BreadcrumbLink href="/">Settings</BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbLink>Another link</BreadcrumbLink></BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
              <SearchIcon className="w-4 h-4" />
            </span>
            <input 
              type="text" 
              placeholder="Search" 
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-full text-sm w-64 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <button className="p-2 bg-white border border-slate-200 rounded-full text-slate-500 hover:bg-slate-50 relative">
            <BellIcon className="w-5 h-5" />
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-emerald-500 border-2 border-white rounded-full"></span>
          </button>
        </div>
      </div>

      {/* 2. Page Title & Action */}
      <header className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Influencer Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Manage promo code, earning, and everything related from one place</p>
        </div>
        <Button 
          text="Create New Campaign" 
          variant="primary" 
          icon={<ChevronRightIcon className="w-4 h-4" />} 
          reverseIcon
        />
      </header>

      {/* 3. Metrics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-10">
        {/* Earning Card */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
           <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-slate-700">Earning</span>
              <select className="text-xs border border-slate-200 rounded-md px-2 py-1 outline-none">
                <option>This Month</option>
              </select>
           </div>
           <div className="flex items-baseline gap-3 mb-2">
              <span className="text-3xl font-bold text-slate-900">₹ 2,000</span>
              <span className="text-xs text-emerald-600 font-medium flex items-center">↑ 100 <span className="ml-1 text-slate-400">vs last month</span></span>
           </div>
           <div className="h-16 w-full bg-slate-50 rounded-lg mt-4 flex items-end overflow-hidden">
              {/* Mini Green Graph Placeholder */}
              <div className="w-full h-1/2 bg-emerald-50 border-t-2 border-emerald-400 opacity-50" style={{clipPath: 'polygon(0 100%, 0 40%, 20% 60%, 40% 30%, 60% 70%, 80% 20%, 100% 50%, 100% 100%)'}}></div>
           </div>
        </div>

        {/* Payout Card */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
           <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-slate-700">Payout</span>
           </div>
           <div className="flex items-baseline gap-3 mb-2">
              <span className="text-3xl font-bold text-slate-900">₹ 12,000</span>
              <span className="text-xs text-emerald-600 font-medium flex items-center">↑ 100% <span className="ml-1 text-slate-400">vs last month</span></span>
           </div>
           <div className="h-16 w-full bg-slate-50 rounded-lg mt-4 flex items-end overflow-hidden">
              {/* Mini Green Graph Placeholder */}
              <div className="w-full h-1/2 bg-emerald-50 border-t-2 border-emerald-400 opacity-50" style={{clipPath: 'polygon(0 100%, 0 50%, 25% 70%, 50% 40%, 75% 60%, 100% 20%, 100% 100%)'}}></div>
           </div>
        </div>

        {/* Live Promo Code & Links Card */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Live Promo Code & Links</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 cursor-pointer transition-colors border border-slate-100">
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-slate-900">20</span>
                <span className="text-sm text-slate-500">Live Links</span>
              </div>
              <ChevronRightIcon className="w-4 h-4 text-slate-400" />
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 cursor-pointer transition-colors border border-slate-100">
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-slate-900">03</span>
                <span className="text-sm text-slate-500">Promo Code</span>
              </div>
              <ChevronRightIcon className="w-4 h-4 text-slate-400" />
            </div>
          </div>
        </div>
      </div>

      {/* 4. Sponsored Magazines Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-serif">Sponsored Magazines</h2>
            <p className="text-sm text-slate-500">List of all the magazines you been looking for</p>
          </div>
          <div className="flex items-center bg-slate-100 p-1 rounded-lg">
            <button className="p-1.5 bg-white shadow-sm rounded-md"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M3 4h18v2H3V4zm0 7h18v2H3v-2zm0 7h18v2H3v-2z"/></svg></button>
            <button className="p-1.5 text-slate-400"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z"/></svg></button>
          </div>
        </div>

        <div className="space-y-4">
          {sponsoredMagazines.map((mag, idx) => (
            <div key={mag.id} className="flex flex-col md:flex-row items-center justify-between p-5 bg-white rounded-2xl border border-slate-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-5 w-full md:w-auto">
                <div className="w-40 h-24 bg-slate-200 rounded-xl shrink-0" /> {/* Image Placeholder */}
                <div>
                  <h4 className="text-lg font-bold text-slate-900">{mag.name}</h4>
                  <p className="text-xs text-slate-400 max-w-xs">{mag.desc}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-8 mt-4 md:mt-0">
                <button className="text-sm font-medium text-slate-600 hover:text-slate-900">Share Magazine</button>
                <Button 
                  text={idx === 0 ? "Campaign Overview" : "View Details"} 
                  variant={idx === 0 ? "primary" : "secondary"} 
                  className="px-6"
                  icon={<ChevronRightIcon className="w-4 h-4" />}
                  reverseIcon
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}