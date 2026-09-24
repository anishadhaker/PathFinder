export const cities = [
  'Delhi',
  'Jaipur',
  'Ajmer',
  'Kota',
  'Udaipur',
  'Jodhpur',
  'Bikaner',
  'Agra',
  'Chandigarh',
  'Amritsar',
];

export const networkEdges = [
  { from: 'Delhi', to: 'Jaipur', distance: 280 },
  { from: 'Delhi', to: 'Agra', distance: 230 },
  { from: 'Delhi', to: 'Chandigarh', distance: 245 },
  { from: 'Delhi', to: 'Bikaner', distance: 450 },
  { from: 'Jaipur', to: 'Ajmer', distance: 135 },
  { from: 'Jaipur', to: 'Kota', distance: 250 },
  { from: 'Jaipur', to: 'Jodhpur', distance: 330 },
  { from: 'Ajmer', to: 'Udaipur', distance: 260 },
  { from: 'Ajmer', to: 'Jodhpur', distance: 210 },
  { from: 'Kota', to: 'Udaipur', distance: 290 },
  { from: 'Jodhpur', to: 'Udaipur', distance: 250 },
  { from: 'Jodhpur', to: 'Bikaner', distance: 250 },
  { from: 'Chandigarh', to: 'Amritsar', distance: 225 },
  { from: 'Agra', to: 'Jaipur', distance: 310 },
  { from: 'Kota', to: 'Ajmer', distance: 190 },
];

export const routeLookup = {
  'Jaipur-Udaipur': {
    path: ['Jaipur', 'Ajmer', 'Udaipur'],
    distance: 395,
    travelTime: '5h 20m',
    nodesVisited: 3,
  },
  'Delhi-Agra': {
    path: ['Delhi', 'Agra'],
    distance: 230,
    travelTime: '3h 30m',
    nodesVisited: 2,
  },
  'Delhi-Jaipur': {
    path: ['Delhi', 'Jaipur'],
    distance: 280,
    travelTime: '4h 10m',
    nodesVisited: 2,
  },
  'Kota-Udaipur': {
    path: ['Kota', 'Udaipur'],
    distance: 290,
    travelTime: '4h 15m',
    nodesVisited: 2,
  },
};

export const recentSearches = [
  { source: 'Jaipur', destination: 'Udaipur', distance: 395, time: '2 min ago' },
  { source: 'Delhi', destination: 'Agra', distance: 230, time: '1 hr ago' },
  { source: 'Delhi', destination: 'Jaipur', distance: 280, time: '3 hr ago' },
  { source: 'Kota', destination: 'Udaipur', distance: 290, time: '5 hr ago' },
];

export const algorithmSteps = [
  'Select Source',
  'Explore Neighbors',
  'Calculate Minimum Distance',
  'Reconstruct Shortest Path',
];
