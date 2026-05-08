import { useEffect, useRef, useState } from "react";
import {
  IconAlertTriangleFilled,
  IconDeviceGamepad2,
} from "@tabler/icons-react";
import * as Switch from "@radix-ui/react-switch";
import {
  AnalogResponseCurve,
  AnalogRole,
  type AnalogAxisConfig,
  type AnalogAxisValue,
  useAnalogInput,
} from "../hooks/useAnalogInput";
import { AnalogValueMonitor } from "../components/AnalogValueMonitor";
import {
  ANALOG_LOG_LIMIT,
  buildAnalogLogCsv,
  type AnalogLogSample,
} from "../lib/analog-log";

const ROLE_OPTIONS: { value: AnalogRole; label: string; zmk: string }[] = [
  {
    value: AnalogRole.ANALOG_ROLE_REL_X,
    label: "Mouse X",
    zmk: "INPUT_EV_REL / INPUT_REL_X",
  },
  {
    value: AnalogRole.ANALOG_ROLE_REL_Y,
    label: "Mouse Y",
    zmk: "INPUT_EV_REL / INPUT_REL_Y",
  },
  {
    value: AnalogRole.ANALOG_ROLE_REL_WHEEL,
    label: "Vertical Scroll",
    zmk: "INPUT_EV_REL / INPUT_REL_WHEEL",
  },
  {
    value: AnalogRole.ANALOG_ROLE_REL_HWHEEL,
    label: "Horizontal Scroll",
    zmk: "INPUT_EV_REL / INPUT_REL_HWHEEL",
  },
  {
    value: AnalogRole.ANALOG_ROLE_ABS_X,
    label: "Gamepad X",
    zmk: "INPUT_EV_ABS / INPUT_ABS_X",
  },
  {
    value: AnalogRole.ANALOG_ROLE_ABS_Y,
    label: "Gamepad Y",
    zmk: "INPUT_EV_ABS / INPUT_ABS_Y",
  },
];

const CURVE_OPTIONS: {
  value: AnalogResponseCurve;
  label: string;
  description: string;
}[] = [
  {
    value: AnalogResponseCurve.ANALOG_RESPONSE_CURVE_LINEAR,
    label: "Linear",
    description: "押し込み量に比例して出力",
  },
  {
    value: AnalogResponseCurve.ANALOG_RESPONSE_CURVE_SOFT,
    label: "Soft",
    description: "浅い入力から反応しやすい",
  },
  {
    value: AnalogResponseCurve.ANALOG_RESPONSE_CURVE_AGGRESSIVE,
    label: "Aggressive",
    description: "浅い入力は遅く、深く倒すと速い",
  },
];

function roleLabel(role: AnalogRole) {
  return (
    ROLE_OPTIONS.find((option) => option.value === role)?.label ?? "Custom"
  );
}

function curveLabel(curve: AnalogResponseCurve) {
  return (
    CURVE_OPTIONS.find((option) => option.value === curve)?.label ?? "Linear"
  );
}

function estimateOutput(axis: AnalogAxisConfig, percent: number) {
  const normalized = Math.max(0, Math.min(1, percent / 100));
  const outputMin = axis.outputMin ?? 0;
  const outputMax = Math.max(outputMin, axis.outputMax || 1);
  const curve =
    axis.responseCurve ?? AnalogResponseCurve.ANALOG_RESPONSE_CURVE_LINEAR;
  const curved =
    curve === AnalogResponseCurve.ANALOG_RESPONSE_CURVE_SOFT
      ? Math.sqrt(normalized)
      : curve === AnalogResponseCurve.ANALOG_RESPONSE_CURVE_AGGRESSIVE
        ? normalized * normalized
        : normalized;

  return Math.round(outputMin + (outputMax - outputMin) * curved);
}

function NumberField({
  label,
  value,
  min,
  max,
  step = 1,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm text-[var(--color-text-secondary)]">
          {label}
        </label>
        <span className="text-sm font-mono text-[var(--color-electric)]">
          {value}
          {suffix ?? ""}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-[var(--color-border)] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--color-electric)] [&::-webkit-slider-thumb]:shadow-[0_0_8px_var(--color-electric)] [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[var(--color-electric)] [&::-moz-range-thumb]:border-0"
      />
    </div>
  );
}

function SwitchRow({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm text-[var(--color-text-secondary)]">{title}</p>
        <p className="text-xs text-[var(--color-text-muted)]">{description}</p>
      </div>
      <Switch.Root
        checked={checked}
        onCheckedChange={onChange}
        className="w-11 h-6 rounded-full relative data-[state=checked]:bg-[var(--color-electric)] bg-[var(--color-surface)] border border-[var(--color-border)] transition-colors cursor-pointer flex-shrink-0"
      >
        <Switch.Thumb className="block w-5 h-5 rounded-full transition-transform data-[state=checked]:translate-x-5 translate-x-0.5 will-change-transform bg-white border border-[var(--color-border)]" />
      </Switch.Root>
    </div>
  );
}

function AxisCard({
  deviceId,
  axis,
  onChange,
}: {
  deviceId: number;
  axis: AnalogAxisConfig;
  onChange: (deviceId: number, axis: AnalogAxisConfig) => Promise<void>;
}) {
  const [draftAxis, setDraftAxis] = useState(axis);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setDraftAxis(axis);
  }, [axis]);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  const queueAxisSave = (next: AnalogAxisConfig, delayMs = 250) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      saveTimerRef.current = null;
      void onChange(deviceId, next);
    }, delayMs);
  };

  const updateAxis = (patch: Partial<AnalogAxisConfig>) => {
    const next = { ...draftAxis, ...patch };
    setDraftAxis(next);
    queueAxisSave(next);
  };
  const lowMv = Math.max(0, draftAxis.mvMid - draftAxis.mvMinMax);
  const highMv = draftAxis.mvMid + draftAxis.mvMinMax;
  const deadzonePercent = draftAxis.mvMinMax
    ? Math.round((draftAxis.mvDeadzone / draftAxis.mvMinMax) * 100)
    : 0;
  const outputMin = draftAxis.outputMin ?? 0;
  const outputMax = draftAxis.outputMax || 1;

  return (
    <div className="glass-card p-6 space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-medium text-[var(--color-text)]">
            {draftAxis.name || `Axis ${draftAxis.axisIndex}`}
          </h3>
          <p className="text-xs text-[var(--color-text-muted)]">
            {roleLabel(draftAxis.role)} / active range {lowMv}-{highMv}mV
          </p>
        </div>
        <Switch.Root
          checked={draftAxis.enabled}
          onCheckedChange={(enabled) => updateAxis({ enabled })}
          className="w-11 h-6 rounded-full relative data-[state=checked]:bg-[var(--color-electric)] bg-[var(--color-surface)] border border-[var(--color-border)] transition-colors cursor-pointer flex-shrink-0"
        >
          <Switch.Thumb className="block w-5 h-5 rounded-full transition-transform data-[state=checked]:translate-x-5 translate-x-0.5 will-change-transform bg-white border border-[var(--color-border)]" />
        </Switch.Root>
      </div>

      <div>
        <label className="text-sm text-[var(--color-text-secondary)] mb-2 block">
          Role
        </label>
        <select
          value={draftAxis.role}
          onChange={(event) =>
            updateAxis({ role: Number(event.target.value) as AnalogRole })
          }
          className="w-full px-4 py-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] text-sm cursor-pointer hover:border-[var(--color-border-hover)] focus:outline-none focus:border-[var(--color-electric)] transition-colors"
        >
          {ROLE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label} ({option.zmk})
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 tablet:grid-cols-2 gap-5">
        <NumberField
          label="Center Voltage"
          value={draftAxis.mvMid}
          min={0}
          max={3300}
          step={10}
          suffix="mV"
          onChange={(mvMid) => updateAxis({ mvMid })}
        />
        <NumberField
          label="Travel From Center"
          value={draftAxis.mvMinMax}
          min={1}
          max={2000}
          step={10}
          suffix="mV"
          onChange={(mvMinMax) => updateAxis({ mvMinMax })}
        />
        <NumberField
          label="Deadzone"
          value={draftAxis.mvDeadzone}
          min={0}
          max={500}
          step={5}
          suffix={`mV (${deadzonePercent}%)`}
          onChange={(mvDeadzone) => updateAxis({ mvDeadzone })}
        />
      </div>

      <div className="grid grid-cols-1 tablet:grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-[var(--color-text-secondary)] mb-2 block">
            Scale Multiplier
          </label>
          <input
            type="number"
            min={1}
            max={1000}
            value={draftAxis.scaleMultiplier}
            onChange={(event) =>
              updateAxis({ scaleMultiplier: Number(event.target.value) })
            }
            className="w-full px-4 py-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] text-sm focus:outline-none focus:border-[var(--color-electric)]"
          />
        </div>
        <div>
          <label className="text-sm text-[var(--color-text-secondary)] mb-2 block">
            Scale Divisor
          </label>
          <input
            type="number"
            min={1}
            max={1000}
            value={draftAxis.scaleDivisor}
            onChange={(event) =>
              updateAxis({
                scaleDivisor: Math.max(1, Number(event.target.value)),
              })
            }
            className="w-full px-4 py-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] text-sm focus:outline-none focus:border-[var(--color-electric)]"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm text-[var(--color-text-secondary)]">
              Response Curve
            </label>
            <span className="text-sm font-mono text-[var(--color-electric)]">
              {curveLabel(draftAxis.responseCurve)}
            </span>
          </div>
          <div className="grid grid-cols-1 tablet:grid-cols-3 gap-2">
            {CURVE_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => updateAxis({ responseCurve: option.value })}
                className={`px-4 py-3 rounded-lg text-left transition-colors ${
                  draftAxis.responseCurve === option.value
                    ? "bg-[var(--color-electric)] text-white"
                    : "bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)]"
                }`}
              >
                <span className="block text-sm font-medium">
                  {option.label}
                </span>
                <span className="block text-xs opacity-80">
                  {option.description}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 tablet:grid-cols-2 gap-5">
          <NumberField
            label="Minimum Output"
            value={outputMin}
            min={0}
            max={127}
            onChange={(value) =>
              updateAxis({ outputMin: Math.min(value, outputMax) })
            }
          />
          <NumberField
            label="Maximum Output"
            value={outputMax}
            min={1}
            max={127}
            onChange={(value) =>
              updateAxis({ outputMax: Math.max(value, outputMin) })
            }
          />
        </div>

        <div className="rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] p-4">
          <p className="text-xs text-[var(--color-text-muted)] mb-3">
            Output preview after deadzone: 25% / 50% / 100% push
          </p>
          <div className="grid grid-cols-3 gap-3">
            {[25, 50, 100].map((percent) => (
              <div key={percent}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-[var(--color-text-muted)]">
                    {percent}%
                  </span>
                  <span className="font-mono text-[var(--color-electric)]">
                    {estimateOutput(draftAxis, percent)}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-[var(--color-border)] overflow-hidden">
                  <div
                    className="h-full bg-[var(--color-electric)]"
                    style={{
                      width: `${Math.min(100, (estimateOutput(draftAxis, percent) / 127) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-[var(--color-text-muted)] mt-3">
            Firmware formula should normalize travel after deadzone, apply this
            curve, then map it to min/max output per report.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 tablet:grid-cols-2 gap-4 pt-1">
        <SwitchRow
          title="Invert Axis"
          description="Reverse direction before it is reported to ZMK input."
          checked={draftAxis.invert}
          onChange={(invert) => updateAxis({ invert })}
        />
        <SwitchRow
          title="Report On Change Only"
          description="Useful for gamepad axes and knobs; mouse movement can leave this off."
          checked={draftAxis.reportOnChangeOnly}
          onChange={(reportOnChangeOnly) => updateAxis({ reportOnChangeOnly })}
        />
      </div>
    </div>
  );
}

export function AnalogStickPage() {
  const {
    isAvailable,
    devices,
    isLoading,
    error,
    setSamplingHz,
    setReportInterval,
    setAxisConfig,
    resetDevice,
    getValues,
  } = useAnalogInput();

  const device = devices[0] ?? null;
  const [liveValues, setLiveValues] = useState<AnalogAxisValue[]>([]);
  const [sampledAtMs, setSampledAtMs] = useState<number | null>(null);
  const [logSamples, setLogSamples] = useState<AnalogLogSample[]>([]);
  const [isLogging, setIsLogging] = useState(true);
  const [draftSamplingHz, setDraftSamplingHz] = useState<number | null>(null);
  const [draftReportIntervalMs, setDraftReportIntervalMs] = useState<
    number | null
  >(null);
  const samplingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reportTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const logSequenceRef = useRef(0);
  const logDeviceIdRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (samplingTimerRef.current) clearTimeout(samplingTimerRef.current);
      if (reportTimerRef.current) clearTimeout(reportTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!device || !isAvailable) {
      logDeviceIdRef.current = null;
      return;
    }

    let cancelled = false;
    let inFlight = false;
    const deviceChanged = logDeviceIdRef.current !== device.id;
    if (deviceChanged) {
      logDeviceIdRef.current = device.id;
      logSequenceRef.current = 0;
    }
    let resetLog = deviceChanged;

    const refreshValues = async () => {
      if (inFlight) return;
      inFlight = true;
      const response = await getValues(device.id);
      inFlight = false;
      if (cancelled || !response) return;
      setLiveValues(response.values);
      setSampledAtMs(response.sampledAtMs);
      if (resetLog && !isLogging) {
        setLogSamples([]);
      }
      if (isLogging) {
        const sample: AnalogLogSample = {
          sequence: logSequenceRef.current++,
          receivedAt: Date.now(),
          sampledAtMs: response.sampledAtMs,
          values: response.values,
        };
        setLogSamples((prev) =>
          resetLog ? [sample] : [...prev, sample].slice(-ANALOG_LOG_LIMIT),
        );
      }
      resetLog = false;
    };

    void refreshValues();
    const interval = window.setInterval(refreshValues, 100);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [device, getValues, isAvailable, isLogging]);

  const clearLog = () => {
    setLogSamples([]);
    logSequenceRef.current = 0;
  };

  const exportLogCsv = () => {
    if (logSamples.length === 0) return;
    const blob = new Blob([buildAnalogLogCsv(logSamples)], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `analog-input-log-${new Date().toISOString().replace(/[:.]/g, "-")}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const queueSamplingHzSave = (value: number) => {
    if (!device) return;
    setDraftSamplingHz(value);
    if (samplingTimerRef.current) clearTimeout(samplingTimerRef.current);
    samplingTimerRef.current = setTimeout(() => {
      samplingTimerRef.current = null;
      void setSamplingHz(device.id, value);
    }, 250);
  };

  const queueReportIntervalSave = (value: number) => {
    if (!device) return;
    setDraftReportIntervalMs(value);
    if (reportTimerRef.current) clearTimeout(reportTimerRef.current);
    reportTimerRef.current = setTimeout(() => {
      reportTimerRef.current = null;
      void setReportInterval(device.id, value);
    }, 250);
  };

  const samplingHzValue = device ? (draftSamplingHz ?? device.samplingHz) : 0;
  const reportIntervalMsValue = device
    ? (draftReportIntervalMs ?? device.reportIntervalMs)
    : 0;

  return (
    <div className="p-6 h-full overflow-auto">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 rounded-lg bg-[var(--color-cyber)]/10 border border-[var(--color-cyber)]/20">
            <IconDeviceGamepad2
              size={24}
              className="text-[var(--color-cyber)]"
            />
          </div>
          <div>
            <h1 className="text-xl font-medium text-[var(--color-text)]">
              Analog Stick Settings
            </h1>
            <p className="text-sm text-[var(--color-text-muted)]">
              Tune analog input roles, calibration, deadzone, and scaling
            </p>
          </div>
        </div>

        {!isAvailable && !isLoading && !error && (
          <div className="mb-6 p-4 rounded-lg bg-[var(--color-border)] border border-[var(--color-border-hover)] flex items-start gap-3">
            <div className="p-2">
              <IconAlertTriangleFilled size={24} className="text-red-500" />
            </div>
            <p className="text-sm text-[var(--color-text-muted)]">
              Analog input subsystem is not available. Firmware must expose the
              <span className="font-mono text-[var(--color-text)] mx-1">
                dya_analog_input
              </span>
              custom subsystem and back it with badjeff/zmk-analog-input-driver.
            </p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {isLoading && !device && (
          <div className="mb-6 p-4 rounded-lg bg-[var(--color-border)] border border-[var(--color-border-hover)]">
            <p className="text-sm text-[var(--color-text-muted)]">
              Loading analog stick settings...
            </p>
          </div>
        )}

        {!isLoading && !device && !error && (
          <div className="mb-6 p-4 rounded-lg bg-[var(--color-border)] border border-[var(--color-border-hover)]">
            <p className="text-sm text-[var(--color-text-muted)]">
              No analog input device found.
            </p>
          </div>
        )}

        {device && (
          <div className="space-y-6">
            <AnalogValueMonitor
              values={liveValues}
              sampledAtMs={sampledAtMs}
              logSamples={logSamples}
              isLogging={isLogging}
              onToggleLogging={() => setIsLogging((current) => !current)}
              onClearLog={clearLog}
              onExportCsv={exportLogCsv}
            />

            <div className="glass-card p-6">
              <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                  <h2 className="text-sm font-medium text-[var(--color-text)]">
                    {device.name}
                  </h2>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    Global polling and report cadence for the analog input node.
                  </p>
                </div>
                <button
                  onClick={() => resetDevice(device.id)}
                  className="px-3 py-2 rounded-lg text-xs font-medium bg-[var(--color-surface)] text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:border-[var(--color-border-hover)] transition-colors"
                >
                  Reset
                </button>
              </div>

              <div className="grid grid-cols-1 tablet:grid-cols-2 gap-5">
                <NumberField
                  label="Sampling Rate"
                  value={samplingHzValue}
                  min={10}
                  max={500}
                  step={10}
                  suffix="Hz"
                  onChange={queueSamplingHzSave}
                />
                <NumberField
                  label="Report Interval"
                  value={reportIntervalMsValue}
                  min={1}
                  max={50}
                  suffix="ms"
                  onChange={queueReportIntervalSave}
                />
              </div>
            </div>

            {device.axes.map((axis) => (
              <AxisCard
                key={axis.axisIndex}
                deviceId={device.id}
                axis={axis}
                onChange={setAxisConfig}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
