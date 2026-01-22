import { IconSettings } from "@tabler/icons-react";

export function SettingsPage() {
  return (
    <div className="p-6 h-full overflow-auto">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 rounded-lg bg-[var(--color-border)] border border-[var(--color-border-hover)]">
            <IconSettings
              size={24}
              className="text-[var(--color-text-secondary)]"
            />
          </div>
          <div>
            <h1 className="text-xl font-medium text-[var(--color-text)]">
              Settings
            </h1>
            <p className="text-sm text-[var(--color-text-muted)]">
              Device configuration and parameters
            </p>
          </div>
        </div>

        {/* Settings Groups */}
        <div className="space-y-6">
          {/* Power Management */}
          <div className="glass-card p-6">
            <h3 className="text-sm font-medium text-[var(--color-text)] mb-4">
              Power Management
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    Sleep Timeout
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    Time before keyboard enters sleep mode
                  </p>
                </div>
                <select className="input-field w-32 text-sm">
                  <option>30 sec</option>
                  <option>1 min</option>
                  <option>5 min</option>
                  <option>10 min</option>
                  <option>Never</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    Deep Sleep Timeout
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    Time before entering deep sleep
                  </p>
                </div>
                <select className="input-field w-32 text-sm">
                  <option>30 min</option>
                  <option>1 hour</option>
                  <option>4 hours</option>
                  <option>Never</option>
                </select>
              </div>
            </div>
          </div>

          {/* Display */}
          <div className="glass-card p-6">
            <h3 className="text-sm font-medium text-[var(--color-text)] mb-4">
              Display
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    Screen Brightness
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    OLED display brightness level
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-[var(--color-surface)] rounded-full overflow-hidden">
                    <div className="h-full w-3/4 bg-[var(--color-text-muted)] rounded-full" />
                  </div>
                  <span className="text-sm font-mono text-[var(--color-text-muted)] w-10">
                    75%
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    Screen Timeout
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    Turn off display after inactivity
                  </p>
                </div>
                <select className="input-field w-32 text-sm">
                  <option>10 sec</option>
                  <option>30 sec</option>
                  <option>1 min</option>
                  <option>Never</option>
                </select>
              </div>
            </div>
          </div>

          {/* Keyboard */}
          <div className="glass-card p-6">
            <h3 className="text-sm font-medium text-[var(--color-text)] mb-4">
              Keyboard
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    Tapping Term
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    Duration to distinguish tap from hold
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    className="input-field w-20 text-sm text-center"
                    value="200"
                    readOnly
                  />
                  <span className="text-xs text-[var(--color-text-muted)]">
                    ms
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    Quick Tap Term
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    Window for quick tap-tap sequences
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    className="input-field w-20 text-sm text-center"
                    value="150"
                    readOnly
                  />
                  <span className="text-xs text-[var(--color-text-muted)]">
                    ms
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="glass-card p-6 border-red-500/20">
            <h3 className="text-sm font-medium text-red-400 mb-4">
              Danger Zone
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    Reset to Defaults
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    Restore all settings to factory defaults
                  </p>
                </div>
                <button className="px-4 py-2 rounded-lg text-sm font-medium text-red-400 border border-red-500/30 hover:bg-red-500/10 transition-colors">
                  Reset
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    Enter Bootloader
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    Restart keyboard in firmware update mode
                  </p>
                </div>
                <button className="px-4 py-2 rounded-lg text-sm font-medium text-red-400 border border-red-500/30 hover:bg-red-500/10 transition-colors">
                  Reboot
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="mt-8 p-4 rounded-lg bg-[var(--color-border)] border border-[var(--color-border-hover)]">
          <p className="text-xs text-[var(--color-text-muted)]">
            Connect your keyboard to modify settings. Changes are saved to the
            device immediately.
          </p>
        </div>
      </div>
    </div>
  );
}
