import { IconBattery2 } from "@tabler/icons-react";

export function BatteryPage() {
  return (
    <div className="p-6 h-full overflow-auto">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 rounded-lg bg-electric/10 border border-electric/20">
            <IconBattery2 size={24} className="text-electric" />
          </div>
          <div>
            <h1 className="text-xl font-medium text-white">Battery Status</h1>
            <p className="text-sm text-white/50">
              Monitor battery levels and history
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 tablet:grid-cols-3 gap-4 mb-8">
          <div className="data-card">
            <span className="data-card-label">Left Half</span>
            <span className="data-card-value text-neon">---%</span>
          </div>
          <div className="data-card">
            <span className="data-card-label">Right Half</span>
            <span className="data-card-value text-neon">---%</span>
          </div>
          <div className="data-card">
            <span className="data-card-label">Last Updated</span>
            <span className="data-card-value text-lg">--:--</span>
          </div>
        </div>

        {/* History Chart Placeholder */}
        <div className="glass-card p-6">
          <h2 className="text-sm font-medium text-white/70 mb-4">
            Battery History
          </h2>
          <div className="h-64 flex items-center justify-center border border-dashed border-white/10 rounded-lg">
            <span className="text-white/30 text-sm">
              Connect keyboard to view battery history
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
