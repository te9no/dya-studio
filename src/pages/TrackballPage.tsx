import { IconPointer } from "@tabler/icons-react";
import { useRuntimeInputProcessor } from "../hooks/useRuntimeInputProcessor";
import { ButtonListSelector } from "../components/ButtonListSelector";

// Speed multiplier options for trackball scaling
const SPEED_OPTIONS = [
  { value: 50, label: "0.5x", shortLabel: "0.5x" },
  { value: 75, label: "0.75x", shortLabel: "0.75x" },
  { value: 100, label: "1.0x", shortLabel: "1.0x" },
  { value: 150, label: "1.5x", shortLabel: "1.5x" },
  { value: 200, label: "2.0x", shortLabel: "2.0x" },
  { value: 300, label: "3.0x", shortLabel: "3.0x" },
];

// Rotation angle options
const ROTATION_OPTIONS = [
  { value: 0, label: "0°", shortLabel: "0°" },
  { value: 90, label: "90°", shortLabel: "90°" },
  { value: 180, label: "180°", shortLabel: "180°" },
  { value: 270, label: "270°", shortLabel: "270°" },
];

export function TrackballPage() {
  const { processors, isLoading, error, setScaling, setRotation } = useRuntimeInputProcessor();

  // Get the first processor (typically "trackpad" or "trackball")
  const processor = processors.length > 0 ? processors[0] : null;

  // Calculate current speed as percentage (multiplier/divisor * 100)
  const currentSpeed = processor
    ? Math.round((processor.scaleMultiplier / processor.scaleDivisor) * 100)
    : 100;

  const handleSpeedChange = async (speedPercent: number) => {
    if (!processor) return;
    
    // Convert percentage to multiplier/divisor
    // For simplicity, we use divisor=100 and set multiplier to the percentage
    await setScaling(processor.name, speedPercent, 100);
  };

  const handleRotationChange = async (degrees: number) => {
    if (!processor) return;
    await setRotation(processor.name, degrees);
  };

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
              Adjust sensitivity and behavior via runtime input processor
            </p>
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Loading state */}
        {isLoading && !processor && (
          <div className="mb-6 p-4 rounded-lg bg-[var(--color-border)] border border-[var(--color-border-hover)]">
            <p className="text-sm text-[var(--color-text-muted)]">
              Loading trackball settings...
            </p>
          </div>
        )}

        {/* No processor found */}
        {!isLoading && !processor && !error && (
          <div className="mb-6 p-4 rounded-lg bg-[var(--color-border)] border border-[var(--color-border-hover)]">
            <p className="text-sm text-[var(--color-text-muted)]">
              No runtime input processor found. Make sure your firmware has the runtime input processor module enabled.
            </p>
          </div>
        )}

        {/* Settings */}
        {processor && (
          <div className="space-y-6">
            {/* Processor Info */}
            <div className="glass-card p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--color-text)]">
                  Active Processor
                </p>
                <p className="text-xs text-[var(--color-text-muted)]">
                  Detected from device
                </p>
              </div>
              <span className="text-sm font-mono text-[var(--color-neon)]">
                {processor.name}
              </span>
            </div>

            {/* Speed Setting */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-medium text-[var(--color-text)]">
                    Pointer Speed
                  </h3>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    Adjust sensitivity multiplier
                  </p>
                </div>
                <span className="text-lg font-mono text-[var(--color-electric)]">
                  {(currentSpeed / 100).toFixed(1)}x
                </span>
              </div>
              <ButtonListSelector
                options={SPEED_OPTIONS}
                value={currentSpeed}
                onChange={handleSpeedChange}
                columns={3}
              />
            </div>

            {/* Rotation Setting */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-medium text-[var(--color-text)]">
                    Sensor Rotation
                  </h3>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    Rotate input for different mounting angles
                  </p>
                </div>
                <span className="text-lg font-mono text-[var(--color-electric)]">
                  {processor.rotationDegrees}°
                </span>
              </div>
              <ButtonListSelector
                options={ROTATION_OPTIONS}
                value={processor.rotationDegrees}
                onChange={handleRotationChange}
                columns={4}
              />
            </div>

            {/* Current Settings Display */}
            <div className="glass-card p-6">
              <h3 className="text-sm font-medium text-[var(--color-text)] mb-4">
                Current Configuration
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="data-card">
                  <span className="data-card-label">Scale Multiplier</span>
                  <span className="data-card-value text-[var(--color-neon)]">
                    {processor.scaleMultiplier}
                  </span>
                </div>
                <div className="data-card">
                  <span className="data-card-label">Scale Divisor</span>
                  <span className="data-card-value text-[var(--color-neon)]">
                    {processor.scaleDivisor}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="mt-8 p-4 rounded-lg bg-[var(--color-border)] border border-[var(--color-border-hover)]">
          <p className="text-xs text-[var(--color-text-muted)]">
            Runtime input processor allows you to adjust trackball sensitivity and rotation without rebuilding firmware. 
            Changes are saved to the device immediately and persist across reboots.
          </p>
        </div>
      </div>
    </div>
  );
}
