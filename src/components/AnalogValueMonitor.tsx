import {
  IconDownload,
  IconPlayerPause,
  IconPlayerPlay,
  IconTrash,
} from "@tabler/icons-react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { AnalogAxisValue } from "../hooks/useAnalogInput";
import { ANALOG_LOG_LIMIT, type AnalogLogSample } from "../lib/analog-log";
const AXIS_COLORS = ["#2dd4bf", "#f59e0b", "#60a5fa", "#f472b6"];
const METRIC_COLORS = {
  raw: "#38bdf8",
  mv: "#34d399",
  reportValue: "#f59e0b",
  accumulatedDelta: "#f472b6",
};

type AnalogLogChartPoint = {
  sequence: number;
  receivedAt: number;
  sampledAtMs: number | null;
  label: string;
  [key: string]: number | string | null;
};

function formatSampleTime(sample: AnalogLogSample) {
  if (sample.sampledAtMs !== null) return `${sample.sampledAtMs}ms`;
  return new Date(sample.receivedAt).toLocaleTimeString();
}

function axisLabel(value: AnalogAxisValue) {
  return `Axis ${value.axisIndex}`;
}

function normalizeSigned(value: number, maxAbs: number) {
  if (maxAbs <= 0) return 50;
  return 50 + (Math.max(-maxAbs, Math.min(maxAbs, value)) / maxAbs) * 50;
}

function buildLogChartData(samples: AnalogLogSample[]): AnalogLogChartPoint[] {
  const maxSigned = Math.max(
    1,
    ...samples.flatMap((sample) =>
      sample.values.flatMap((value) => [
        Math.abs(value.reportValue),
        Math.abs(value.accumulatedDelta),
      ]),
    ),
  );

  return samples.map((sample) => {
    const point: AnalogLogChartPoint = {
      sequence: sample.sequence,
      receivedAt: sample.receivedAt,
      sampledAtMs: sample.sampledAtMs,
      label: formatSampleTime(sample),
    };

    sample.values.forEach((value) => {
      const prefix = `axis${value.axisIndex}`;
      point[`${prefix}Raw`] = Math.max(
        0,
        Math.min(100, (value.raw / 4095) * 100),
      );
      point[`${prefix}Mv`] = Math.max(
        0,
        Math.min(100, (value.mv / 3300) * 100),
      );
      point[`${prefix}Report`] = normalizeSigned(value.reportValue, maxSigned);
      point[`${prefix}Accumulated`] = normalizeSigned(
        value.accumulatedDelta,
        maxSigned,
      );
      point[`${prefix}RawValue`] = value.raw;
      point[`${prefix}MvValue`] = value.mv;
      point[`${prefix}ReportValue`] = value.reportValue;
      point[`${prefix}AccumulatedValue`] = value.accumulatedDelta;
    });

    return point;
  });
}

export function AnalogValueMonitor({
  values,
  sampledAtMs,
  logSamples,
  isLogging,
  onToggleLogging,
  onClearLog,
  onExportCsv,
}: {
  values: AnalogAxisValue[];
  sampledAtMs: number | null;
  logSamples: AnalogLogSample[];
  isLogging: boolean;
  onToggleLogging: () => void;
  onClearLog: () => void;
  onExportCsv: () => void;
}) {
  const chartData = buildLogChartData(logSamples);
  const lastSample = logSamples.at(-1);
  const maxRaw = 4095;
  const maxMv = 3300;
  const maxReport = Math.max(
    1,
    ...values.map((value) => Math.abs(value.reportValue)),
    ...values.map((value) => Math.abs(value.accumulatedDelta)),
  );

  if (values.length === 0) {
    return (
      <div className="glass-card p-6">
        <h2 className="text-sm font-medium text-[var(--color-text)] mb-2">
          Live Driver Values
        </h2>
        <p className="text-xs text-[var(--color-text-muted)]">
          Waiting for the first analog sample from firmware...
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-medium text-[var(--color-text)]">
            Driver Value Log
          </h2>
          <p className="text-xs text-[var(--color-text-muted)]">
            Raw ADC, voltage, report value, and accumulated delta are stacked
            into a browser-side log for analysis.
          </p>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <button
            onClick={onToggleLogging}
            className="px-3 py-2 rounded-lg text-xs font-medium bg-[var(--color-surface)] text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:border-[var(--color-border-hover)] transition-colors inline-flex items-center gap-2"
          >
            {isLogging ? (
              <IconPlayerPause size={14} />
            ) : (
              <IconPlayerPlay size={14} />
            )}
            {isLogging ? "Pause" : "Resume"}
          </button>
          <button
            onClick={onExportCsv}
            disabled={logSamples.length === 0}
            className="px-3 py-2 rounded-lg text-xs font-medium bg-[var(--color-surface)] text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:border-[var(--color-border-hover)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-2"
          >
            <IconDownload size={14} />
            CSV
          </button>
          <button
            onClick={onClearLog}
            disabled={logSamples.length === 0}
            className="px-3 py-2 rounded-lg text-xs font-medium bg-[var(--color-surface)] text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:border-[var(--color-border-hover)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-2"
          >
            <IconTrash size={14} />
            Clear
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 tablet:grid-cols-4 gap-3">
        {[
          { label: "Samples", value: logSamples.length },
          { label: "Buffer", value: `${ANALOG_LOG_LIMIT} max` },
          {
            label: "Driver time",
            value: sampledAtMs !== null ? `${sampledAtMs}ms` : "not sampled",
          },
          {
            label: "Last received",
            value: lastSample
              ? new Date(lastSample.receivedAt).toLocaleTimeString()
              : "-",
          },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] p-3"
          >
            <p className="text-xs text-[var(--color-text-muted)]">
              {item.label}
            </p>
            <p className="text-sm font-mono text-[var(--color-text)]">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 tablet:grid-cols-2 gap-4">
        {values.map((value) => (
          <div
            key={value.axisIndex}
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--color-text)]">
                  Axis {value.axisIndex}
                </p>
              </div>
              <span className="text-lg font-mono text-[var(--color-electric)]">
                {value.reportValue}
              </span>
            </div>

            {[
              { label: "Raw ADC", current: value.raw, max: maxRaw },
              { label: "Voltage", current: value.mv, max: maxMv, suffix: "mV" },
              {
                label: "Report",
                current: value.reportValue,
                max: maxReport,
              },
              {
                label: "Accumulated",
                current: value.accumulatedDelta,
                max: maxReport,
              },
            ].map((item) => {
              const width =
                item.label === "Report" || item.label === "Accumulated"
                  ? (Math.abs(item.current) / item.max) * 100
                  : (Math.max(0, item.current) / item.max) * 100;
              return (
                <div key={item.label}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-[var(--color-text-muted)]">
                      {item.label}
                    </span>
                    <span className="font-mono text-[var(--color-text-secondary)]">
                      {item.current}
                      {item.suffix ?? ""}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-[var(--color-border)] overflow-hidden">
                    <div
                      className="h-full bg-[var(--color-cyber)]"
                      style={{ width: `${Math.min(100, width)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <div className="flex items-center justify-between gap-4 mb-3">
          <div>
            <h3 className="text-sm font-medium text-[var(--color-text)]">
              Normalized Overlay
            </h3>
            <p className="text-xs text-[var(--color-text-muted)]">
              Raw and mV are 0-100%. Report and accumulated delta are centered
              at 50% so direction changes are visible.
            </p>
          </div>
          <span className="text-xs font-mono text-[var(--color-text-muted)]">
            {isLogging ? "recording" : "paused"}
          </span>
        </div>

        {chartData.length < 2 ? (
          <div className="h-72 flex items-center justify-center border border-dashed border-[var(--color-border)] rounded-lg">
            <span className="text-sm text-[var(--color-text-muted)]">
              Need at least two samples to draw the log.
            </span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart
              data={chartData}
              margin={{ top: 8, right: 20, left: -20, bottom: 8 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--color-border)"
                opacity={0.35}
              />
              <XAxis
                dataKey="sequence"
                stroke="var(--color-text-muted)"
                tick={{ fill: "var(--color-text-muted)", fontSize: 11 }}
                tickLine={{ stroke: "var(--color-border)" }}
                tickFormatter={(value) => `#${value}`}
              />
              <YAxis
                domain={[0, 100]}
                stroke="var(--color-text-muted)"
                tick={{ fill: "var(--color-text-muted)", fontSize: 11 }}
                tickLine={{ stroke: "var(--color-border)" }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const point = payload[0]?.payload as AnalogLogChartPoint;
                  return (
                    <div className="glass-card p-3 border border-[var(--color-border)]">
                      <p className="text-xs font-medium text-[var(--color-text)] mb-2">
                        #{point.sequence} / {point.label}
                      </p>
                      {payload.map((entry) => (
                        <p
                          key={entry.dataKey}
                          className="text-xs text-[var(--color-text-secondary)]"
                        >
                          <span style={{ color: entry.color }}>■</span>{" "}
                          {entry.name}: {Number(entry.value).toFixed(1)}%
                        </p>
                      ))}
                    </div>
                  );
                }}
              />
              <Legend
                wrapperStyle={{
                  paddingTop: "12px",
                  fontSize: "11px",
                  color: "var(--color-text-secondary)",
                }}
              />

              {values.flatMap((value, axisIndex) => {
                const prefix = `axis${value.axisIndex}`;
                const axisColor = AXIS_COLORS[axisIndex % AXIS_COLORS.length];
                return [
                  <Line
                    key={`${prefix}-raw`}
                    type="monotone"
                    dataKey={`${prefix}Raw`}
                    name={`${axisLabel(value)} raw`}
                    stroke={METRIC_COLORS.raw}
                    strokeWidth={1}
                    dot={false}
                    isAnimationActive={false}
                  />,
                  <Line
                    key={`${prefix}-mv`}
                    type="monotone"
                    dataKey={`${prefix}Mv`}
                    name={`${axisLabel(value)} mV`}
                    stroke={METRIC_COLORS.mv}
                    strokeWidth={1}
                    dot={false}
                    isAnimationActive={false}
                  />,
                  <Line
                    key={`${prefix}-report`}
                    type="monotone"
                    dataKey={`${prefix}Report`}
                    name={`${axisLabel(value)} report`}
                    stroke={axisColor}
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />,
                  <Line
                    key={`${prefix}-accumulated`}
                    type="monotone"
                    dataKey={`${prefix}Accumulated`}
                    name={`${axisLabel(value)} delta`}
                    stroke={METRIC_COLORS.accumulatedDelta}
                    strokeWidth={1}
                    strokeDasharray="4 4"
                    dot={false}
                    isAnimationActive={false}
                  />,
                ];
              })}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
