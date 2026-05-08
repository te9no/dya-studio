import type { AnalogAxisValue } from "../hooks/useAnalogInput";

export const ANALOG_LOG_LIMIT = 600;

export type AnalogLogSample = {
  sequence: number;
  receivedAt: number;
  sampledAtMs: number | null;
  values: AnalogAxisValue[];
};

export function buildAnalogLogCsv(samples: AnalogLogSample[]) {
  const rows = [
    [
      "sequence",
      "received_at_iso",
      "sampled_at_ms",
      "axis_index",
      "adc_channel",
      "raw",
      "mv",
      "report_value",
      "accumulated_delta",
    ],
  ];

  samples.forEach((sample) => {
    sample.values.forEach((value) => {
      rows.push([
        String(sample.sequence),
        new Date(sample.receivedAt).toISOString(),
        sample.sampledAtMs === null ? "" : String(sample.sampledAtMs),
        String(value.axisIndex),
        String(value.adcChannel),
        String(value.raw),
        String(value.mv),
        String(value.reportValue),
        String(value.accumulatedDelta),
      ]);
    });
  });

  return rows
    .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","))
    .join("\n");
}
