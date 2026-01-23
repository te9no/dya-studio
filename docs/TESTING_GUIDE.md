# Testing Guide

This guide explains how to write and run tests for the DYA Studio application.

## Test Framework

DYA Studio uses **Jest** as the test framework with **React Testing Library** for component testing.

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

## Writing Tests

### Component Test Structure

All component tests should follow this structure:

```tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  it('should render correctly', () => {
    render(<ComponentName />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('should handle user interaction', async () => {
    render(<ComponentName />);
    const button = screen.getByRole('button', { name: 'Button Name' });
    fireEvent.click(button);
    await waitFor(() => {
      expect(screen.getByText('Result')).toBeInTheDocument();
    });
  });
});
```

### Testing Pages

Pages should be tested for:
1. **Rendering**: Does the page render without errors?
2. **Connection State**: How does it behave when connected vs disconnected?
3. **User Interactions**: Do buttons, inputs, and forms work correctly?
4. **Error Handling**: Are errors displayed properly?
5. **Loading States**: Are loading indicators shown appropriately?

### Mocking Context

When testing components that use React Context:

```tsx
import { ConnectionContext } from '../components/DeviceConnection';
import { ZMKAppContext } from '@cormoran/zmk-studio-react-hook';

const mockConnectionContext = {
  isConnected: true,
  deviceName: 'Test Device',
  onConnect: jest.fn(),
  onDisconnect: jest.fn(),
  isLoading: false,
  error: null,
};

const mockZMKAppContext = {
  state: {
    connection: mockConnection,
    deviceInfo: { name: 'Test Device' },
    customSubsystems: null,
    isLoading: false,
    error: null,
  },
  connect: jest.fn(),
  disconnect: jest.fn(),
  findSubsystem: jest.fn(),
  isConnected: true,
  onNotification: jest.fn(),
};

// In your test:
render(
  <ConnectionContext.Provider value={mockConnectionContext}>
    <ZMKAppContext.Provider value={mockZMKAppContext}>
      <YourComponent />
    </ZMKAppContext.Provider>
  </ConnectionContext.Provider>
);
```

### Testing Custom Hooks

Custom hooks should be tested using `@testing-library/react-hooks`:

```tsx
import { renderHook, act } from '@testing-library/react-hooks';
import { useYourHook } from './useYourHook';

describe('useYourHook', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() => useYourHook());
    expect(result.current.value).toBe(defaultValue);
  });

  it('should update value when action is called', () => {
    const { result } = renderHook(() => useYourHook());
    act(() => {
      result.current.updateValue(newValue);
    });
    expect(result.current.value).toBe(newValue);
  });
});
```

### Testing Async Operations

When testing async operations like RPC calls:

```tsx
import { waitFor } from '@testing-library/react';

it('should load data on mount', async () => {
  const mockLoadData = jest.fn().mockResolvedValue({ data: 'test' });
  
  render(<ComponentWithAsyncData loadData={mockLoadData} />);
  
  await waitFor(() => {
    expect(screen.getByText('test')).toBeInTheDocument();
  });
  
  expect(mockLoadData).toHaveBeenCalledTimes(1);
});
```

## Best Practices

1. **Test User Behavior**: Test what the user sees and does, not implementation details
2. **Use Semantic Queries**: Prefer `getByRole`, `getByLabelText`, `getByText` over `getByTestId`
3. **Avoid Implementation Details**: Don't test internal state or private methods
4. **Mock External Dependencies**: Mock API calls, context providers, and external libraries
5. **Keep Tests Simple**: One test should verify one behavior
6. **Use Descriptive Names**: Test names should clearly describe what they test
7. **Arrange-Act-Assert**: Structure tests with clear setup, action, and verification phases

## Example: Testing a Page Component

See `src/pages/__tests__/BLEConnectionsPage.test.tsx` for a complete example of testing a page component with:
- Connection state handling
- User interactions
- Async operations
- Error states
- Loading states

## Coverage Goals

- **Statements**: >80%
- **Branches**: >75%
- **Functions**: >80%
- **Lines**: >80%

## Troubleshooting

### "Cannot find module" errors
Make sure Jest configuration includes the correct module resolution:
```json
{
  "moduleNameMapper": {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy"
  }
}
```

### Async act warnings
Wrap state updates in `act()` or use `waitFor()` for async operations.

### Context not available
Ensure all required context providers are wrapped around the component in tests.

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
