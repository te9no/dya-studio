import { useState, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconBattery2,
  IconBluetooth,
  IconHeartRateMonitor,
  IconKeyboard,
  IconPointer,
  IconSettings,
} from "@tabler/icons-react";

import { SplashScreen } from "./components/SplashScreen";
import {
  DeviceConnectionProvider,
  ConnectionContext,
} from "./components/DeviceConnection";
import { TabNavigation } from "./components/TabNavigation";
import type { TabItem } from "./components/TabNavigation";
import { AppLayout } from "./layouts/AppLayout";
import { BatteryPage } from "./pages/BatteryPage";
import { BLEConnectionsPage } from "./pages/BLEConnectionsPage";
import { HealthCheckPage } from "./pages/HealthCheckPage";
import { KeymapPage } from "./pages/KeymapPage";
import { TrackballPage } from "./pages/TrackballPage";
import { SettingsPage } from "./pages/SettingsPage";

const tabs: TabItem[] = [
  {
    id: "battery",
    label: "Battery",
    icon: <IconBattery2 size={18} />,
    content: <BatteryPage />,
  },
  {
    id: "ble",
    label: "BLE",
    icon: <IconBluetooth size={18} />,
    content: <BLEConnectionsPage />,
  },
  {
    id: "health",
    label: "Health",
    icon: <IconHeartRateMonitor size={18} />,
    content: <HealthCheckPage />,
  },
  {
    id: "keymap",
    label: "Keymap",
    icon: <IconKeyboard size={18} />,
    content: <KeymapPage />,
  },
  {
    id: "trackball",
    label: "Trackball",
    icon: <IconPointer size={18} />,
    content: <TrackballPage />,
  },
  {
    id: "settings",
    label: "Settings",
    icon: <IconSettings size={18} />,
    content: <SettingsPage />,
  },
];

function AppContent() {
  const [activeTab, setActiveTab] = useState("battery");
  const connection = useContext(ConnectionContext);

  return (
    <AppLayout
      isConnected={connection.isConnected}
      deviceName={connection.deviceName}
      onConnect={connection.onConnect}
      onDisconnect={connection.onDisconnect}
      isConnecting={connection.isLoading}
    >
      <TabNavigation
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </AppLayout>
  );
}

function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <>
      <AnimatePresence>
        {showSplash && (
          <motion.div
            key="splash"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <SplashScreen
              onComplete={() => setShowSplash(false)}
              duration={2500}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {!showSplash && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="h-screen"
        >
          <DeviceConnectionProvider>
            <AppContent />
          </DeviceConnectionProvider>
        </motion.div>
      )}
    </>
  );
}

export default App;
