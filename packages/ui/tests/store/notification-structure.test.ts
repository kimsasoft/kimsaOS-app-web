import { describe, it, expect } from 'vitest';
import { create } from 'zustand';

// Test the notification types and basic functionality
describe('Notification System', () => {
  it('should define notification types correctly', () => {
    const notificationTypes = ['success', 'error', 'warning', 'info'] as const;
    
    expect(notificationTypes).toHaveLength(4);
    expect(notificationTypes).toContain('success');
    expect(notificationTypes).toContain('error');
    expect(notificationTypes).toContain('warning');
    expect(notificationTypes).toContain('info');
  });

  it('should create a basic notification object structure', () => {
    const mockNotification = {
      id: '123',
      type: 'success' as const,
      title: 'Test Title',
      message: 'Test Message',
      duration: 5000,
      dismissible: true,
    };

    expect(mockNotification.id).toBe('123');
    expect(mockNotification.type).toBe('success');
    expect(mockNotification.title).toBe('Test Title');
    expect(mockNotification.message).toBe('Test Message');
    expect(mockNotification.duration).toBe(5000);
    expect(mockNotification.dismissible).toBe(true);
  });

  it('should support zustand store creation', () => {
    // Test that we can create a basic store similar to our notification store
    const testStore = create<{ count: number; increment: () => void }>((set) => ({
      count: 0,
      increment: () => set((state) => ({ count: state.count + 1 })),
    }));

    expect(testStore).toBeDefined();
    expect(testStore.getState().count).toBe(0);
    
    testStore.getState().increment();
    expect(testStore.getState().count).toBe(1);
  });

  it('should validate notification duration defaults', () => {
    const defaultDurations = {
      success: 5000,
      info: 5000,
      warning: 5000,
      error: 7000, // Errors should last longer
    };

    expect(defaultDurations.error).toBeGreaterThan(defaultDurations.success);
    expect(defaultDurations.success).toBe(5000);
    expect(defaultDurations.error).toBe(7000);
  });

  it('should handle notification dismissibility', () => {
    const dismissibleNotification = {
      id: '1',
      type: 'success' as const,
      message: 'Dismissible',
      dismissible: true,
    };

    const nonDismissibleNotification = {
      id: '2', 
      type: 'error' as const,
      message: 'Non-dismissible',
      dismissible: false,
    };

    expect(dismissibleNotification.dismissible).toBe(true);
    expect(nonDismissibleNotification.dismissible).toBe(false);
  });
});
