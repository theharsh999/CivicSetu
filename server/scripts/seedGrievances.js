import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import Department from '../models/Department.js';
import User from '../models/User.js';
import Grievance from '../models/Grievance.js';
import { DEPARTMENTS, SLA_HOURS, PRIORITIES } from '../utils/constants.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/civicsetu';

// Mumbai center coordinates
const CITY_CENTER = { lat: 19.0760, lng: 72.8777 };

const WARDS = [
  'Ward 1 - Central',
  'Ward 2 - North',
  'Ward 3 - East',
  'Ward 4 - South',
  'Ward 5 - West',
  'Ward 6 - Metro',
  'Ward 7 - Suburbs',
  'Ward 8 - Industrial',
  'Ward 9 - Heritage',
];

const LOCALITIES = [
  { address: 'MG Road, near Regal Circle', ward: 'Ward 1 - Central', landmark: 'Opposite State Library' },
  { address: 'Station Road, Sector 3', ward: 'Ward 2 - North', landmark: 'Beside Railway Platform 1' },
  { address: 'Sunrise Highway Junction', ward: 'Ward 3 - East', landmark: 'Near Metro Pillar 42' },
  { address: 'Hillview Colony, 4th Cross', ward: 'Ward 4 - South', landmark: 'Near Municipal School No. 8' },
  { address: 'Old Bazaar Main Lane', ward: 'Ward 5 - West', landmark: 'Opposite Fish Market' },
  { address: 'Transit Hub Commercial Complex', ward: 'Ward 6 - Metro', landmark: 'Gate 2 Bus Terminal' },
  { address: 'Orchid Avenue, Sector 12', ward: 'Ward 7 - Suburbs', landmark: 'Near Community Park' },
  { address: 'MIDC Phase 2, Industrial Road 5', ward: 'Ward 8 - Industrial', landmark: 'Near Power Substation' },
  { address: 'Clock Tower Square', ward: 'Ward 9 - Heritage', landmark: 'Behind Town Hall' },
];

// Helper to generate jittered coords around city center (~6-8 km radius)
const getGeo = (index) => {
  const angle = (index * 2 * Math.PI) / 45;
  const radius = 0.02 + ((index % 7) * 0.008); // roughly 2 to 7 km
  return {
    lat: Number((CITY_CENTER.lat + radius * Math.cos(angle)).toFixed(6)),
    lng: Number((CITY_CENTER.lng + radius * Math.sin(angle)).toFixed(6)),
  };
};

// 45 Curated Grievances across all 9 departments
const GRIEVANCE_TEMPLATES = [
  // 1-5: ROADS
  {
    deptCode: 'ROADS',
    category: 'Pothole',
    priority: 'Critical',
    title: 'Hazardous deep pothole on MG Road near Metro Pillar 42',
    description: 'A large crater-like pothole measuring nearly 2 feet wide has formed following the recent rain. Multiple two-wheelers have skidded and suffered damages.',
    status: 'In Progress',
    overdue: true,
    daysAgo: 14,
  },
  {
    deptCode: 'ROADS',
    category: 'Damaged Road/Footpath',
    priority: 'Medium',
    title: 'Cracked and missing pedestrian sidewalk pavers near City Center',
    description: 'Broken concrete pavers on the primary pedestrian stretch to the bus terminus. Senior citizens and daily commuters are facing severe stumbling risks.',
    status: 'Assigned',
    overdue: false,
    daysAgo: 5,
  },
  {
    deptCode: 'ROADS',
    category: 'Road Construction Issue',
    priority: 'High',
    title: 'Unbarricaded open asphalt trench left after pipeline dig',
    description: 'Contractors excavated a 15-meter trench across the service road four days ago and abandoned it without warning cones, reflective tape, or bypass markers.',
    status: 'Escalated',
    overdue: true,
    daysAgo: 8,
  },
  {
    deptCode: 'ROADS',
    category: 'Broken Signage/Divider',
    priority: 'Low',
    title: 'Dislodged concrete road divider causing blind-spot hazard',
    description: 'A portion of the central lane separator was struck by a truck and sits displaced across the inner lane. Needs repositioning and reflective repaint.',
    status: 'Resolved',
    overdue: false,
    daysAgo: 22,
  },
  {
    deptCode: 'ROADS',
    category: 'Pothole',
    priority: 'High',
    title: 'Multiple contiguous potholes outside Zonal Hospital entrance',
    description: 'Ambulances and patients are facing jarring rides due to severe asphalt deterioration directly in front of the emergency admission driveway.',
    status: 'Closed',
    overdue: false,
    daysAgo: 35,
  },

  // 6-10: WATER
  {
    deptCode: 'WATER',
    category: 'Water Supply Disruption',
    priority: 'Critical',
    title: 'Complete tap water supply shutdown for four consecutive days',
    description: 'Over 300 residential households in Sector 4 have had zero municipal water supply since Tuesday morning. Residential overhead tanks are entirely dry.',
    status: 'In Progress',
    overdue: true,
    daysAgo: 6,
  },
  {
    deptCode: 'WATER',
    category: 'Contaminated Water',
    priority: 'High',
    title: 'Brown muddy tap water with foul smell in Ashoka Colony',
    description: 'Tap water is visibly yellowish-brown with high suspended silt. Suspected ingress of sewer seepage into the main feeder line.',
    status: 'Awaiting Verification',
    overdue: false,
    daysAgo: 4,
  },
  {
    deptCode: 'WATER',
    category: 'Pipeline Leakage',
    priority: 'High',
    title: 'High-pressure clean water pipeline burst flooding Station Road',
    description: 'Major valve crack spraying potable water 10 feet into the air. Huge amounts of treated drinking water are being wasted while street is waterlogged.',
    status: 'In Progress',
    overdue: false,
    daysAgo: 2,
  },
  {
    deptCode: 'WATER',
    category: 'Low Water Pressure',
    priority: 'Low',
    title: 'Extremely weak tap water pressure in 3rd floor tenements',
    description: 'Water pressure drops to a trickle during scheduled morning municipal supply hours, preventing rooftop header tanks from filling.',
    status: 'Submitted',
    overdue: false,
    daysAgo: 1,
  },
  {
    deptCode: 'WATER',
    category: 'Pipeline Leakage',
    priority: 'Medium',
    title: 'Underground feeder valve weeping under footpath near school',
    description: 'Perennial puddle forming from underground valve leak. Footpath earth is eroding and softening near children walkway.',
    status: 'Resolved',
    overdue: false,
    daysAgo: 18,
  },

  // 11-15: ELEC
  {
    deptCode: 'ELEC',
    category: 'Streetlight Not Working',
    priority: 'Medium',
    title: 'Series of 6 consecutive streetlights dark along transit corridor',
    description: 'Entire 200m stretch between Metro Gate 2 and Bus Depot is pitch black after 7 PM. Female commuters feel unsafe walking through this route.',
    status: 'Assigned',
    overdue: false,
    daysAgo: 3,
  },
  {
    deptCode: 'ELEC',
    category: 'Exposed/Fallen Wire',
    priority: 'Critical',
    title: 'Dangling live 440V overhead cable touching metal boundary fence',
    description: 'Storm wind snapped an overhead service line which is now hanging 4 feet above pavement level, sparking intermittently against the iron railing.',
    status: 'In Progress',
    overdue: false,
    daysAgo: 1,
  },
  {
    deptCode: 'ELEC',
    category: 'Power Outage',
    priority: 'High',
    title: 'Frequent unannounced voltage spikes and feeder tripping in Ward 6',
    description: 'Commercial establishments experiencing 8 to 10 voltage drops daily. Electronic appliances and computer systems damaged.',
    status: 'Escalated',
    overdue: true,
    daysAgo: 9,
  },
  {
    deptCode: 'ELEC',
    category: 'Streetlight Not Working',
    priority: 'Low',
    title: 'Streetlamp timer misconfigured, shining in daytime and off at night',
    description: 'Automatic photocell sensor is stuck on. Light stays lit throughout bright sunlight but fails to trigger after sunset.',
    status: 'Resolved',
    overdue: false,
    daysAgo: 25,
  },
  {
    deptCode: 'ELEC',
    category: 'Exposed/Fallen Wire',
    priority: 'Critical',
    title: 'Substation junction box left wide open near children play area',
    description: 'High-voltage feeder distribution kiosk lock is vandalized. Live copper busbars are within reach of passersby.',
    status: 'Closed',
    overdue: false,
    daysAgo: 40,
  },

  // 16-20: WASTE
  {
    deptCode: 'WASTE',
    category: 'Overflowing Bin',
    priority: 'High',
    title: 'Overflowing community dumper bin spilling onto vegetable market',
    description: 'Primary green waste bin has not been cleared for 5 days. Rotting vegetable matter spilling across road with stray animals scattering trash.',
    status: 'In Progress',
    overdue: true,
    daysAgo: 7,
  },
  {
    deptCode: 'WASTE',
    category: 'Garbage Collection',
    priority: 'Medium',
    title: 'Daily door-to-door waste compactor truck skipped Sector 7 colony',
    description: 'Residents have kept segregated wet and dry bins on kerb for 3 days without collection vehicle arriving. Smells developing.',
    status: 'Assigned',
    overdue: false,
    daysAgo: 2,
  },
  {
    deptCode: 'WASTE',
    category: 'Illegal Dumping',
    priority: 'High',
    title: 'Nightly illegal dumping of commercial renovation debris along creek',
    description: 'Unidentified tipper trucks unloading plaster, broken tiles, and drywall directly into protected mangrove creek boundary.',
    status: 'Awaiting Verification',
    overdue: false,
    daysAgo: 5,
  },
  {
    deptCode: 'WASTE',
    category: 'Dead Animal Removal',
    priority: 'Critical',
    title: 'Carcass of stray bull lying near highway service road',
    description: 'Dead animal carcass lying beside pedestrian pathway for over 24 hours. Pungent odor and public health concern.',
    status: 'Resolved',
    overdue: false,
    daysAgo: 15,
  },
  {
    deptCode: 'WASTE',
    category: 'Garbage Collection',
    priority: 'Low',
    title: 'Request for secondary waste bin placement near weekly market',
    description: 'Current single 240L bin is grossly inadequate on market days (Thursdays). Requesting installation of secondary twin bin.',
    status: 'Submitted',
    overdue: false,
    daysAgo: 1,
  },

  // 21-25: DRAIN
  {
    deptCode: 'DRAIN',
    category: 'Drain Blockage',
    priority: 'High',
    title: 'Solid plastic and silt choked stormwater drain causing backflow',
    description: 'Underground roadside culvert is clogged with plastic bottles and road gravel. Minor rain leads to immediate knee-deep runoff on road.',
    status: 'In Progress',
    overdue: false,
    daysAgo: 3,
  },
  {
    deptCode: 'DRAIN',
    category: 'Open Manhole',
    priority: 'Critical',
    title: 'Uncovered sewer manhole without lid on busy residential lane',
    description: 'Cast iron cover is missing completely. A tree branch was pushed in by locals as makeshift warning, but it is dangerously invisible in the dark.',
    status: 'Escalated',
    overdue: true,
    daysAgo: 4,
  },
  {
    deptCode: 'DRAIN',
    category: 'Waterlogging',
    priority: 'High',
    title: 'Persistent 1-foot waterlogging under railway subway',
    description: 'Subway stormwater pump is non-functional. Stagnant water prevents two-wheeler transit, forcing a 4 km detour.',
    status: 'Assigned',
    overdue: false,
    daysAgo: 2,
  },
  {
    deptCode: 'DRAIN',
    category: 'Sewage Overflow',
    priority: 'High',
    title: 'Raw untreated sewage bubbling out of chamber onto Society Gate',
    description: 'Main drainage line is choked downstream. Foul grey sewage is spreading across residential entryway.',
    status: 'Resolved',
    overdue: false,
    daysAgo: 12,
  },
  {
    deptCode: 'DRAIN',
    category: 'Drain Blockage',
    priority: 'Low',
    title: 'Accumulated fallen dry leaves obstructing storm grate openings',
    description: 'Pre-monsoon cleaning needed for grating covers along jogger boulevard before upcoming showers.',
    status: 'Closed',
    overdue: false,
    daysAgo: 45,
  },

  // 26-30: HEALTH
  {
    deptCode: 'HEALTH',
    category: 'Mosquito/Pest Breeding',
    priority: 'High',
    title: 'Extensive mosquito larvae in waterlogged basement of vacant plot',
    description: 'Abandoned construction pit has 3 feet of stagnant rainwater for past 4 weeks. High incidence of dengue and malaria in adjoining towers.',
    status: 'In Progress',
    overdue: true,
    daysAgo: 10,
  },
  {
    deptCode: 'HEALTH',
    category: 'Public Toilet Sanitation',
    priority: 'High',
    title: 'Municipal e-toilet block locked and uncleaned near bus stand',
    description: 'Automated pay toilet has no running water and choked pan. Commuters are forced to defecate in open behind structure.',
    status: 'Assigned',
    overdue: false,
    daysAgo: 3,
  },
  {
    deptCode: 'HEALTH',
    category: 'Stray Animal Menace',
    priority: 'Medium',
    title: 'Pack of aggressive stray dogs chasing cyclists near park exit',
    description: 'Six stray canines showing aggressive behavior during evening hours. Requesting animal birth control and anti-rabies drive.',
    status: 'Awaiting Verification',
    overdue: false,
    daysAgo: 4,
  },
  {
    deptCode: 'HEALTH',
    category: 'Unhygienic Food Vendor',
    priority: 'Low',
    title: 'Roadside cart washing utensils with untreated stagnant drain water',
    description: 'Fast food cart operating without food license near college gate. Unhygienic practices observed by multiple students.',
    status: 'Resolved',
    overdue: false,
    daysAgo: 20,
  },
  {
    deptCode: 'HEALTH',
    category: 'Mosquito/Pest Breeding',
    priority: 'Medium',
    title: 'Request for anti-larval chemical fogging in Ward 3 societies',
    description: 'Requesting scheduled malathion fogging in response to recent spike in seasonal viral fever cases.',
    status: 'Submitted',
    overdue: false,
    daysAgo: 2,
  },

  // 31-35: TRAFFIC
  {
    deptCode: 'TRAFFIC',
    category: 'Illegal Parking',
    priority: 'Medium',
    title: 'Double-row parking of logistics vans on narrow two-way street',
    description: 'Courier delivery vans park permanently on both kerbs of 30ft road, reducing motorable space to single lane and halting city buses.',
    status: 'In Progress',
    overdue: false,
    daysAgo: 4,
  },
  {
    deptCode: 'TRAFFIC',
    category: 'Signal Malfunction',
    priority: 'Critical',
    title: 'Traffic lights blinking erratic amber on busy 4-way crossroad',
    description: 'Timer circuit is stuck. Vehicles from all four arterial directions are converging simultaneously, causing near collisions every hour.',
    status: 'In Progress',
    overdue: true,
    daysAgo: 3,
  },
  {
    deptCode: 'TRAFFIC',
    category: 'Abandoned Vehicle',
    priority: 'Low',
    title: 'Rusted accident car abandoned in public parking slot for 8 months',
    description: 'Damaged hatchback with shattered glass and missing tires is occupying premium municipal slot. Harboring dust and vermin.',
    status: 'Assigned',
    overdue: false,
    daysAgo: 6,
  },
  {
    deptCode: 'TRAFFIC',
    category: 'Traffic Congestion',
    priority: 'High',
    title: 'Auto-rickshaw stand unauthorized expansion encroaching main lane',
    description: 'Three-wheelers queueing four abreast outside suburban station, blocking turning radius for emergency vehicles.',
    status: 'Resolved',
    overdue: false,
    daysAgo: 16,
  },
  {
    deptCode: 'TRAFFIC',
    category: 'Signal Malfunction',
    priority: 'Medium',
    title: 'Pedestrian crossing countdown timer display board dead',
    description: 'Green man signal is dark, preventing visually impaired and school students from judging safe crossing interval.',
    status: 'Closed',
    overdue: false,
    daysAgo: 28,
  },

  // 36-40: PARKS
  {
    deptCode: 'PARKS',
    category: 'Playground Damage',
    priority: 'High',
    title: 'Snapped metal swing chain and broken slide ladder in Ward 7 park',
    description: 'Children playground slide has sharp rusted sheet metal edges and missing handrails. Child suffered minor laceration yesterday.',
    status: 'In Progress',
    overdue: false,
    daysAgo: 5,
  },
  {
    deptCode: 'PARKS',
    category: 'Fallen Tree/Tree Trimming',
    priority: 'Critical',
    title: 'Heavy banyan branch splintered and leaning over power lines',
    description: 'Massive trunk branch cracked during afternoon thunderstorm. Directly resting on residential supply cable and could snap anytime.',
    status: 'Escalated',
    overdue: true,
    daysAgo: 4,
  },
  {
    deptCode: 'PARKS',
    category: 'Public Space Encroachment',
    priority: 'Medium',
    title: 'Commercial nursery encroaching outer walkway of public garden',
    description: 'Private plant vendor has placed hundreds of clay pots and bamboo sheds on public jogger trail, obstructing free access.',
    status: 'Assigned',
    overdue: false,
    daysAgo: 3,
  },
  {
    deptCode: 'PARKS',
    category: 'Park Maintenance',
    priority: 'Low',
    title: 'Lawn sprinklers leaking and turning central garden into bog',
    description: 'Automated underground sprinkler valve is jammed open. Water is overflowing onto walking track and wasting municipal supply.',
    status: 'Resolved',
    overdue: false,
    daysAgo: 24,
  },
  {
    deptCode: 'PARKS',
    category: 'Playground Damage',
    priority: 'Medium',
    title: 'Damaged perimeter iron gate allows stray cattle inside flowerbeds',
    description: 'Wrought iron entrance gate hinge has fallen off. Goats and stray cows regularly destroy landscaped floral displays.',
    status: 'Closed',
    overdue: false,
    daysAgo: 50,
  },

  // 41-45: OTHER
  {
    deptCode: 'OTHER',
    category: 'Noise Complaint',
    priority: 'Medium',
    title: 'Industrial diesel generator running unshielded past 11 PM',
    description: 'Commercial fabrication workshop operating heavy power generators in residential silence zone near hospital at midnight.',
    status: 'In Progress',
    overdue: false,
    daysAgo: 2,
  },
  {
    deptCode: 'OTHER',
    category: 'Documentation/Service Request',
    priority: 'Low',
    title: 'Civic citizen facilitation center portal kiosk display not booting',
    description: 'Self-help computer terminal for property tax and birth certificates at Zonal ward office has frozen blue screen.',
    status: 'Submitted',
    overdue: false,
    daysAgo: 1,
  },
  {
    deptCode: 'OTHER',
    category: 'General Complaint',
    priority: 'High',
    title: 'Vandalized public drinking water fountain outside bus terminus',
    description: 'Stainless steel tap faucets have been wrenched off and stolen. Main pipe is spraying water across waiting shelter.',
    status: 'Assigned',
    overdue: false,
    daysAgo: 4,
  },
  {
    deptCode: 'OTHER',
    category: 'Noise Complaint',
    priority: 'Low',
    title: 'Unlicensed megaphone advertising blaring throughout work hours',
    description: 'Street advertising vehicle parking for hours outside residential apartments playing repetitive recorded promotions.',
    status: 'Resolved',
    overdue: false,
    daysAgo: 19,
  },
  {
    deptCode: 'OTHER',
    category: 'General Complaint',
    priority: 'Medium',
    title: 'Broken marble plaque at historic municipal heritage fountain',
    description: 'Commemorative historical marker was defaced and cracked. Needs restoration by civic conservation committee.',
    status: 'Closed',
    overdue: false,
    daysAgo: 55,
  },
];

const seedGrievances = async () => {
  try {
    console.log(`\n======================================================`);
    console.log(`🌱 CivicSetu: Seeding 45 Realistic Grievance Lifecycle Records`);
    console.log(`📡 Connecting to MongoDB at: ${MONGO_URI}`);
    console.log(`======================================================\n`);

    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB.');

    // 1. Fetch departments, officers, and citizens from DB
    const departments = await Department.find({});
    const officers = await User.find({ role: 'officer' });
    const citizens = await User.find({ role: 'citizen' });

    if (departments.length === 0 || officers.length === 0 || citizens.length === 0) {
      console.error('❌ Missing core directory data. Please run `npm run seed` first to populate departments and users.');
      process.exit(1);
    }

    const deptMap = {};
    departments.forEach((d) => {
      deptMap[d.code] = d;
    });

    const officersByDept = {};
    officers.forEach((off) => {
      const deptCode = departments.find((d) => d._id.toString() === off.department?.toString())?.code;
      if (deptCode) {
        if (!officersByDept[deptCode]) officersByDept[deptCode] = [];
        officersByDept[deptCode].push(off);
      }
    });

    // 2. Clear existing grievances (idempotent)
    console.log('🧹 Clearing existing Grievance records...');
    await Grievance.deleteMany({});
    console.log('✅ Grievance collection cleared.');

    // 3. Generate 45 realistic grievances
    console.log('📝 Generating 45 realistic municipal grievances with coherent audit trails...');
    const currentYear = new Date().getFullYear();
    const grievanceDocs = [];

    for (let i = 0; i < GRIEVANCE_TEMPLATES.length; i++) {
      const t = GRIEVANCE_TEMPLATES[i];
      const trackingId = `GRV-${currentYear}-${String(i + 1).padStart(6, '0')}`;

      const dept = deptMap[t.deptCode] || departments[0];
      const availableOfficers = officersByDept[t.deptCode] || officers;
      const assignedOfficer = availableOfficers[i % availableOfficers.length];
      const citizen = citizens[i % citizens.length];
      const locality = LOCALITIES[i % LOCALITIES.length];
      const geo = getGeo(i);

      // SLA Target calculation
      const hoursAllowed = SLA_HOURS[t.priority] || 96;
      const createdAt = new Date(Date.now() - t.daysAgo * 24 * 60 * 60 * 1000);
      
      let dueAt;
      if (t.overdue) {
        // Force dueAt in past so overdue indicator is triggered
        dueAt = new Date(createdAt.getTime() + (hoursAllowed * 3600 * 1000));
      } else {
        dueAt = new Date(createdAt.getTime() + (hoursAllowed * 3600 * 1000));
      }

      // Build coherent timeline based on status
      const timeline = [];
      const t0 = new Date(createdAt.getTime());
      timeline.push({
        status: 'Submitted',
        title: 'Grievance Lodged by Citizen',
        note: 'Citizen submitted grievance via portal with localized street details.',
        actor: citizen._id,
        actorRole: 'citizen',
        isInternal: false,
        createdAt: t0,
      });

      if (t.status !== 'Submitted') {
        const t1 = new Date(t0.getTime() + 15 * 60 * 1000); // 15 mins later
        timeline.push({
          status: 'Assigned',
          title: `Routed to ${dept.name}`,
          note: `Auto-routed to ${dept.name} (${dept.code}) based on category "${t.category}".`,
          actor: null,
          actorRole: 'system',
          isInternal: false,
          createdAt: t1,
        });

        const t2 = new Date(t1.getTime() + 10 * 60 * 1000); // 10 mins later
        timeline.push({
          status: 'Assigned',
          title: 'Assigned to Ward Nodal Officer',
          note: `Assigned to ${assignedOfficer.name} (${assignedOfficer.designation || 'Field Officer'}).`,
          actor: null,
          actorRole: 'system',
          isInternal: false,
          createdAt: t2,
        });
      }

      if (['In Progress', 'Awaiting Verification', 'Resolved', 'Closed', 'Escalated'].includes(t.status)) {
        const t3 = new Date(t0.getTime() + 4 * 3600 * 1000); // 4 hours later
        timeline.push({
          status: 'In Progress',
          title: 'Field Investigation Initiated',
          note: 'Work squad dispatched for physical site inspection and equipment mobilization.',
          actor: assignedOfficer._id,
          actorRole: 'officer',
          isInternal: false,
          createdAt: t3,
        });
      }

      if (t.status === 'Awaiting Verification') {
        const t4 = new Date(t0.getTime() + 24 * 3600 * 1000);
        timeline.push({
          status: 'Awaiting Verification',
          title: 'Field Resolution Submitted for Verification',
          note: 'Repair completed on ground. Field inspector submitted completion checklist.',
          actor: assignedOfficer._id,
          actorRole: 'officer',
          isInternal: false,
          createdAt: t4,
        });
      }

      let resolution = {
        summary: '',
        proofImages: [],
        resolvedBy: null,
        resolvedAt: null,
      };

      if (['Resolved', 'Closed'].includes(t.status)) {
        const resolvedAt = new Date(createdAt.getTime() + Math.min(hoursAllowed * 0.7, 36) * 3600 * 1000);
        resolution = {
          summary: `Site rectification executed by ${dept.name} ward crew. Issue redressed and inspected per municipal standards.`,
          proofImages: [
            'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f9?w=600&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1590402494682-cd3fb53b1f70?w=600&auto=format&fit=crop&q=80',
          ],
          resolvedBy: assignedOfficer._id,
          resolvedAt,
        };

        timeline.push({
          status: 'Resolved',
          title: 'Grievance Marked as Resolved',
          note: resolution.summary,
          actor: assignedOfficer._id,
          actorRole: 'officer',
          isInternal: false,
          createdAt: resolvedAt,
        });

        if (t.status === 'Closed') {
          const closedAt = new Date(resolvedAt.getTime() + 12 * 3600 * 1000);
          timeline.push({
            status: 'Closed',
            title: 'Grievance Officially Closed',
            note: 'Citizen confirmed resolution quality and accepted ticket closure.',
            actor: citizen._id,
            actorRole: 'citizen',
            isInternal: false,
            createdAt: closedAt,
          });
        }
      }

      if (t.status === 'Escalated') {
        const escalatedAt = new Date(createdAt.getTime() + (hoursAllowed + 4) * 3600 * 1000);
        timeline.push({
          status: 'Escalated',
          title: 'Grievance Escalated (SLA Alert)',
          note: `SLA window (${hoursAllowed} hours) exceeded without resolution. Escalated to Zonal Commissioner.`,
          actor: null,
          actorRole: 'system',
          isInternal: false,
          createdAt: escalatedAt,
        });
      }

      // Add a realistic sample internal remark for some grievances
      const remarks = [];
      if (i % 3 === 0) {
        remarks.push({
          author: assignedOfficer._id,
          text: 'Coordinated with zonal inventory for required replacement parts and bitumen mix.',
          isInternal: true,
          createdAt: new Date(createdAt.getTime() + 2 * 3600 * 1000),
        });
      }

      // Attachments (sample mock civic photos)
      const attachments = [];
      if (i % 2 === 0) {
        attachments.push({
          url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80',
          filename: `evidence_${t.category.toLowerCase().replace(/[^a-z0-9]/g, '_')}_1.jpg`,
          mimetype: 'image/jpeg',
          size: 1420500,
          uploadedBy: citizen._id,
        });
      }

      grievanceDocs.push({
        trackingId,
        title: t.title,
        description: t.description,
        citizen: citizen._id,
        category: t.category,
        department: dept._id,
        categorySource: 'citizen',
        priority: t.priority,
        status: t.status,
        location: {
          address: locality.address,
          ward: locality.ward,
          landmark: locality.landmark,
          coordinates: geo,
        },
        attachments,
        assignedOfficer: t.status === 'Submitted' ? null : assignedOfficer._id,
        timeline,
        remarks,
        sla: {
          dueAt,
          breached: Boolean(t.overdue || t.status === 'Escalated'),
          escalationLevel: t.status === 'Escalated' ? 1 : 0,
          escalatedAt: t.status === 'Escalated' ? new Date(createdAt.getTime() + 30 * 3600 * 1000) : null,
        },
        resolution,
        feedback: t.status === 'Closed' ? { rating: 5, comment: 'Quickly fixed, thank you ward team!', submittedAt: new Date() } : {},
        createdAt,
        updatedAt: new Date(createdAt.getTime() + 24 * 3600 * 1000),
      });
    }

    await Grievance.insertMany(grievanceDocs);
    console.log(`✅ Successfully seeded ${grievanceDocs.length} realistic grievances across all 9 departments!`);

    // Status breakdown printout
    const statusCounts = {};
    grievanceDocs.forEach((g) => {
      statusCounts[g.status] = (statusCounts[g.status] || 0) + 1;
    });

    console.log(`\n======================================================`);
    console.log(`📊 SEEDED GRIEVANCE STATUS DISTRIBUTION`);
    console.log(`======================================================`);
    console.table(
      Object.entries(statusCounts).map(([status, count]) => ({
        Status: status,
        Count: count,
      }))
    );

    console.log(`\n======================================================`);
    console.log(`🎉 Grievance seeding complete! Platform ready for Prompt 4`);
    console.log(`======================================================\n`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Grievance Seeder Error:', error);
    process.exit(1);
  }
};

seedGrievances();
