import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  DeviceConnectionProvider,
  ConnectionContext,
} from "../DeviceConnection";
import { useContext } from "react";

// Mock the useZMKApp hook
jest.mock("@cormoran/zmk-studio-react-hook", () => ({
  useZMKApp: jest.fn(),
  ZMKAppContext: {
    Provider: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
  },
}));

import { useZMKApp } from "@cormoran/zmk-studio-react-hook";
const mockUseZMKApp = useZMKApp as jest.MockedFunction<typeof useZMKApp>;

// Mock component to test the connection context
function TestComponent() {
  const connection = useContext(ConnectionContext);

  return (
    <div>
      <div data-testid="connection-status">
        {connection.isConnected ? "Connected" : "Disconnected"}
      </div>
      {connection.deviceName && (
        <div data-testid="device-name">{connection.deviceName}</div>
      )}
      {connection.isLoading && <div data-testid="loading">Loading...</div>}
      {connection.error && <div data-testid="error">{connection.error}</div>}
      <button onClick={connection.onConnect} data-testid="connect-button">
        Connect
      </button>
      <button onClick={connection.onDisconnect} data-testid="disconnect-button">
        Disconnect
      </button>
    </div>
  );
}

describe("DeviceConnection", () => {
  const mockConnect = jest.fn();
  const mockDisconnect = jest.fn();

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Default mock implementation
    mockUseZMKApp.mockReturnValue({
      state: {
        connection: null,
        deviceInfo: null,
        customSubsystems: null,
        isLoading: false,
        error: null,
      },
      connect: mockConnect,
      disconnect: mockDisconnect,
      findSubsystem: jest.fn(),
      isConnected: false,
    });
  });

  test("renders with disconnected state initially", () => {
    render(
      <DeviceConnectionProvider>
        <TestComponent />
      </DeviceConnectionProvider>,
    );

    expect(screen.getByTestId("connection-status")).toHaveTextContent(
      "Disconnected",
    );
    expect(screen.getByTestId("connect-button")).toBeInTheDocument();
  });

  test("shows error when Web Serial API is not supported", async () => {
    const user = userEvent.setup();

    // Mock connect to update state with error
    mockConnect.mockImplementation(async () => {
      mockUseZMKApp.mockReturnValue({
        state: {
          connection: null,
          deviceInfo: null,
          customSubsystems: null,
          isLoading: false,
          error: "Web Serial API is not supported in this browser",
        },
        connect: mockConnect,
        disconnect: mockDisconnect,
        findSubsystem: jest.fn(),
        isConnected: false,
      });
    });

    const { rerender } = render(
      <DeviceConnectionProvider>
        <TestComponent />
      </DeviceConnectionProvider>,
    );

    const connectButton = screen.getByTestId("connect-button");
    await user.click(connectButton);

    // Trigger a rerender to reflect the new state
    rerender(
      <DeviceConnectionProvider>
        <TestComponent />
      </DeviceConnectionProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("error")).toBeTruthy();
    });
  });

  test("shows loading state while connecting", async () => {
    const user = userEvent.setup();

    // Mock connect to update state to loading
    mockConnect.mockImplementation(async () => {
      mockUseZMKApp.mockReturnValue({
        state: {
          connection: null,
          deviceInfo: null,
          customSubsystems: null,
          isLoading: true,
          error: null,
        },
        connect: mockConnect,
        disconnect: mockDisconnect,
        findSubsystem: jest.fn(),
        isConnected: false,
      });
    });

    const { rerender } = render(
      <DeviceConnectionProvider>
        <TestComponent />
      </DeviceConnectionProvider>,
    );

    const connectButton = screen.getByTestId("connect-button");
    await user.click(connectButton);

    // Trigger a rerender to reflect the new state
    rerender(
      <DeviceConnectionProvider>
        <TestComponent />
      </DeviceConnectionProvider>,
    );

    // Should show loading state
    await waitFor(() => {
      expect(screen.getByTestId("loading")).toBeInTheDocument();
    });
  });

  test("successfully connects to keyboard", async () => {
    const user = userEvent.setup();

    // Mock successful connection
    mockConnect.mockImplementation(async () => {
      mockUseZMKApp.mockReturnValue({
        state: {
          connection: {} as any,
          deviceInfo: { name: "DYA Keyboard" } as any,
          customSubsystems: null,
          isLoading: false,
          error: null,
        },
        connect: mockConnect,
        disconnect: mockDisconnect,
        findSubsystem: jest.fn(),
        isConnected: true,
      });
    });

    const { rerender } = render(
      <DeviceConnectionProvider>
        <TestComponent />
      </DeviceConnectionProvider>,
    );

    const connectButton = screen.getByTestId("connect-button");
    await user.click(connectButton);

    // Trigger a rerender to reflect the new state
    rerender(
      <DeviceConnectionProvider>
        <TestComponent />
      </DeviceConnectionProvider>,
    );

    // Wait for connection to complete
    await waitFor(() => {
      expect(screen.getByTestId("connection-status")).toHaveTextContent(
        "Connected",
      );
    });

    expect(mockConnect).toHaveBeenCalled();
  });

  test("disconnects from keyboard", async () => {
    const user = userEvent.setup();

    // Start with connected state
    mockUseZMKApp.mockReturnValue({
      state: {
        connection: {} as any,
        deviceInfo: { name: "DYA Keyboard" } as any,
        customSubsystems: null,
        isLoading: false,
        error: null,
      },
      connect: mockConnect,
      disconnect: mockDisconnect,
      findSubsystem: jest.fn(),
      isConnected: true,
    });

    const { rerender } = render(
      <DeviceConnectionProvider>
        <TestComponent />
      </DeviceConnectionProvider>,
    );

    // Should be connected initially
    expect(screen.getByTestId("connection-status")).toHaveTextContent(
      "Connected",
    );

    // Mock disconnect to update state
    mockDisconnect.mockImplementation(() => {
      mockUseZMKApp.mockReturnValue({
        state: {
          connection: null,
          deviceInfo: null,
          customSubsystems: null,
          isLoading: false,
          error: null,
        },
        connect: mockConnect,
        disconnect: mockDisconnect,
        findSubsystem: jest.fn(),
        isConnected: false,
      });
    });

    // Click disconnect
    const disconnectButton = screen.getByTestId("disconnect-button");
    await user.click(disconnectButton);

    // Trigger a rerender to reflect the new state
    rerender(
      <DeviceConnectionProvider>
        <TestComponent />
      </DeviceConnectionProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("connection-status")).toHaveTextContent(
        "Disconnected",
      );
    });

    expect(mockDisconnect).toHaveBeenCalled();
  });

  test("handles user cancellation of port selection", async () => {
    const user = userEvent.setup();

    // Mock connect to do nothing (user canceled)
    mockConnect.mockImplementation(async () => {
      // State remains unchanged
    });

    render(
      <DeviceConnectionProvider>
        <TestComponent />
      </DeviceConnectionProvider>,
    );

    const connectButton = screen.getByTestId("connect-button");
    await user.click(connectButton);

    // Should not show error when user cancels
    await waitFor(() => {
      expect(screen.getByTestId("connection-status")).toHaveTextContent(
        "Disconnected",
      );
    });

    expect(screen.queryByTestId("error")).not.toBeInTheDocument();
  });

  test("handles connection errors", async () => {
    const user = userEvent.setup();

    // Mock connection error
    mockConnect.mockImplementation(async () => {
      mockUseZMKApp.mockReturnValue({
        state: {
          connection: null,
          deviceInfo: null,
          customSubsystems: null,
          isLoading: false,
          error: "Failed to open serial port",
        },
        connect: mockConnect,
        disconnect: mockDisconnect,
        findSubsystem: jest.fn(),
        isConnected: false,
      });
    });

    const { rerender } = render(
      <DeviceConnectionProvider>
        <TestComponent />
      </DeviceConnectionProvider>,
    );

    const connectButton = screen.getByTestId("connect-button");
    await user.click(connectButton);

    // Trigger a rerender to reflect the new state
    rerender(
      <DeviceConnectionProvider>
        <TestComponent />
      </DeviceConnectionProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("error")).toHaveTextContent(
        "Failed to open serial port",
      );
    });
  });
});
