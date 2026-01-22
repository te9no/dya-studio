import type { ReactNode } from "react";
import DyaLogo from "../assets/dya.svg?react";

interface AppLayoutProps {
  children: ReactNode;
  isConnected: boolean;
  deviceName?: string;
  onConnect: () => void;
  onDisconnect: () => void;
  isConnecting?: boolean;
}

export function AppLayout({
  children,
  isConnected,
  deviceName,
  onConnect,
  onDisconnect,
  isConnecting,
}: AppLayoutProps) {
  return (
    <div className="flex flex-col h-screen bg-gradient-dark">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-surface/80 backdrop-blur-sm">
        {/* Logo & Brand */}
        <div className="flex items-center gap-4">
          <DyaLogo className="w-8 h-8 [&_polygon]:fill-white" />
          <div className="flex items-center gap-2">
            <span className="text-lg font-light tracking-widest text-white">
              DYA
            </span>
            <span className="text-xs font-light tracking-wider text-white/40 uppercase">
              Studio
            </span>
          </div>
        </div>

        {/* Connection Status */}
        <div className="flex items-center gap-4">
          {isConnected ? (
            <>
              <div className="flex items-center gap-3">
                <div className="status-indicator connected" />
                <span className="text-sm text-white/70">
                  {deviceName || "Connected"}
                </span>
              </div>
              <button
                onClick={onDisconnect}
                className="btn-ghost text-sm text-white/50 hover:text-white"
              >
                Disconnect
              </button>
            </>
          ) : (
            <button
              onClick={onConnect}
              disabled={isConnecting}
              className="btn-electric text-sm"
            >
              {isConnecting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Connecting...
                </span>
              ) : (
                "Connect Keyboard"
              )}
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
