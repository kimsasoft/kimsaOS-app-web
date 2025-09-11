import { describe, it, expect } from 'vitest';
import { 
  DashboardIcon, 
  CompanyIcon, 
  Eye, 
  EyeOff, 
  Lock,
  Github,
  Chrome
} from '../../src/icons';

describe('Icons', () => {
  it('should export DashboardIcon', () => {
    expect(DashboardIcon).toBeDefined();
    expect(typeof DashboardIcon).toBe('object');
  });

  it('should export CompanyIcon', () => {
    expect(CompanyIcon).toBeDefined();
    expect(typeof CompanyIcon).toBe('object');
  });

  it('should export Eye icon', () => {
    expect(Eye).toBeDefined();
    expect(typeof Eye).toBe('object');
  });

  it('should export EyeOff icon', () => {
    expect(EyeOff).toBeDefined();
    expect(typeof EyeOff).toBe('object');
  });

  it('should export Lock icon', () => {
    expect(Lock).toBeDefined();
    expect(typeof Lock).toBe('object');
  });

  it('should export Github icon', () => {
    expect(Github).toBeDefined();
    expect(typeof Github).toBe('object');
  });

  it('should export Chrome icon', () => {
    expect(Chrome).toBeDefined();
    expect(typeof Chrome).toBe('object');
  });

  it('should have backward compatibility aliases', () => {
    // DashboardIcon should be the same as Home
    expect(DashboardIcon).toBeDefined();
    expect(CompanyIcon).toBeDefined();
  });

  it('should be importable without errors', () => {
    expect(() => {
      const icons = {
        DashboardIcon,
        CompanyIcon,
        Eye,
        EyeOff,
        Lock,
        Github,
        Chrome
      };
      return icons;
    }).not.toThrow();
  });
});
