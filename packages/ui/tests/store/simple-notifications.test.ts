import { describe, it, expect } from 'vitest';
import { 
  showSuccessNotification, 
  showErrorNotification, 
  showWarningNotification, 
  showInfoNotification 
} from '../../src/store/notifications';

// Tests simples para las funciones helper sin hooks
describe('Notification Helper Functions', () => {
  it('should export showSuccessNotification function', () => {
    expect(showSuccessNotification).toBeTypeOf('function');
  });

  it('should export showErrorNotification function', () => {
    expect(showErrorNotification).toBeTypeOf('function');
  });

  it('should export showWarningNotification function', () => {
    expect(showWarningNotification).toBeTypeOf('function');
  });

  it('should export showInfoNotification function', () => {
    expect(showInfoNotification).toBeTypeOf('function');
  });

  it('should call functions without throwing errors', () => {
    expect(() => {
      showSuccessNotification('Test success message');
      showErrorNotification('Test error message');
      showWarningNotification('Test warning message');
      showInfoNotification('Test info message');
    }).not.toThrow();
  });
});
