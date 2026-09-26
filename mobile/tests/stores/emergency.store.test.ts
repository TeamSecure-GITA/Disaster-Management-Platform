import { useEmergencyStore } from '../../stores/emergency.store';

describe('Emergency Store', () => {
  beforeEach(() => {
    useEmergencyStore.getState().resetSOS();
  });

  it('starts in idle status', () => {
    const state = useEmergencyStore.getState();
    expect(state.sosStatus).toBe('idle');
    expect(state.isCountdownActive).toBe(false);
  });

  it('triggers countdown correctly', () => {
    useEmergencyStore.getState().triggerCountdown();
    expect(useEmergencyStore.getState().isCountdownActive).toBe(true);
    expect(useEmergencyStore.getState().sosStatus).toBe('countdown');
  });

  it('cancels countdown and returns to idle', () => {
    useEmergencyStore.getState().triggerCountdown();
    useEmergencyStore.getState().cancelCountdown();
    expect(useEmergencyStore.getState().isCountdownActive).toBe(false);
    expect(useEmergencyStore.getState().sosStatus).toBe('idle');
  });
});\n