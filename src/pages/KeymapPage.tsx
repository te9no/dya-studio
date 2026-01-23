import { useState, useContext, useCallback, useMemo } from "react";
import {
  IconKeyboard,
  IconDeviceFloppy,
  IconRefresh,
  IconChevronUp,
  IconChevronDown,
  IconAlertCircle,
  IconLoader2,
} from "@tabler/icons-react";
import { ConnectionContext } from "../components/DeviceConnection";
import { KeyboardLayout } from "../components/KeyboardLayout";
import { KeycodeSelector } from "../components/KeycodeSelector";
import { UnlockPrompt } from "../components/UnlockPrompt";
import { useKeymap } from "../hooks/useKeymap";
import type { BehaviorBinding } from "../hooks/useKeymap";

export function KeymapPage() {
  const connection = useContext(ConnectionContext);
  const keymap = useKeymap();

  // Local UI state
  const [selectedLayerIndex, setSelectedLayerIndex] = useState(0);
  const [selectedKeyPosition, setSelectedKeyPosition] = useState<number | null>(
    null
  );
  const [showKeycodeSelector, setShowKeycodeSelector] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDiscarding, setIsDiscarding] = useState(false);

  // Get current layer
  const currentLayer = useMemo(() => {
    if (!keymap.keymap?.layers) return null;
    return keymap.keymap.layers[selectedLayerIndex] ?? null;
  }, [keymap.keymap?.layers, selectedLayerIndex]);

  // Get current physical layout
  const currentLayout = useMemo(() => {
    if (!keymap.physicalLayouts?.layouts) return null;
    const index = keymap.physicalLayouts.activeLayoutIndex;
    return keymap.physicalLayouts.layouts[index] ?? null;
  }, [keymap.physicalLayouts]);

  // Layers for the selector
  const layersForSelector = useMemo(() => {
    if (!keymap.keymap?.layers) return [];
    return keymap.keymap.layers.map((l) => ({ id: l.id, name: l.name }));
  }, [keymap.keymap?.layers]);

  // Handle key click
  const handleKeyClick = useCallback((keyPosition: number) => {
    setSelectedKeyPosition(keyPosition);
    setShowKeycodeSelector(true);
  }, []);

  // Handle key reset
  const handleKeyReset = useCallback(
    async (keyPosition: number) => {
      if (!currentLayer) return;
      await keymap.resetBinding(currentLayer.id, keyPosition);
    },
    [currentLayer, keymap]
  );

  // Handle binding selection
  const handleBindingSelect = useCallback(
    async (binding: BehaviorBinding) => {
      if (!currentLayer || selectedKeyPosition === null) return;
      await keymap.setBinding(currentLayer.id, selectedKeyPosition, binding);
      setShowKeycodeSelector(false);
      setSelectedKeyPosition(null);
    },
    [currentLayer, selectedKeyPosition, keymap]
  );

  // Handle save
  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      await keymap.saveChanges();
    } finally {
      setIsSaving(false);
    }
  }, [keymap]);

  // Handle discard
  const handleDiscard = useCallback(async () => {
    if (!confirm("Are you sure you want to discard all changes?")) return;
    setIsDiscarding(true);
    try {
      await keymap.discardChanges();
    } finally {
      setIsDiscarding(false);
    }
  }, [keymap]);

  // Handle layer move up
  const handleMoveLayerUp = useCallback(async () => {
    if (selectedLayerIndex <= 0) return;
    const success = await keymap.moveLayer(
      selectedLayerIndex,
      selectedLayerIndex - 1
    );
    if (success) {
      setSelectedLayerIndex(selectedLayerIndex - 1);
    }
  }, [selectedLayerIndex, keymap]);

  // Handle layer move down
  const handleMoveLayerDown = useCallback(async () => {
    if (!keymap.keymap?.layers) return;
    if (selectedLayerIndex >= keymap.keymap.layers.length - 1) return;
    const success = await keymap.moveLayer(
      selectedLayerIndex,
      selectedLayerIndex + 1
    );
    if (success) {
      setSelectedLayerIndex(selectedLayerIndex + 1);
    }
  }, [selectedLayerIndex, keymap]);

  // Handle unlock retry
  const handleUnlockRetry = useCallback(() => {
    keymap.clearUnlockRequired();
    keymap.loadKeymapData();
  }, [keymap]);

  return (
    <div className="p-6 h-full overflow-auto">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[var(--color-electric)]/10 border border-[var(--color-electric)]/20">
              <IconKeyboard
                size={24}
                className="text-[var(--color-electric)]"
              />
            </div>
            <div>
              <h1 className="text-xl font-medium text-[var(--color-text)]">
                Keymap
              </h1>
              <p className="text-sm text-[var(--color-text-muted)]">
                Configure key bindings and layers
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          {connection.isConnected && keymap.keymap && (
            <div className="flex items-center gap-2">
              {keymap.hasUnsavedChanges && (
                <span className="text-xs text-[var(--color-neon)] mr-2">
                  ● Unsaved changes
                </span>
              )}
              <button
                className="btn-ghost text-sm flex items-center gap-1.5"
                onClick={handleDiscard}
                disabled={
                  isDiscarding || !keymap.hasUnsavedChanges || keymap.isLoading
                }
              >
                {isDiscarding ? (
                  <IconLoader2 size={16} className="animate-spin" />
                ) : (
                  <IconRefresh size={16} />
                )}
                Reset All
              </button>
              <button
                className="btn-electric text-sm flex items-center gap-1.5"
                onClick={handleSave}
                disabled={
                  isSaving || !keymap.hasUnsavedChanges || keymap.isLoading
                }
              >
                {isSaving ? (
                  <IconLoader2 size={16} className="animate-spin" />
                ) : (
                  <IconDeviceFloppy size={16} />
                )}
                Save
              </button>
            </div>
          )}
        </div>

        {/* Not Connected State */}
        {!connection.isConnected && (
          <div className="glass-card p-6 text-center">
            <p className="text-sm text-[var(--color-text-muted)]">
              Connect your keyboard to edit keymaps
            </p>
          </div>
        )}

        {/* Error State */}
        {keymap.error && !keymap.unlockRequired && (
          <div className="glass-card p-4 mb-4 border-red-500/20 bg-red-500/10 flex items-center gap-3">
            <IconAlertCircle size={20} className="text-red-400" />
            <p className="text-sm text-red-400">{keymap.error}</p>
          </div>
        )}

        {/* Loading State */}
        {connection.isConnected && keymap.isLoading && !keymap.keymap && (
          <div className="glass-card p-6 text-center">
            <IconLoader2
              size={24}
              className="animate-spin mx-auto mb-2 text-[var(--color-electric)]"
            />
            <p className="text-sm text-[var(--color-text-muted)]">
              Loading keymap data...
            </p>
          </div>
        )}

        {/* Main Content */}
        {connection.isConnected && keymap.keymap && currentLayout && (
          <>
            {/* Layer Tabs */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex gap-2 flex-1 overflow-x-auto pb-2">
                {keymap.keymap.layers.map((layer, index) => (
                  <button
                    key={layer.id}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                      index === selectedLayerIndex
                        ? "bg-[var(--color-electric)]/20 text-[var(--color-electric)] border border-[var(--color-electric)]/30"
                        : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-border)]"
                    }`}
                    onClick={() => setSelectedLayerIndex(index)}
                  >
                    {layer.name || `Layer ${index}`}
                  </button>
                ))}
              </div>

              {/* Layer Reorder Buttons */}
              <div className="flex gap-1 border-l border-[var(--color-border)] pl-2">
                <button
                  className="p-2 rounded-lg hover:bg-[var(--color-border)] disabled:opacity-30"
                  onClick={handleMoveLayerUp}
                  disabled={selectedLayerIndex <= 0}
                  title="Move layer up"
                  aria-label="Move layer up"
                >
                  <IconChevronUp
                    size={16}
                    className="text-[var(--color-text-muted)]"
                  />
                </button>
                <button
                  className="p-2 rounded-lg hover:bg-[var(--color-border)] disabled:opacity-30"
                  onClick={handleMoveLayerDown}
                  disabled={
                    selectedLayerIndex >= keymap.keymap.layers.length - 1
                  }
                  title="Move layer down"
                  aria-label="Move layer down"
                >
                  <IconChevronDown
                    size={16}
                    className="text-[var(--color-text-muted)]"
                  />
                </button>
              </div>
            </div>

            {/* Physical Layout Selector (if multiple layouts) */}
            {keymap.physicalLayouts &&
              keymap.physicalLayouts.layouts.length > 1 && (
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs text-[var(--color-text-muted)]">
                    Layout:
                  </span>
                  <select
                    value={keymap.physicalLayouts.activeLayoutIndex}
                    onChange={(e) =>
                      keymap.setActiveLayout(Number(e.target.value))
                    }
                    className="px-2 py-1 rounded bg-[var(--color-surface)] border border-[var(--color-border)] text-sm text-[var(--color-text)]"
                  >
                    {keymap.physicalLayouts.layouts.map((layout, index) => (
                      <option key={index} value={index}>
                        {layout.name || `Layout ${index + 1}`}
                      </option>
                    ))}
                  </select>
                </div>
              )}

            {/* Keyboard Layout */}
            {currentLayer && (
              <div className="glass-card p-8">
                <KeyboardLayout
                  layout={currentLayout}
                  layer={currentLayer}
                  behaviors={keymap.behaviors}
                  selectedKey={selectedKeyPosition}
                  onKeyClick={handleKeyClick}
                  onKeyReset={handleKeyReset}
                  isBindingModified={keymap.isBindingModified}
                  getOriginalBinding={keymap.getOriginalBinding}
                />
              </div>
            )}
          </>
        )}

        {/* Info */}
        <div className="mt-8 p-4 rounded-lg bg-[var(--color-border)] border border-[var(--color-border-hover)]">
          <p className="text-xs text-[var(--color-text-muted)]">
            {connection.isConnected
              ? "Click on a key to modify its binding. Modified keys are highlighted in green and show the original binding on hover. Use the Reset All button to discard all changes."
              : "Connect your keyboard to edit keymaps. Click on a key to modify its binding."}
          </p>
        </div>
      </div>

      {/* Keycode Selector Dialog */}
      <KeycodeSelector
        open={showKeycodeSelector}
        onClose={() => {
          setShowKeycodeSelector(false);
          setSelectedKeyPosition(null);
        }}
        onSelect={handleBindingSelect}
        behaviors={keymap.behaviors}
        layers={layersForSelector}
      />

      {/* Unlock Prompt */}
      <UnlockPrompt
        open={keymap.unlockRequired}
        onClose={() => keymap.clearUnlockRequired()}
        onRetry={handleUnlockRetry}
      />
    </div>
  );
}
