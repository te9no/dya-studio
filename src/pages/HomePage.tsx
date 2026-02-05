import {
  IconHome,
  IconBrandGithub,
  IconShoppingCart,
  IconKeyboard,
  IconExternalLink,
  IconSparkles,
} from "@tabler/icons-react";

export function HomePage() {
  return (
    <div className="p-6 h-full overflow-auto">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 rounded-lg bg-[var(--color-electric)]/10 border border-[var(--color-electric)]/20">
            <IconHome size={24} className="text-[var(--color-electric)]" />
          </div>
          <div>
            <h1 className="text-xl font-medium text-[var(--color-text)]">
              Welcome to DYA Studio
            </h1>
            <p className="text-sm text-[var(--color-text-muted)]">
              Your hub for DYA keyboard configuration
            </p>
          </div>
        </div>

        {/* Getting Started Guide */}
        <div className="glass-card p-6 mb-6">
          <h2 className="text-sm font-medium text-[var(--color-text-secondary)] mb-4">
            Getting Started
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[var(--color-electric)]/10 border border-[var(--color-electric)]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-medium text-[var(--color-electric)]">
                  1
                </span>
              </div>
              <div>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  <strong>Connect Your Keyboard</strong>
                </p>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">
                  Connect your DYA keyboard via USB. DYA Studio will
                  automatically detect it and establish a connection.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[var(--color-electric)]/10 border border-[var(--color-electric)]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-medium text-[var(--color-electric)]">
                  2
                </span>
              </div>
              <div>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  <strong>Explore the Tabs</strong>
                </p>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">
                  Use the tabs above to access different features: monitor
                  battery levels, manage Bluetooth connections, check hardware
                  health, customize your keymap, adjust trackball settings, and
                  configure device settings.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[var(--color-electric)]/10 border border-[var(--color-electric)]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-medium text-[var(--color-electric)]">
                  3
                </span>
              </div>
              <div>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  <strong>Customize & Save</strong>
                </p>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">
                  Make changes to your keyboard configuration. Changes are
                  automatically saved to your keyboard.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* DYA Keyboards Section */}
        <div className="glass-card p-6 mb-6">
          <h2 className="text-sm font-medium text-[var(--color-text-secondary)] mb-4">
            DYA Keyboards
          </h2>
          <div className="space-y-3">
            {/* DYA Dash */}
            <a
              href="https://github.com/cormoran/dya-dash-keyboard"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-electric)] transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[var(--color-electric)]/10 flex items-center justify-center">
                  <IconKeyboard
                    size={20}
                    className="text-[var(--color-electric)]"
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-secondary)]">
                    DYA Dash Keyboard
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    Split keyboard with integrated trackball
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <IconBrandGithub
                  size={16}
                  className="text-[var(--color-text-muted)]"
                />
                <IconExternalLink
                  size={16}
                  className="text-[var(--color-text-muted)] group-hover:text-[var(--color-electric)] transition-colors"
                />
              </div>
            </a>

            {/* DY2 Coming Soon */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] opacity-60">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[var(--color-cyber)]/10 flex items-center justify-center">
                  <IconSparkles
                    size={20}
                    className="text-[var(--color-cyber)]"
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-secondary)]">
                    DY2
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    Next generation DYA keyboard
                  </p>
                </div>
              </div>
              <span className="text-xs font-medium uppercase text-[var(--color-cyber)]">
                Coming Soon
              </span>
            </div>
          </div>
        </div>

        {/* Shop Link */}
        <div className="glass-card p-6">
          <h2 className="text-sm font-medium text-[var(--color-text-secondary)] mb-4">
            Get Your DYA Keyboard
          </h2>
          <a
            href="https://cormoran707.booth.pm/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-[var(--color-electric)]/10 to-[var(--color-neon)]/10 border border-[var(--color-electric)]/20 hover:border-[var(--color-electric)] transition-colors group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[var(--color-neon)]/10 flex items-center justify-center">
                <IconShoppingCart
                  size={20}
                  className="text-[var(--color-neon)]"
                />
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--color-text-secondary)]">
                  Visit DYA Shop
                </p>
                <p className="text-xs text-[var(--color-text-muted)]">
                  Purchase DYA keyboards and accessories
                </p>
              </div>
            </div>
            <IconExternalLink
              size={16}
              className="text-[var(--color-text-muted)] group-hover:text-[var(--color-neon)] transition-colors"
            />
          </a>
        </div>

        {/* Info Box */}
        <div className="mt-8 p-4 rounded-lg bg-[var(--color-border)] border border-[var(--color-border-hover)]">
          <p className="text-xs text-[var(--color-text-muted)]">
            DYA Studio is a web-based configuration tool for DYA keyboards
            running ZMK firmware. All configuration changes are applied directly
            to your keyboard via USB connection.
          </p>
        </div>
      </div>
    </div>
  );
}
