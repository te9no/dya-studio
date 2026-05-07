import {
  AnalogRole,
  AnalogResponseCurve,
  Notification,
  type AnalogAxisConfig,
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

  private notifyDevice(device: AnalogInputDevice) {
    const payload = Notification.encode({
      deviceChanged: { device },
    }).finish();
    setTimeout(() => {
      this.callbacks.forEach((callback) => callback(payload));
    }, 50);
  }
}
