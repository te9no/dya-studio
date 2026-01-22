import { IconKeyboard } from "@tabler/icons-react";

export function KeymapPage() {
  return (
    <div className="p-6 h-full overflow-auto">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-electric/10 border border-electric/20">
              <IconKeyboard size={24} className="text-electric" />
            </div>
            <div>
              <h1 className="text-xl font-medium text-white">Keymap</h1>
              <p className="text-sm text-white/50">
                Configure key bindings and layers
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn-ghost text-sm">Import</button>
            <button className="btn-ghost text-sm">Export</button>
          </div>
        </div>

        {/* Layer Tabs Placeholder */}
        <div className="flex gap-2 mb-6">
          {["Base", "Lower", "Raise", "Adjust"].map((layer, index) => (
            <button
              key={layer}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                index === 0
                  ? "bg-electric/20 text-electric border border-electric/30"
                  : "text-white/50 hover:text-white/70 hover:bg-white/5"
              }`}
            >
              {layer}
            </button>
          ))}
        </div>

        {/* Keyboard Layout Placeholder */}
        <div className="glass-card p-8">
          <div className="flex gap-8 justify-center">
            {/* Left Half */}
            <div className="flex flex-col gap-2">
              {[0, 1, 2, 3].map((row) => (
                <div key={row} className="flex gap-1.5">
                  {[0, 1, 2, 3, 4, 5].map((col) => (
                    <div
                      key={col}
                      className="w-12 h-12 rounded-lg bg-surface border border-white/10 flex items-center justify-center text-xs text-white/30 hover:border-electric/50 hover:bg-electric/5 cursor-pointer transition-colors"
                    >
                      {row === 0 && ["Esc", "1", "2", "3", "4", "5"][col]}
                      {row === 1 && ["Tab", "Q", "W", "E", "R", "T"][col]}
                      {row === 2 && ["Ctrl", "A", "S", "D", "F", "G"][col]}
                      {row === 3 && ["Shift", "Z", "X", "C", "V", "B"][col]}
                    </div>
                  ))}
                </div>
              ))}
              {/* Thumb Cluster */}
              <div className="flex gap-1.5 justify-end mt-2">
                {["Alt", "Cmd", "Space"].map((key) => (
                  <div
                    key={key}
                    className="w-14 h-10 rounded-lg bg-surface border border-white/10 flex items-center justify-center text-xs text-white/30 hover:border-electric/50 hover:bg-electric/5 cursor-pointer transition-colors"
                  >
                    {key}
                  </div>
                ))}
              </div>
            </div>

            {/* Right Half */}
            <div className="flex flex-col gap-2">
              {[0, 1, 2, 3].map((row) => (
                <div key={row} className="flex gap-1.5">
                  {[0, 1, 2, 3, 4, 5].map((col) => (
                    <div
                      key={col}
                      className="w-12 h-12 rounded-lg bg-surface border border-white/10 flex items-center justify-center text-xs text-white/30 hover:border-electric/50 hover:bg-electric/5 cursor-pointer transition-colors"
                    >
                      {row === 0 && ["6", "7", "8", "9", "0", "Del"][col]}
                      {row === 1 && ["Y", "U", "I", "O", "P", "\\"][col]}
                      {row === 2 && ["H", "J", "K", "L", ";", "'"][col]}
                      {row === 3 && ["N", "M", ",", ".", "/", "Shift"][col]}
                    </div>
                  ))}
                </div>
              ))}
              {/* Thumb Cluster */}
              <div className="flex gap-1.5 mt-2">
                {["Enter", "Bksp", "Layer"].map((key) => (
                  <div
                    key={key}
                    className="w-14 h-10 rounded-lg bg-surface border border-white/10 flex items-center justify-center text-xs text-white/30 hover:border-electric/50 hover:bg-electric/5 cursor-pointer transition-colors"
                  >
                    {key}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="mt-8 p-4 rounded-lg bg-white/5 border border-white/10">
          <p className="text-xs text-white/40">
            Connect your keyboard to edit keymaps. Click on a key to modify its
            binding.
          </p>
        </div>
      </div>
    </div>
  );
}
