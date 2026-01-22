import { IconPointer } from "@tabler/icons-react";

export function TrackballPage() {
  return (
    <div className="p-6 h-full overflow-auto">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 rounded-lg bg-cyber/10 border border-cyber/20">
            <IconPointer size={24} className="text-cyber" />
          </div>
          <div>
            <h1 className="text-xl font-medium text-white">
              Trackball Settings
            </h1>
            <p className="text-sm text-white/50">
              Adjust sensitivity and behavior
            </p>
          </div>
        </div>

        {/* Settings */}
        <div className="space-y-6">
          {/* CPI Setting */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-medium text-white">
                  CPI (Counts Per Inch)
                </h3>
                <p className="text-xs text-white/40">
                  Higher values = faster cursor movement
                </p>
              </div>
              <span className="text-lg font-mono text-electric">800</span>
            </div>
            <div className="relative">
              <div className="h-2 bg-surface rounded-full overflow-hidden">
                <div className="h-full w-1/4 bg-gradient-to-r from-electric/50 to-electric rounded-full" />
              </div>
              <div className="flex justify-between mt-2 text-xs text-white/30">
                <span>100</span>
                <span>3200</span>
              </div>
            </div>
          </div>

          {/* Scroll Speed */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-medium text-white">Scroll Speed</h3>
                <p className="text-xs text-white/40">
                  Scroll layer sensitivity multiplier
                </p>
              </div>
              <span className="text-lg font-mono text-electric">1.0x</span>
            </div>
            <div className="relative">
              <div className="h-2 bg-surface rounded-full overflow-hidden">
                <div className="h-full w-1/2 bg-gradient-to-r from-electric/50 to-electric rounded-full" />
              </div>
              <div className="flex justify-between mt-2 text-xs text-white/30">
                <span>0.1x</span>
                <span>3.0x</span>
              </div>
            </div>
          </div>

          {/* Invert Axes */}
          <div className="glass-card p-6">
            <h3 className="text-sm font-medium text-white mb-4">
              Axis Inversion
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="w-10 h-6 rounded-full bg-surface border border-white/10 relative">
                  <div className="absolute left-1 top-1 w-4 h-4 rounded-full bg-white/30" />
                </div>
                <span className="text-sm text-white/70">Invert X Axis</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="w-10 h-6 rounded-full bg-surface border border-white/10 relative">
                  <div className="absolute left-1 top-1 w-4 h-4 rounded-full bg-white/30" />
                </div>
                <span className="text-sm text-white/70">Invert Y Axis</span>
              </label>
            </div>
          </div>

          {/* Angle Snap */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-white">Angle Snap</h3>
                <p className="text-xs text-white/40">
                  Snap cursor to horizontal/vertical when close
                </p>
              </div>
              <div className="w-10 h-6 rounded-full bg-surface border border-white/10 relative cursor-pointer">
                <div className="absolute left-1 top-1 w-4 h-4 rounded-full bg-white/30" />
              </div>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="mt-8 p-4 rounded-lg bg-white/5 border border-white/10">
          <p className="text-xs text-white/40">
            Connect your keyboard to adjust trackball settings. Changes are
            saved to the device immediately.
          </p>
        </div>
      </div>
    </div>
  );
}
