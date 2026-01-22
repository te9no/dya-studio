import { IconPointer } from "@tabler/icons-react";

export function TrackballPage() {
  return (
    <div className="p-6 h-full overflow-auto">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 rounded-lg bg-[var(--color-cyber)]/10 border border-[var(--color-cyber)]/20">
            <IconPointer size={24} className="text-[var(--color-cyber)]" />
          </div>
          <div>
            <h1 className="text-xl font-medium text-[var(--color-text)]">
              Trackball Settings
            </h1>
            <p className="text-sm text-[var(--color-text-muted)]">
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
                <h3 className="text-sm font-medium text-[var(--color-text)]">
                  CPI (Counts Per Inch)
                </h3>
                <p className="text-xs text-[var(--color-text-muted)]">
                  Higher values = faster cursor movement
                </p>
              </div>
              <span className="text-lg font-mono text-[var(--color-electric)]">
                800
              </span>
            </div>
            <div className="relative">
              <div className="h-2 bg-[var(--color-surface)] rounded-full overflow-hidden">
                <div className="h-full w-1/4 bg-gradient-to-r from-[var(--color-electric)]/50 to-[var(--color-electric)] rounded-full" />
              </div>
              <div className="flex justify-between mt-2 text-xs text-[var(--color-text-muted)]">
                <span>100</span>
                <span>3200</span>
              </div>
            </div>
          </div>

          {/* Scroll Speed */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-medium text-[var(--color-text)]">
                  Scroll Speed
                </h3>
                <p className="text-xs text-[var(--color-text-muted)]">
                  Scroll layer sensitivity multiplier
                </p>
              </div>
              <span className="text-lg font-mono text-[var(--color-electric)]">
                1.0x
              </span>
            </div>
            <div className="relative">
              <div className="h-2 bg-[var(--color-surface)] rounded-full overflow-hidden">
                <div className="h-full w-1/2 bg-gradient-to-r from-[var(--color-electric)]/50 to-[var(--color-electric)] rounded-full" />
              </div>
              <div className="flex justify-between mt-2 text-xs text-[var(--color-text-muted)]">
                <span>0.1x</span>
                <span>3.0x</span>
              </div>
            </div>
          </div>

          {/* Invert Axes */}
          <div className="glass-card p-6">
            <h3 className="text-sm font-medium text-[var(--color-text)] mb-4">
              Axis Inversion
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="w-10 h-6 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] relative">
                  <div className="absolute left-1 top-1 w-4 h-4 rounded-full bg-[var(--color-text-muted)]" />
                </div>
                <span className="text-sm text-[var(--color-text-secondary)]">
                  Invert X Axis
                </span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="w-10 h-6 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] relative">
                  <div className="absolute left-1 top-1 w-4 h-4 rounded-full bg-[var(--color-text-muted)]" />
                </div>
                <span className="text-sm text-[var(--color-text-secondary)]">
                  Invert Y Axis
                </span>
              </label>
            </div>
          </div>

          {/* Angle Snap */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-[var(--color-text)]">
                  Angle Snap
                </h3>
                <p className="text-xs text-[var(--color-text-muted)]">
                  Snap cursor to horizontal/vertical when close
                </p>
              </div>
              <div className="w-10 h-6 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] relative cursor-pointer">
                <div className="absolute left-1 top-1 w-4 h-4 rounded-full bg-[var(--color-text-muted)]" />
              </div>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="mt-8 p-4 rounded-lg bg-[var(--color-border)] border border-[var(--color-border-hover)]">
          <p className="text-xs text-[var(--color-text-muted)]">
            Connect your keyboard to adjust trackball settings. Changes are
            saved to the device immediately.
          </p>
        </div>
      </div>
    </div>
  );
}
