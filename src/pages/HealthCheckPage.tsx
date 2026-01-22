import {
  IconHeartRateMonitor,
  IconCircleCheck,
  IconAlertCircle,
  IconCircleDashed,
} from "@tabler/icons-react";

interface HealthItem {
  name: string;
  description: string;
  status: "ok" | "error" | "unknown";
}

const healthItems: HealthItem[] = [
  {
    name: "Left MCU",
    description: "Main controller communication",
    status: "unknown",
  },
  {
    name: "Right MCU",
    description: "Split keyboard communication",
    status: "unknown",
  },
  {
    name: "Trackball IC",
    description: "PMW3360 sensor connection",
    status: "unknown",
  },
  {
    name: "Left Battery",
    description: "Battery fuel gauge",
    status: "unknown",
  },
  {
    name: "Right Battery",
    description: "Battery fuel gauge",
    status: "unknown",
  },
  {
    name: "BLE Radio",
    description: "Bluetooth module status",
    status: "unknown",
  },
];

function StatusIcon({ status }: { status: HealthItem["status"] }) {
  switch (status) {
    case "ok":
      return <IconCircleCheck size={20} className="text-neon" />;
    case "error":
      return <IconAlertCircle size={20} className="text-red-500" />;
    default:
      return <IconCircleDashed size={20} className="text-white/30" />;
  }
}

export function HealthCheckPage() {
  return (
    <div className="p-6 h-full overflow-auto">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 rounded-lg bg-neon/10 border border-neon/20">
            <IconHeartRateMonitor size={24} className="text-neon" />
          </div>
          <div>
            <h1 className="text-xl font-medium text-white">Health Check</h1>
            <p className="text-sm text-white/50">
              Circuit and component diagnostics
            </p>
          </div>
        </div>

        {/* Health Status Grid */}
        <div className="grid grid-cols-1 tablet:grid-cols-2 gap-4">
          {healthItems.map((item) => (
            <div
              key={item.name}
              className="glass-card p-4 flex items-center gap-4"
            >
              <StatusIcon status={item.status} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">{item.name}</p>
                <p className="text-xs text-white/40 truncate">
                  {item.description}
                </p>
              </div>
              <span
                className={`text-xs font-mono uppercase ${
                  item.status === "ok"
                    ? "text-neon"
                    : item.status === "error"
                    ? "text-red-500"
                    : "text-white/30"
                }`}
              >
                {item.status}
              </span>
            </div>
          ))}
        </div>

        {/* Run Diagnostics Button */}
        <div className="mt-8 flex justify-center">
          <button className="btn-electric" disabled>
            Run Diagnostics
          </button>
        </div>

        {/* Info */}
        <div className="mt-8 p-4 rounded-lg bg-white/5 border border-white/10">
          <p className="text-xs text-white/40">
            Connect your keyboard to run hardware diagnostics. This will check
            communication with all components and report any issues.
          </p>
        </div>
      </div>
    </div>
  );
}
