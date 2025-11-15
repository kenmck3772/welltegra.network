# Unit Tests

This directory contains unit tests for the welltegra.network application.

## Running Tests

```bash
# Run all unit tests
npm run test:unit

# Run tests in watch mode
npm run test:unit:watch

# Run tests with coverage
npm run test:unit:coverage

# Run all tests (unit + e2e)
npm test
```

## Test Files

- `auth.test.js` - Comprehensive tests for authentication module (41 tests)
- `jest.setup.js` - Global test configuration and mocks

## Coverage

The current test suite covers:

### Authentication Module (`assets/js/auth.js`)
- ✅ Token storage and retrieval
- ✅ Token expiry validation
- ✅ Token refresh logic
- ✅ User session management
- ✅ Authentication state checking
- ✅ Logout functionality
- ✅ Authenticated API calls
- ✅ 401 error handling
- ✅ Edge cases (malformed data, XSS prevention)

**41 tests** covering all authentication functionality

## Test Structure

Tests are organized by function/feature with multiple test cases per function:
- Happy path scenarios
- Error conditions
- Edge cases
- Security considerations

## Next Steps

To improve test coverage, consider adding unit tests for:

1. **Backend/API** (`api/server.js`)
   - REST endpoint testing
   - Authentication middleware
   - Error handling
   - Rate limiting

2. **Business Logic Modules**
   - `pce-simulator.js` - Production simulation calculations
   - `risk-grid.js` - Risk assessment logic
   - `integrity-analyzer.js` - Integrity analysis algorithms
   - `toolstring-configurator.js` - Configuration logic

3. **Real-time Features**
   - WebSocket services
   - Data streaming
   - Event handlers

4. **Utilities**
   - Data transformation functions
   - Helper functions
   - Validation logic

## Notes

- Tests use jest-dom for DOM testing
- LocalStorage is mocked for all tests
- window.location is mocked to avoid navigation issues
- Date.now() is mocked for consistent time-based testing
