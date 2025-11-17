import { render } from '@testing-library/react';
import App from './App';

// Basic smoke test to ensure App renders without throwing.
// We avoid asserting specific text to prevent failures when routes/content shift.
test('renders App without crashing', () => {
  render(<App />);
});
