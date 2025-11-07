'use client';

import { ChevronRight, Globe, Download, Info, User as UserIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { LangSwitch } from '@/components/lang-switch';

export default function ProfilePage() {
  return (
    <main className="max-w-md mx-auto min-h-screen bg-gray-50">
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3">
        <h1 className="text-xl font-semibold">Profile</h1>
      </header>

      <div className="p-4 space-y-6">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarFallback className="bg-emerald-500 text-white text-xl">
                <UserIcon className="w-8 h-8" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold text-lg">Demo User</h2>
              <p className="text-sm text-gray-500">Food Enthusiast</p>
            </div>
          </div>
        </Card>

        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-500 px-2">SETTINGS</h3>

          <Card>
            <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-gray-400" />
                <span className="text-sm font-medium">Language</span>
              </div>
              <div className="flex items-center gap-2">
                <LangSwitch />
              </div>
            </button>
          </Card>

          <Card>
            <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <Download className="w-5 h-5 text-gray-400" />
                <span className="text-sm font-medium">Export Data</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </Card>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-500 px-2">ABOUT</h3>

          <Card>
            <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <Info className="w-5 h-5 text-gray-400" />
                <span className="text-sm font-medium">About Conbini Rater</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </Card>
        </div>

        <Card className="p-4 text-center text-xs text-gray-500">
          <p>Version 1.0.0</p>
          <p className="mt-1">© 2025 Conbini Rater. All rights reserved.</p>
        </Card>
      </div>
    </main>
  );
}
