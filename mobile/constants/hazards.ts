export const HAZARD_TYPES = {
  LANDSLIDE: 'landslide',
  FLASH_FLOOD: 'flash_flood',
  CYCLONE: 'cyclone',
  EARTHQUAKE: 'earthquake',
  WILDFIRE: 'wildfire',
  DEBRIS_FLOW: 'debris_flow',
} as const;

export const HAZARD_META = {
  landslide: {
    label: 'Landslide',
    color: '#FFB800',
    icon: 'mountain',
    criticalAdvice: 'Evacuate downslope residences immediately. Stay off cut-slope highways.',
  },
  flash_flood: {
    label: 'Flash Flood',
    color: '#3B82F6',
    icon: 'water',
    criticalAdvice: 'Climb to high ground immediately. Never drive or walk through moving floodwater.',
  },
  cyclone: {
    label: 'Cyclone / Surge',
    color: '#00F0FF',
    icon: 'wind',
    criticalAdvice: 'Evacuate coastal perimeter within 3km. Secure flying debris and shutters.',
  },
  earthquake: {
    label: 'Earthquake',
    color: '#FF2A55',
    icon: 'activity',
    criticalAdvice: 'Drop, Cover, and Hold On. Avoid flyovers, glass facades, and power conduits.',
  },
  wildfire: {
    label: 'Wildfire',
    color: '#FF5722',
    icon: 'flame',
    criticalAdvice: 'Shelter in place if escape corridor blocked. Protect respiratory tracts with wet cloth.',
  },
  debris_flow: {
    label: 'Debris Flow',
    color: '#D97706',
    icon: 'alert-triangle',
    criticalAdvice: 'Listen for rumbling sounds upstream. Evacuate valley bottoms at 90-degree angles.',
  },
};
