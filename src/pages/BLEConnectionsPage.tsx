import { IconBluetooth, IconLink, IconLinkOff } from "@tabler/icons-react";

export function BLEConnectionsPage() {
  return (
    <div className="p-6 h-full overflow-auto">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 rounded-lg bg-[var(--color-cyber)]/10 border border-[var(--color-cyber)]/20">
            <IconBluetooth size={24} className="text-[var(--color-cyber)]" />
          </div>
          <div>
            <h1 className="text-xl font-medium text-[var(--color-text)]">
              BLE Connections
            </h1>
            <p className="text-sm text-[var(--color-text-muted)]">
              Manage Bluetooth upstream connections
            </p>
          </div>
        </div>

        {/* Connection Slots */}
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((slot) => (
            <div
              key={slot}
              className="glass-card p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[var(--color-border)] border border-[var(--color-border-hover)] flex items-center justify-center">
                  <span className="text-sm font-mono text-[var(--color-text-muted)]">
                    {slot}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-secondary)]">
                    Profile {slot}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    Not connected
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="btn-ghost text-sm flex items-center gap-1.5">
                  <IconLink size={16} />
                  <span className="hidden tablet:inline">Connect</span>
                </button>
                <button className="btn-ghost text-sm flex items-center gap-1.5 opacity-50">
                  <IconLinkOff size={16} />
                  <span className="hidden tablet:inline">Unpair</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Info */}
        <div className="mt-8 p-4 rounded-lg bg-white/5 border border-white/10">
          <p className="text-xs text-white/40">
            Connect your keyboard to manage BLE profiles. Each profile can be
            paired to a different host device.
          </p>
        </div>
      </div>
    </div>
  );
}
