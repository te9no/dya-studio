# Testing Best Practices

This document outlines the testing best practices implemented in this project, based on patterns from the [react-zmk-studio](https://github.com/cormoran/react-zmk-studio) library.

## Overview

Our tests follow the best practices recommended by the ZMK Studio React Hook library, utilizing its comprehensive test helpers to ensure clean, maintainable, and reliable tests.

## Key Improvements

### 1. Using Test Helpers from `@cormoran/zmk-studio-react-hook/testing`

Instead of manually mocking the ZMK hooks and connections, we use the official test helpers:

```typescript
import {
  setupZMKMocks,
  createMockZMKApp,
  createConnectedMockZMKApp,
  ZMKAppProvider,
} from "@cormoran/zmk-studio-react-hook/testing";
```

#### `setupZMKMocks()`

Automatically sets up all necessary mocks for the ZMK client. This should be called in `beforeEach()`:

```typescript
describe("MyComponent", () => {
  let mocks: ReturnType<typeof setupZMKMocks>;

  beforeEach(() => {
    mocks = setupZMKMocks();
  });
});
```

Returns an object with:

- `mockTransport` - Mock transport instance
- `mockConnection` - Mock connection instance
- `mockSuccessfulConnection(options)` - Helper to configure successful connection
- `mockFailedConnection(error)` - Helper to configure failed connection
- `mockFailedDeviceInfo()` - Helper to configure device info fetch failure

#### `createMockZMKApp(overrides?)`

Creates a mock ZMK app instance with default values that can be overridden:

```typescript
const mockZMKApp = createMockZMKApp({
  state: {
    deviceInfo: { name: "Test Device", serialNumber: new Uint8Array() },
    isConnected: true,
  },
});
```

#### `createConnectedMockZMKApp(options?)`

Creates a pre-configured connected mock ZMK app:

```typescript
const mockZMKApp = createConnectedMockZMKApp({
  deviceName: "My Device",
  subsystems: ["my-subsystem"],
});
```

#### `ZMKAppProvider`

Provides ZMKAppContext to child components in tests:

```typescript
render(
  <ZMKAppProvider value={mockZMKApp}>
    <MyComponent />
  </ZMKAppProvider>
);
```

### 2. Test Organization

Tests are organized into logical describe blocks that group related functionality:

```typescript
describe("MyComponent", () => {
  describe("Initial State", () => {
    // Tests for initial render state
  });

  describe("Connection Flow", () => {
    // Tests for connection/disconnection
  });

  describe("Error Handling", () => {
    // Tests for error scenarios
  });
});
```

### 3. Clear Test Documentation

Each test file includes:

- JSDoc comments explaining the purpose of the test suite
- Inline comments explaining complex test setups
- Clear test names that describe the expected behavior

```typescript
/**
 * Tests for BLEConnectionsPage component
 *
 * This test suite verifies the BLE connections management UI,
 * including profile listing, switching, unpairing, and editing.
 */
describe("BLEConnectionsPage", () => {
  // ...
});
```

### 4. Helper Functions

Test-specific helper functions improve readability and reduce duplication:

```typescript
/**
 * Helper function to render the component with custom context and hook values
 */
const renderComponent = (connectionOverrides = {}, profileOverrides = {}) => {
  const connectionContext = { ...mockConnectionContext, ...connectionOverrides };
  const profileHookReturn = { ...mockUseBLEProfiles(), ...profileOverrides };
  mockUseBLEProfiles.mockReturnValue(profileHookReturn);

  return render(
    <ConnectionContext.Provider value={connectionContext}>
      <ZMKAppProvider value={mockZMKApp}>
        <BLEConnectionsPage />
      </ZMKAppProvider>
    </ConnectionContext.Provider>
  );
};
```

### 5. Proper Mock Management

All mocks are properly reset in `beforeEach()`:

```typescript
beforeEach(() => {
  // Reset all mocks before each test
  jest.clearAllMocks();

  // Set default mock return value
  mocks = setupZMKMocks();
});
```

### 6. Testing User Interactions

User interactions are tested using `@testing-library/user-event` for realistic event simulation:

```typescript
const user = userEvent.setup();

// Simulate button click
await user.click(screen.getByTestId("connect-button"));

// Wait for expected outcome
await waitFor(() => {
  expect(screen.getByTestId("connection-status")).toHaveTextContent(
    "Connected",
  );
});
```

### 7. Testing Async Operations

Async operations are properly handled with `act()` and `waitFor()`:

```typescript
await act(async () => {
  await result.current.connect(connectFn);
});

expect(result.current.isConnected).toBe(true);
```

### 8. Testing Hook Integration

The `renderHook` utility is used to test custom hooks:

```typescript
const { result } = renderHook(() => useZMKApp());

await act(async () => {
  await result.current.connect(connectFn);
});

expect(result.current.isConnected).toBe(true);
```

## Test Structure

### DeviceConnection Tests

Located in: `src/components/__tests__/DeviceConnection.test.tsx`

Tests cover:

- Initial disconnected state
- Connection flow (loading → connected → disconnected)
- Error handling (Web Serial API errors, connection failures, device info failures)
- useZMKApp hook integration
- ConnectionContext value provision

### BLEConnectionsPage Tests

Located in: `src/pages/__tests__/BLEConnectionsPage.test.tsx`

Tests cover:

- Disconnected state UI
- Connected state with profiles
- Profile actions (switch, unpair)
- Profile name editing
- Error handling
- Button layout and accessibility

## Best Practices Summary

1. **Use official test helpers** instead of manual mocks
2. **Organize tests** into logical describe blocks
3. **Document test purpose** with comments
4. **Create helper functions** to reduce duplication
5. **Reset mocks** in beforeEach()
6. **Use realistic user interactions** with userEvent
7. **Handle async properly** with act() and waitFor()
8. **Test both happy and error paths**
9. **Use accessible queries** (getByRole, getByLabelText)
10. **Keep tests focused** - one concept per test

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- --testPathPattern="DeviceConnection.test"

# Run with coverage
npm run test:coverage
```

## References

- [react-zmk-studio Testing Documentation](https://github.com/cormoran/react-zmk-studio#testing)
- [Testing Library Best Practices](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
