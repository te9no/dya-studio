import {
  AnalogRole,
  AnalogResponseCurve,
  Notification,
  type AnalogAxisConfig,
  type AnalogAxisValue,
  type AnalogInputDevice,
  type Request,
  type Response,
} from "../../proto/dya/analog_input/analog_input";

export const ANALOG_INPUT_IDENTIFIER = "dya_analog_input";

const DEFAULT_DEVICES: AnalogInputDevice[] = [
  {
    id: 0,
    name: "MeKaBu Analog Stick",
    samplingHz: 100,
    reportIntervalMs: 8,
    axes: [
      {
        axisIndex: 0,
        name: "X Axis",
        enabled: true,
        adcChannel: 2,
        mvMid: 1630,
        mvMinMax: 1600,
        mvDeadzone: 10,
        scaleMultiplier: 1,
        scaleDivisor: 70,
        invert: true,
        role: AnalogRole.ANALOG_ROLE_REL_X,
        reportOnChangeOnly: false,
        outputMin: 0,
        outputMax: 24,
        responseCurve: AnalogResponseCurve.ANALOG_RESPONSE_CURVE_AGGRESSIVE,
      },
      {
        axisIndex: 1,
        name: "Y Axis",
        enabled: true,
        adcChannel: 3,
        mvMid: 1630,
        mvMinMax: 1600,
        mvDeadzone: 10,
        scaleMultiplier: 3,
        scaleDivisor: 4,
        invert: true,
        role: AnalogRole.ANALOG_ROLE_REL_Y,
        reportOnChangeOnly: false,
        outputMin: 0,
        outputMax: 24,
        responseCurve: AnalogResponseCurve.ANALOG_RESPONSE_CURVE_AGGRESSIVE,
      },
    ],
  },
];

export class AnalogInputHandler {
  private callbacks: ((data: Uint8Array) => void)[] = [];
  private devices: AnalogInputDevice[] = JSON.parse(
    JSON.stringify(DEFAULT_DEVICES),
  );
  private startedAt = Date.now();

  process(request: Request): Response {
    if (request.listDevices !== undefined) {
      return { listDevices: { devices: this.devices } };
    }

    if (request.getDevice !== undefined) {
      const device = this.devices.find(
        (item) => item.id === request.getDevice?.id,
      );
      if (!device)
        return { error: { message: "Analog input device not found" } };
      return { getDevice: { device } };
    }

    if (request.setSamplingHz !== undefined) {
      const device = this.findDevice(request.setSamplingHz.id);
      if (!device)
        return { error: { message: "Analog input device not found" } };
      device.samplingHz = request.setSamplingHz.value;
      this.notifyDevice(device);
      return { setSamplingHz: {} };
    }

    if (request.setReportInterval !== undefined) {
      const device = this.findDevice(request.setReportInterval.id);
      if (!device)
        return { error: { message: "Analog input device not found" } };
      device.reportIntervalMs = request.setReportInterval.valueMs;
      this.notifyDevice(device);
      return { setReportInterval: {} };
    }

    if (request.setAxisConfig !== undefined) {
      const device = this.findDevice(request.setAxisConfig.deviceId);
      const axis = request.setAxisConfig.axis;
      if (!device || !axis) {
        return { error: { message: "Analog axis not found" } };
      }
      const index = device.axes.findIndex(
        (current) => current.axisIndex === axis.axisIndex,
      );
      if (index === -1) return { error: { message: "Analog axis not found" } };
      device.axes[index] = this.sanitizeAxis(axis, device.axes[index]);
      this.notifyDevice(device);
      return { setAxisConfig: {} };
    }

    if (request.resetDevice !== undefined) {
      const original = DEFAULT_DEVICES.find(
        (device) => device.id === request.resetDevice?.id,
      );
      if (!original)
        return { error: { message: "Analog input device not found" } };
      const next = JSON.parse(JSON.stringify(original)) as AnalogInputDevice;
      this.devices = this.devices.map((device) =>
        device.id === next.id ? next : device,
      );
      this.notifyDevice(next);
      return { resetDevice: {} };
    }

    if (request.getValues !== undefined) {
      const device = this.findDevice(request.getValues.id);
      if (!device)
        return { error: { message: "Analog input device not found" } };

      return {
        getValues: {
          values: device.axes.map((axis) => this.demoValue(axis)),
          sampledAtMs: Date.now() - this.startedAt,
        },
      };
    }

    return { error: { message: "Not implemented" } };
  }

  notify(callback: (data: Uint8Array) => void) {
    this.callbacks.push(callback);
  }

  private findDevice(id: number) {
    return this.devices.find((device) => device.id === id);
  }

  private sanitizeAxis(
    axis: AnalogAxisConfig,
    current: AnalogAxisConfig,
  ): AnalogAxisConfig {
    return {
      ...axis,
      adcChannel: current.adcChannel,
      mvMid: Math.max(0, Math.min(3300, axis.mvMid)),
      mvMinMax: Math.max(1, Math.min(3300, axis.mvMinMax)),
      mvDeadzone: Math.max(0, Math.min(1000, axis.mvDeadzone)),
      scaleMultiplier: Math.max(1, axis.scaleMultiplier),
      scaleDivisor: Math.max(1, axis.scaleDivisor),
      outputMin: Math.max(0, Math.min(127, axis.outputMin)),
      outputMax: Math.max(1, Math.min(127, axis.outputMax)),
    };
  }

  private demoValue(axis: AnalogAxisConfig): AnalogAxisValue {
    const t = (Date.now() - this.startedAt) / 1000;
    const phase = axis.axisIndex === 0 ? 0 : Math.PI / 2;
    const travel = Math.sin(t * 1.8 + phase);
    const mv = Math.round(axis.mvMid + travel * axis.mvMinMax * 0.55);
    const raw = Math.max(0, Math.min(4095, Math.round((mv / 3300) * 4095)));
    const amount = Math.abs(mv - axis.mvMid);
    const activeRange = Math.max(1, axis.mvMinMax - axis.mvDeadzone);
    const normalized =
      amount <= axis.mvDeadzone
        ? 0
        : Math.min(1, (amount - axis.mvDeadzone) / activeRange);
    const curved =
      axis.responseCurve === AnalogResponseCurve.ANALOG_RESPONSE_CURVE_SOFT
        ? Math.sqrt(normalized)
        : axis.responseCurve ===
            AnalogResponseCurve.ANALOG_RESPONSE_CURVE_AGGRESSIVE
          ? normalized * normalized
          : normalized;
    const scaled =
      (axis.outputMin + (axis.outputMax - axis.outputMin) * curved) *
      axis.scaleMultiplier /
      Math.max(1, axis.scaleDivisor);
    const sign = mv >= axis.mvMid ? 1 : -1;
    const reportValue = Math.round((axis.invert ? -sign : sign) * scaled);

    return {
      axisIndex: axis.axisIndex,
      adcChannel: axis.adcChannel,
      raw,
      mv,
      reportValue,
      accumulatedDelta: reportValue,
    };
  }

  private notifyDevice(device: AnalogInputDevice) {
    const payload = Notification.encode({
      deviceChanged: { device },
    }).finish();
    setTimeout(() => {
      this.callbacks.forEach((callback) => callback(payload));
    }, 50);
  }
}
