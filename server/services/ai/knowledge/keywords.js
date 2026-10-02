/**
 * CivicSetu AI Rule-Based Knowledge Base
 * Maps municipal categories to weighted phrases, keywords, base priorities,
 * and contains linguistic indicators for Hinglish transliterations and urgency heuristics.
 */

export const STOPWORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren\'t',
  'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
  'can', 'cannot', 'could', 'did', 'do', 'does', 'doing', 'down', 'during', 'each', 'few', 'for', 'from',
  'further', 'had', 'has', 'have', 'having', 'he', 'her', 'here', 'hers', 'herself', 'him', 'himself',
  'his', 'how', 'i', 'if', 'in', 'into', 'is', 'isn\'t', 'it', 'its', 'itself', 'let\'s', 'me', 'more',
  'most', 'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'ought',
  'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'she', 'should', 'so', 'some', 'such',
  'than', 'that', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they',
  'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'wasn\'t', 'we',
  'were', 'weren\'t', 'what', 'when', 'where', 'which', 'while', 'who', 'whom', 'why', 'with', 'won\'t',
  'would', 'you', 'your', 'yours', 'yourself', 'yourselves',
  // Common conversational fillers
  'please', 'kindly', 'help', 'sir', 'madam', 'complaint', 'issue', 'problem', 'grievance', 'matter',
  'hai', 'tha', 'thi', 'the', 'ko', 'se', 'me', 'mein', 'karo', 'kripya'
]);

// Transliterated Hinglish equivalents mapped to standardized English terms
export const HINGLISH_NORMALIZATIONS = {
  'paani': 'water',
  'pani': 'water',
  'peene': 'drinking water',
  'nal': 'tap',
  'bijli': 'electricity power',
  'batti': 'light streetlight',
  'roshni': 'light',
  'andhera': 'dark streetlight',
  'kachra': 'garbage waste',
  'kuda': 'garbage waste',
  'kude': 'garbage waste',
  'dustbin': 'bin garbage',
  'dabba': 'bin',
  'safai': 'sanitation cleaning',
  'gandagi': 'unhygienic dirt waste',
  'sadak': 'road',
  'rasta': 'road street',
  'gaddha': 'pothole',
  'gaddhe': 'potholes',
  'khadda': 'pothole',
  'khadde': 'potholes',
  'nali': 'drain drain blockage',
  'naali': 'drain',
  'nala': 'drain drainage',
  'naala': 'drain',
  'gutter': 'drain drainage sewage',
  'badboo': 'foul odor smell',
  'gaadi': 'vehicle car',
  'kutte': 'stray dogs',
  'kutta': 'stray dog',
  'machhar': 'mosquito',
  'jhula': 'playground swing',
  'ped': 'tree',
  'vriksh': 'tree',
};

// Urgency and SLA Escalation Signals
export const URGENCY_HEURISTICS = {
  duration: [
    { pattern: /\b(three|four|five|six|seven|eight|nine|ten|[3-9]|10)\s*days?\b/i, signal: 'Extended duration (>3 days)', boost: 'High' },
    { pattern: /\b(two|2)\s*weeks?\b/i, signal: 'Chronic duration (>14 days)', boost: 'High' },
    { pattern: /\b(a|one|1)\s*week\b/i, signal: 'Unresolved for a full week', boost: 'Medium' },
    { pattern: /\b(month|months)\b/i, signal: 'Prolonged neglect (>30 days)', boost: 'Critical' },
    { pattern: /\b(since\s+(yesterday|long|days|weeks))\b/i, signal: 'Ongoing continuous disruption', boost: 'Medium' }
  ],
  severity: [
    { pattern: /\b(accident|injured|injury|hit|casualty|blood)\b/i, signal: 'Physical injury / accident reported', boost: 'Critical' },
    { pattern: /\b(danger|dangerous|hazard|hazardous|fatal|perilous)\b/i, signal: 'Public safety hazard', boost: 'High' },
    { pattern: /\b(spark|sparking|fire|blast|smoke|shock|electrocution)\b/i, signal: 'Electrical or fire hazard', boost: 'Critical' },
    { pattern: /\b(child|children|kids|baby|school|student|students)\b/i, signal: 'Vulnerable group (children/students) impacted', boost: 'High' },
    { pattern: /\b(hospital|patient|clinic|ambulance|elderly|senior citizen)\b/i, signal: 'Emergency/hospital/elderly access affected', boost: 'Critical' },
    { pattern: /\b(dengue|malaria|cholera|epidemic|infection|disease)\b/i, signal: 'Vector-borne disease outbreak risk', boost: 'High' },
    { pattern: /\b(flooding|submerged|knee\s*deep|drowning)\b/i, signal: 'Severe inundation / flooding', boost: 'High' }
  ],
  scale: [
    { pattern: /\b(entire|whole|all)\s*(area|street|locality|colony|society|ward|village|sector)\b/i, signal: 'Area-wide collective impact', boost: 'High' },
    { pattern: /\b(hundreds|thousands|many\s*residents|all\s*families|300\s*houses?)\b/i, signal: 'Large community demographic affected', boost: 'High' }
  ],
  repetition: [
    { pattern: /\b(again|still\s*not|repeatedly|several\s*times|multiple\s*complaints?|no\s*action|ignored)\b/i, signal: 'Repeated complaint with inaction', boost: 'Medium' }
  ]
};

// Category Knowledge Base
export const CATEGORY_KNOWLEDGE = {
  // --- ROADS & INFRASTRUCTURE ---
  'Pothole': {
    department: 'ROADS',
    basePriority: 'Medium',
    exactPhrases: [
      { phrase: 'pothole', weight: 10 },
      { phrase: 'potholes', weight: 10 },
      { phrase: 'deep pothole', weight: 14 },
      { phrase: 'large pothole', weight: 14 },
      { phrase: 'road crater', weight: 12 },
      { phrase: 'craters on road', weight: 12 },
      { phrase: 'crater', weight: 8 },
      { phrase: 'gaddha', weight: 10 },
      { phrase: 'khadda', weight: 10 },
      { phrase: 'broken asphalt', weight: 9 },
      { phrase: 'two wheeler skidded', weight: 11 },
    ],
    keywords: {
      pothole: 6,
      potholes: 6,
      crater: 5,
      craters: 5,
      gaddha: 5,
      khadda: 5,
      skid: 3,
      skidded: 4,
      bumpy: 3,
      tarmac: 3,
      asphalt: 3,
    }
  },
  'Damaged Road/Footpath': {
    department: 'ROADS',
    basePriority: 'Low',
    exactPhrases: [
      { phrase: 'damaged road', weight: 10 },
      { phrase: 'damaged footpath', weight: 12 },
      { phrase: 'broken footpath', weight: 12 },
      { phrase: 'broken sidewalk', weight: 12 },
      { phrase: 'paver blocks missing', weight: 12 },
      { phrase: 'pedestrian path damaged', weight: 11 },
      { phrase: 'cracked tiles', weight: 8 },
      { phrase: 'pavement', weight: 7 },
    ],
    keywords: {
      footpath: 6,
      sidewalk: 6,
      pavement: 5,
      pavers: 5,
      paver: 4,
      kerb: 4,
      curb: 4,
      pedestrian: 3,
      walking: 2,
    }
  },
  'Road Construction Issue': {
    department: 'ROADS',
    basePriority: 'Medium',
    exactPhrases: [
      { phrase: 'road construction', weight: 12 },
      { phrase: 'road work incomplete', weight: 12 },
      { phrase: 'open trench', weight: 12 },
      { phrase: 'unbarricaded', weight: 10 },
      { phrase: 'dug up road', weight: 12 },
      { phrase: 'excavation left open', weight: 12 },
      { phrase: 'debris on road', weight: 8 },
    ],
    keywords: {
      construction: 5,
      trench: 6,
      digging: 5,
      excavation: 5,
      barricade: 4,
      gravel: 3,
      tar: 3,
    }
  },
  'Broken Signage/Divider': {
    department: 'ROADS',
    basePriority: 'Low',
    exactPhrases: [
      { phrase: 'broken divider', weight: 12 },
      { phrase: 'road divider', weight: 10 },
      { phrase: 'median broken', weight: 12 },
      { phrase: 'traffic sign missing', weight: 11 },
      { phrase: 'signboard damaged', weight: 11 },
      { phrase: 'reflectors broken', weight: 9 },
    ],
    keywords: {
      divider: 6,
      median: 6,
      signage: 6,
      signboard: 5,
      reflector: 4,
      studs: 4,
      railing: 4,
    }
  },

  // --- WATER SUPPLY ---
  'Water Supply Disruption': {
    department: 'WATER',
    basePriority: 'High',
    exactPhrases: [
      { phrase: 'no water supply', weight: 18 },
      { phrase: 'water supply disruption', weight: 18 },
      { phrase: 'no water', weight: 14 },
      { phrase: 'no tap water', weight: 15 },
      { phrase: 'water cut', weight: 14 },
      { phrase: 'water supply stopped', weight: 16 },
      { phrase: 'water not coming', weight: 15 },
      { phrase: 'tank dry', weight: 10 },
      { phrase: 'water tanker needed', weight: 11 },
      { phrase: 'paani nahi aa raha', weight: 16 },
    ],
    keywords: {
      water: 6,
      supply: 6,
      tap: 4,
      drinking: 4,
      disruption: 5,
      shortage: 4,
      tanker: 4,
      borewell: 3,
    }
  },
  'Low Water Pressure': {
    department: 'WATER',
    basePriority: 'Low',
    exactPhrases: [
      { phrase: 'low water pressure', weight: 16 },
      { phrase: 'weak water pressure', weight: 15 },
      { phrase: 'water pressure low', weight: 15 },
      { phrase: 'trickle of water', weight: 12 },
      { phrase: 'barely any water', weight: 11 },
      { phrase: 'slow water flow', weight: 11 },
    ],
    keywords: {
      pressure: 8,
      trickle: 5,
      weak: 4,
      slow: 3,
      flow: 3,
    }
  },
  'Contaminated Water': {
    department: 'WATER',
    basePriority: 'Critical',
    exactPhrases: [
      { phrase: 'contaminated water', weight: 18 },
      { phrase: 'dirty tap water', weight: 16 },
      { phrase: 'muddy water', weight: 15 },
      { phrase: 'smelly water', weight: 14 },
      { phrase: 'brown water', weight: 14 },
      { phrase: 'black water in tap', weight: 16 },
      { phrase: 'water smelling like sewage', weight: 18 },
      { phrase: 'drinking water contaminated', weight: 18 },
    ],
    keywords: {
      contaminated: 7,
      contamination: 7,
      dirty: 4,
      muddy: 5,
      brown: 4,
      odor: 4,
      smell: 4,
      turbid: 5,
      polluted: 5,
      yellowish: 4,
    }
  },
  'Pipeline Leakage': {
    department: 'WATER',
    basePriority: 'Medium',
    exactPhrases: [
      { phrase: 'pipeline leakage', weight: 16 },
      { phrase: 'pipe burst', weight: 16 },
      { phrase: 'leaking pipeline', weight: 15 },
      { phrase: 'water pipe leak', weight: 16 },
      { phrase: 'valve leaking', weight: 14 },
      { phrase: 'main line burst', weight: 16 },
      { phrase: 'water gushing out', weight: 13 },
      { phrase: 'water wasting on road', weight: 12 },
    ],
    keywords: {
      leakage: 6,
      leak: 6,
      leaking: 6,
      burst: 7,
      pipeline: 6,
      pipe: 5,
      valve: 5,
      gushing: 4,
      spraying: 4,
    }
  },

  // --- ELECTRICITY & STREET LIGHTING ---
  'Streetlight Not Working': {
    department: 'ELEC',
    basePriority: 'Medium',
    exactPhrases: [
      { phrase: 'streetlight not working', weight: 18 },
      { phrase: 'street light not working', weight: 18 },
      { phrase: 'street lights off', weight: 16 },
      { phrase: 'dark street', weight: 12 },
      { phrase: 'lamp post not working', weight: 16 },
      { phrase: 'streetlight dark', weight: 14 },
      { phrase: 'batti band hai', weight: 14 },
      { phrase: 'no streetlights', weight: 15 },
      { phrase: 'broken streetlight', weight: 15 },
    ],
    keywords: {
      streetlight: 8,
      streetlights: 8,
      streetlamp: 7,
      lamppost: 7,
      bulb: 4,
      dark: 4,
      darkness: 4,
      lighting: 4,
      illumination: 4,
    }
  },
  'Exposed/Fallen Wire': {
    department: 'ELEC',
    basePriority: 'Critical',
    exactPhrases: [
      { phrase: 'exposed wire', weight: 18 },
      { phrase: 'fallen wire', weight: 18 },
      { phrase: 'hanging electric cable', weight: 16 },
      { phrase: 'live wire', weight: 18 },
      { phrase: 'open transformer', weight: 15 },
      { phrase: 'sparking cable', weight: 16 },
      { phrase: 'electric wire touching', weight: 16 },
      { phrase: 'wire dangling', weight: 15 },
    ],
    keywords: {
      wire: 6,
      wires: 6,
      cable: 5,
      transformer: 6,
      live: 6,
      hanging: 5,
      dangling: 5,
      sparking: 6,
      shock: 6,
      exposed: 6,
      substation: 4,
    }
  },
  'Power Outage': {
    department: 'ELEC',
    basePriority: 'High',
    exactPhrases: [
      { phrase: 'power outage', weight: 18 },
      { phrase: 'power cut', weight: 16 },
      { phrase: 'load shedding', weight: 15 },
      { phrase: 'electricity cut', weight: 16 },
      { phrase: 'no electricity', weight: 16 },
      { phrase: 'voltage fluctuation', weight: 15 },
      { phrase: 'low voltage', weight: 14 },
      { phrase: 'frequent power tripping', weight: 16 },
      { phrase: 'bijli chali gayi', weight: 16 },
    ],
    keywords: {
      outage: 7,
      blackout: 7,
      electricity: 5,
      voltage: 6,
      tripping: 5,
      fluctuation: 5,
      phase: 4,
      current: 3,
    }
  },

  // --- GARBAGE & WASTE MANAGEMENT ---
  'Garbage Collection': {
    department: 'WASTE',
    basePriority: 'Medium',
    exactPhrases: [
      { phrase: 'garbage not collected', weight: 18 },
      { phrase: 'waste not collected', weight: 18 },
      { phrase: 'garbage collection', weight: 14 },
      { phrase: 'kachra nahi uthaya', weight: 18 },
      { phrase: 'door to door garbage', weight: 14 },
      { phrase: 'sweeping not done', weight: 12 },
      { phrase: 'garbage van skipped', weight: 15 },
      { phrase: 'compactor truck not coming', weight: 15 },
    ],
    keywords: {
      garbage: 6,
      trash: 6,
      waste: 5,
      collection: 5,
      kachra: 6,
      kuda: 6,
      sweeper: 4,
      sweeping: 4,
      sanitation: 4,
    }
  },
  'Overflowing Bin': {
    department: 'WASTE',
    basePriority: 'High',
    exactPhrases: [
      { phrase: 'overflowing bin', weight: 18 },
      { phrase: 'dustbin overflowing', weight: 18 },
      { phrase: 'garbage dumper full', weight: 16 },
      { phrase: 'trash bin spilling', weight: 16 },
      { phrase: 'waste overflowing on street', weight: 16 },
      { phrase: 'dustbin broken', weight: 12 },
    ],
    keywords: {
      overflowing: 7,
      bin: 5,
      dustbin: 6,
      dumper: 5,
      spilling: 5,
      dumpster: 6,
      heaps: 4,
    }
  },
  'Illegal Dumping': {
    department: 'WASTE',
    basePriority: 'High',
    exactPhrases: [
      { phrase: 'illegal dumping', weight: 18 },
      { phrase: 'dumping garbage', weight: 15 },
      { phrase: 'debris dumped', weight: 16 },
      { phrase: 'construction waste dumped', weight: 16 },
      { phrase: 'illegal waste dump', weight: 18 },
      { phrase: 'open dumping ground', weight: 14 },
    ],
    keywords: {
      dumping: 7,
      dumped: 6,
      debris: 6,
      rubble: 5,
      malba: 5,
      disposal: 4,
    }
  },
  'Dead Animal Removal': {
    department: 'WASTE',
    basePriority: 'Critical',
    exactPhrases: [
      { phrase: 'dead animal', weight: 18 },
      { phrase: 'animal carcass', weight: 18 },
      { phrase: 'dead dog', weight: 16 },
      { phrase: 'dead bird', weight: 14 },
      { phrase: 'dead cow', weight: 16 },
      { phrase: 'decaying animal', weight: 16 },
    ],
    keywords: {
      dead: 6,
      carcass: 8,
      corpse: 7,
      decaying: 5,
      rotting: 5,
    }
  },

  // --- DRAINAGE & SEWERAGE ---
  'Drain Blockage': {
    department: 'DRAIN',
    basePriority: 'High',
    exactPhrases: [
      { phrase: 'drain blockage', weight: 18 },
      { phrase: 'drain blocked', weight: 18 },
      { phrase: 'choked drain', weight: 18 },
      { phrase: 'gutter blocked', weight: 16 },
      { phrase: 'storm drain clogged', weight: 16 },
      { phrase: 'nali band hai', weight: 16 },
      { phrase: 'drain cleaning needed', weight: 12 },
    ],
    keywords: {
      drain: 6,
      drainage: 6,
      choked: 6,
      clogged: 6,
      blockage: 6,
      gutter: 6,
      culvert: 5,
      silt: 4,
    }
  },
  'Sewage Overflow': {
    department: 'DRAIN',
    basePriority: 'High',
    exactPhrases: [
      { phrase: 'sewage overflow', weight: 18 },
      { phrase: 'gutter overflowing', weight: 18 },
      { phrase: 'sewer water leaking', weight: 16 },
      { phrase: 'foul sewage', weight: 15 },
      { phrase: 'chamber overflowing', weight: 16 },
      { phrase: 'black foul water', weight: 14 },
      { phrase: 'sewer line burst', weight: 16 },
    ],
    keywords: {
      sewage: 7,
      sewer: 7,
      overflow: 6,
      overflowing: 6,
      chamber: 5,
      stink: 4,
      foul: 4,
    }
  },
  'Waterlogging': {
    department: 'DRAIN',
    basePriority: 'High',
    exactPhrases: [
      { phrase: 'waterlogging', weight: 18 },
      { phrase: 'water logging', weight: 18 },
      { phrase: 'rainwater stagnant', weight: 15 },
      { phrase: 'street flooded', weight: 16 },
      { phrase: 'subway waterlogged', weight: 16 },
      { phrase: 'knee deep water', weight: 16 },
      { phrase: 'paani bhara hua', weight: 16 },
    ],
    keywords: {
      waterlogging: 8,
      waterlogged: 8,
      flooding: 6,
      flooded: 6,
      inundation: 5,
      stagnant: 4,
    }
  },
  'Open Manhole': {
    department: 'DRAIN',
    basePriority: 'Critical',
    exactPhrases: [
      { phrase: 'open manhole', weight: 20 },
      { phrase: 'manhole cover missing', weight: 20 },
      { phrase: 'broken manhole lid', weight: 18 },
      { phrase: 'uncovered manhole', weight: 20 },
      { phrase: 'gutter cover broken', weight: 16 },
      { phrase: 'hole in middle of road', weight: 12 },
    ],
    keywords: {
      manhole: 8,
      lid: 5,
      cover: 4,
      chamber: 4,
      uncovered: 5,
    }
  },

  // --- PUBLIC HEALTH ---
  'Mosquito/Pest Breeding': {
    department: 'HEALTH',
    basePriority: 'High',
    exactPhrases: [
      { phrase: 'mosquito breeding', weight: 18 },
      { phrase: 'mosquito menace', weight: 16 },
      { phrase: 'stagnant water breeding mosquitoes', weight: 18 },
      { phrase: 'anti larval fogging', weight: 16 },
      { phrase: 'fumigation needed', weight: 14 },
      { phrase: 'dengue cases', weight: 15 },
      { phrase: 'machhar', weight: 12 },
    ],
    keywords: {
      mosquito: 7,
      mosquitoes: 7,
      larvae: 7,
      fogging: 6,
      pest: 5,
      fumigation: 5,
      dengue: 6,
      malaria: 6,
    }
  },
  'Unhygienic Food Vendor': {
    department: 'HEALTH',
    basePriority: 'Medium',
    exactPhrases: [
      { phrase: 'unhygienic food vendor', weight: 18 },
      { phrase: 'roadside food stall unhygienic', weight: 16 },
      { phrase: 'stale food sold', weight: 14 },
      { phrase: 'food cart without license', weight: 14 },
      { phrase: 'open food exposed to flies', weight: 16 },
    ],
    keywords: {
      vendor: 5,
      stall: 4,
      food: 5,
      unhygienic: 6,
      adulteration: 5,
      flies: 4,
      eatery: 4,
    }
  },
  'Stray Animal Menace': {
    department: 'HEALTH',
    basePriority: 'Medium',
    exactPhrases: [
      { phrase: 'stray animal menace', weight: 18 },
      { phrase: 'stray dogs attacking', weight: 18 },
      { phrase: 'aggressive stray dogs', weight: 18 },
      { phrase: 'dog bite risk', weight: 16 },
      { phrase: 'stray cattle on road', weight: 15 },
      { phrase: 'monkey menace', weight: 15 },
      { phrase: 'rabies risk', weight: 16 },
    ],
    keywords: {
      stray: 6,
      dogs: 6,
      dog: 5,
      barking: 3,
      biting: 6,
      cattle: 5,
      cows: 4,
      monkeys: 5,
      rabies: 6,
    }
  },
  'Public Toilet Sanitation': {
    department: 'HEALTH',
    basePriority: 'Medium',
    exactPhrases: [
      { phrase: 'public toilet dirty', weight: 18 },
      { phrase: 'toilet not cleaned', weight: 16 },
      { phrase: 'choked public toilet', weight: 16 },
      { phrase: 'e-toilet locked', weight: 15 },
      { phrase: 'sulabh shauchalaya dirty', weight: 16 },
      { phrase: 'urinal broken', weight: 14 },
    ],
    keywords: {
      toilet: 7,
      urinal: 6,
      washroom: 6,
      lavatory: 5,
      shauchalaya: 6,
    }
  },

  // --- TRAFFIC & PARKING ---
  'Illegal Parking': {
    department: 'TRAFFIC',
    basePriority: 'Medium',
    exactPhrases: [
      { phrase: 'illegal parking', weight: 18 },
      { phrase: 'unauthorized parking', weight: 16 },
      { phrase: 'double parking', weight: 16 },
      { phrase: 'blocking driveway', weight: 14 },
      { phrase: 'blocking gate', weight: 14 },
      { phrase: 'parked on footpath', weight: 15 },
      { phrase: 'no parking zone violated', weight: 16 },
    ],
    keywords: {
      parking: 7,
      parked: 6,
      blocking: 5,
      encroaching: 4,
      tow: 4,
      vehicle: 4,
    }
  },
  'Signal Malfunction': {
    department: 'TRAFFIC',
    basePriority: 'High',
    exactPhrases: [
      { phrase: 'traffic signal not working', weight: 18 },
      { phrase: 'signal malfunction', weight: 18 },
      { phrase: 'traffic light broken', weight: 16 },
      { phrase: 'signal blinking amber', weight: 15 },
      { phrase: 'traffic signal stuck', weight: 16 },
      { phrase: 'pedestrian signal dark', weight: 14 },
    ],
    keywords: {
      signal: 7,
      signals: 7,
      junction: 5,
      crossroad: 4,
      blinking: 4,
      timer: 4,
    }
  },
  'Traffic Congestion': {
    department: 'TRAFFIC',
    basePriority: 'Medium',
    exactPhrases: [
      { phrase: 'traffic congestion', weight: 18 },
      { phrase: 'traffic jam', weight: 16 },
      { phrase: 'heavy bottleneck', weight: 14 },
      { phrase: 'unregulated traffic', weight: 14 },
      { phrase: 'auto stand blocking road', weight: 16 },
    ],
    keywords: {
      traffic: 6,
      congestion: 6,
      jam: 5,
      bottleneck: 5,
      chokepoint: 5,
      gridlock: 6,
    }
  },
  'Abandoned Vehicle': {
    department: 'TRAFFIC',
    basePriority: 'Low',
    exactPhrases: [
      { phrase: 'abandoned vehicle', weight: 18 },
      { phrase: 'abandoned car', weight: 18 },
      { phrase: 'rusted vehicle parked', weight: 15 },
      { phrase: 'scrap car on road', weight: 16 },
      { phrase: 'unclaimed scooter', weight: 14 },
    ],
    keywords: {
      abandoned: 8,
      unclaimed: 7,
      scrap: 5,
      rusted: 5,
    }
  },

  // --- PARKS & PUBLIC SPACES ---
  'Park Maintenance': {
    department: 'PARKS',
    basePriority: 'Low',
    exactPhrases: [
      { phrase: 'park maintenance', weight: 16 },
      { phrase: 'garden unkept', weight: 14 },
      { phrase: 'overgrown grass in park', weight: 15 },
      { phrase: 'park bench broken', weight: 14 },
      { phrase: 'jogging track damaged', weight: 14 },
      { phrase: 'sprinkler leaking', weight: 12 },
    ],
    keywords: {
      park: 6,
      garden: 6,
      lawn: 5,
      bench: 4,
      weeds: 4,
      grass: 4,
      jogging: 4,
    }
  },
  'Playground Damage': {
    department: 'PARKS',
    basePriority: 'Medium',
    exactPhrases: [
      { phrase: 'playground equipment broken', weight: 18 },
      { phrase: 'broken swing', weight: 16 },
      { phrase: 'slide broken', weight: 16 },
      { phrase: 'see saw damaged', weight: 15 },
      { phrase: 'children play area damaged', weight: 16 },
      { phrase: 'jhula toota hua', weight: 16 },
    ],
    keywords: {
      playground: 7,
      swing: 6,
      slide: 6,
      seesaw: 6,
      play: 4,
      equipment: 4,
    }
  },
  'Fallen Tree/Tree Trimming': {
    department: 'PARKS',
    basePriority: 'High',
    exactPhrases: [
      { phrase: 'fallen tree', weight: 18 },
      { phrase: 'tree branch fell', weight: 16 },
      { phrase: 'tree trimming needed', weight: 16 },
      { phrase: 'heavy branch leaning', weight: 15 },
      { phrase: 'tree blocking road', weight: 16 },
      { phrase: 'dangerous tree about to fall', weight: 18 },
    ],
    keywords: {
      tree: 7,
      trees: 7,
      branch: 6,
      branches: 6,
      trimming: 6,
      pruning: 5,
      fallen: 6,
      banyan: 4,
    }
  },
  'Public Space Encroachment': {
    department: 'PARKS',
    basePriority: 'Medium',
    exactPhrases: [
      { phrase: 'public space encroachment', weight: 18 },
      { phrase: 'illegal encroachment in park', weight: 18 },
      { phrase: 'hawkers blocking walkway', weight: 15 },
      { phrase: 'commercial stall in public garden', weight: 16 },
    ],
    keywords: {
      encroachment: 8,
      encroached: 7,
      hawkers: 5,
      shacks: 4,
      bamboo: 3,
    }
  },

  // --- OTHER MUNICIPAL SERVICES ---
  'General Complaint': {
    department: 'OTHER',
    basePriority: 'Low',
    exactPhrases: [
      { phrase: 'general complaint', weight: 10 },
      { phrase: 'civic problem', weight: 8 },
      { phrase: 'municipal office', weight: 8 },
      { phrase: 'citizen helpdesk', weight: 8 },
    ],
    keywords: {
      general: 4,
      miscellaneous: 4,
      inquiry: 3,
    }
  },
  'Noise Complaint': {
    department: 'OTHER',
    basePriority: 'Medium',
    exactPhrases: [
      { phrase: 'noise complaint', weight: 18 },
      { phrase: 'loud loudspeaker', weight: 16 },
      { phrase: 'industrial generator noise', weight: 18 },
      { phrase: 'loud music after 10 pm', weight: 16 },
      { phrase: 'noise pollution', weight: 16 },
      { phrase: 'silence zone violation', weight: 16 },
    ],
    keywords: {
      noise: 7,
      loud: 5,
      loudspeaker: 6,
      generator: 5,
      decibel: 5,
      dj: 4,
    }
  },
  'Documentation/Service Request': {
    department: 'OTHER',
    basePriority: 'Low',
    exactPhrases: [
      { phrase: 'birth certificate', weight: 16 },
      { phrase: 'death certificate', weight: 16 },
      { phrase: 'property tax receipt', weight: 16 },
      { phrase: 'trade license', weight: 16 },
      { phrase: 'portal kiosk not working', weight: 15 },
    ],
    keywords: {
      certificate: 7,
      tax: 5,
      portal: 5,
      kiosk: 5,
      license: 6,
      noc: 5,
      records: 4,
    }
  }
};
