/**
 * Jest Setup File
 * Configures global mocks and test environment
 */

// Mock window.location.href to allow assignment without navigation
// We need to use a getter/setter pattern so href can be set and retrieved
delete window.location;

let locationHref = '';

window.location = {
  get href() {
    return locationHref;
  },
  set href(url) {
    locationHref = url;
  },
  origin: 'http://localhost',
  protocol: 'http:',
  host: 'localhost',
  hostname: 'localhost',
  port: '',
  pathname: '/',
  search: '',
  hash: '',
  assign: jest.fn(),
  replace: jest.fn(),
  reload: jest.fn()
};
