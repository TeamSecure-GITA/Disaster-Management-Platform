import { EMERGENCY_NUMBERS } from '../../constants/emergency';
import { EmergencyServiceItem } from '../../types/emergency';

export const EmergencyService = {
  getOfficialHotlines(): EmergencyServiceItem[] {
    return EMERGENCY_NUMBERS.map((n, i) => ({
      id: `service-${i}`,
      name: n.service,
      number: n.number,
      type: n.number === '112' ? 'helpline' : n.number === '108' ? 'medical' : 'disaster',
      available24x7: true,
    }));
  }
};
