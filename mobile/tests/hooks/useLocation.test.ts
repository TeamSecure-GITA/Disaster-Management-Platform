import { renderHook, act } from '@testing-library/react-hooks';
import { useLocation } from '../../hooks/useLocation';

describe('useLocation Hook', () => {
  it('provides default location state', () => {
    const { result } = renderHook(() => useLocation());
    expect(result.current.hasPermission).toBeDefined();
    expect(result.current.isLoading).toBeDefined();
  });
});\n