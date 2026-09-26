import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';
import { ThemeProvider } from '../providers/ThemeProvider';
import { WebSocketProvider } from '../providers/WebSocketProvider';
import { QueryProvider } from '../providers/QueryProvider';
import { EmergencyBanner } from '../components/emergency/EmergencyBanner';
import { SOSButton } from '../components/emergency/SOSButton';
import {
  ShieldAlert,
  Bot,
  Compass,
  BarChart3,
  Flame,
  Radio,
  Navigation,
  Cpu,
  Layers,
  Sparkles,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Autonomous Disaster Command & AI Telemetry Platform',
  description:
    'Next-Generation Autonomous, Decentralized & Predictive Disaster Management Platform for North East India (NER) and Extreme Disaster Theaters.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: Layers },
    { label: 'AI Copilot', href: '/ai/copilot', icon: Bot },
    { label: 'Intelligence', href: '/intelligence', icon: Compass },
    { label: 'Analytics', href: '/analytics', icon: BarChart3 },
    { label: 'Response', href: '/response', icon: ShieldAlert },
    { label: 'Sensors', href: '/sensors', icon: Cpu },
    { label: 'Drone Swarm', href: '/drone', icon: Radio },
    { label: 'Simulation', href: '/simulation', icon: Flame },
    { label: 'Innovation', href: '/innovation', icon: Sparkles },
  ];

  return (
    <html lang="en" className="dark">
      <body className="bg-[#080c16] text-slate-100 min-h-screen flex flex-col font-sans antialiased selection:bg-sky-500 selection:text-white">
        <QueryProvider>
          <ThemeProvider>
            <WebSocketProvider>
              {/* Emergency Broadcast Marquee Banner */}
              <EmergencyBanner />

              {/* Main Command Header */}
              <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/90 shadow-xl">
                <div className="max-w-[1700px] mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
                  {/* Brand & Region Indicator */}
                  <div className="flex items-center space-x-4">
                    <Link href="/" className="flex items-center space-x-2.5 group">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-400 p-0.5 shadow-glow group-hover:scale-105 transition-transform">
                        <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-sky-400">
                          <ShieldAlert className="w-5 h-5" />
                        </div>
                      </div>
                      <div>
                        <div className="font-mono font-black text-sm tracking-wider text-slate-100 group-hover:text-sky-400 transition-colors">
                          DISASTER<span className="text-sky-400">OPS</span>
                        </div>
                        <div className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">
                          NER-INDIA COMMAND • v5.0
                        </div>
                      </div>
                    </Link>
                  </div>

                  {/* Navigation Links */}
                  <nav className="hidden lg:flex items-center space-x-1 font-mono text-xs">
                    {navItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/70 transition-colors"
                        >
                          <Icon className="w-3.5 h-3.5 text-sky-400" />
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </nav>

                  {/* Emergency Trigger & Action Center */}
                  <div className="flex items-center space-x-3">
                    <SOSButton />
                  </div>
                </div>

                {/* Mobile / Horizontal Scrollable Sub-Nav */}
                <div className="lg:hidden flex items-center space-x-2 px-4 py-2 overflow-x-auto border-t border-slate-800/60 font-mono text-xs">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="flex-shrink-0 flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-900 text-slate-300 border border-slate-800"
                      >
                        <Icon className="w-3 h-3 text-sky-400" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </header>

              {/* Main Viewport Container */}
              <main className="flex-1 max-w-[1700px] w-full mx-auto p-4 sm:p-6">
                {children}
              </main>

              {/* Global Disaster Telemetry Status Footer */}
              <footer className="bg-slate-950 border-t border-slate-900 py-3 px-4 text-center text-xs font-mono text-slate-500">
                <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
                  <span>DISASTER OPS HUD • Autonomous Decentralized P2P Mesh Core</span>
                  <span className="text-emerald-400">LoRa Mesh Status: ONLINE (138 Nodes)</span>
                </div>
              </footer>
            </WebSocketProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
