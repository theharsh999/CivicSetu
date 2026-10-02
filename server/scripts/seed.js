import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { Department } from '../models/Department.js';
import { User } from '../models/User.js';
import { DEPARTMENTS, ROLES } from '../utils/constants.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/civicsetu';

const seedDatabase = async () => {
  try {
    console.log(`\n======================================================`);
    console.log(`🌱 CivicSetu Seeder: Initializing Municipal Directory`);
    console.log(`📡 Connecting to MongoDB at: ${MONGO_URI}`);
    console.log(`======================================================\n`);

    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB.');

    // 1. Clear existing departments and users (idempotent)
    console.log('🧹 Clearing existing Users and Departments...');
    await User.deleteMany({});
    await Department.deleteMany({});
    console.log('✅ Cleared old records.');

    // 2. Seed all 9 Departments from constants
    console.log('🏛️  Seeding Municipal Departments...');
    const departmentDocs = await Department.insertMany(
      DEPARTMENTS.map((dept) => ({
        name: dept.name,
        code: dept.code,
        icon: dept.icon,
        color: dept.color,
        description: `Responsible for civic issues relating to ${dept.name.toLowerCase()} across CivicSetu Municipal Corporation.`,
        isActive: true,
      }))
    );

    const deptMap = {};
    departmentDocs.forEach((d) => {
      deptMap[d.code] = d;
    });
    console.log(`✅ Seeded ${departmentDocs.length} departments.`);

    // 3. Seed 1 Admin User
    console.log('👤 Seeding System Administrator...');
    const adminUser = await User.create({
      name: 'Dr. Neha Patel',
      email: 'admin@civicsetu.gov.in',
      password: 'Admin@123',
      role: ROLES.ADMIN,
      phone: '+91 98201 12345',
      address: 'Municipal Corporation HQ, Central Civic Complex',
      ward: 'Ward 1 - Central',
      designation: 'Municipal Commissioner & CEO',
      isActive: true,
    });

    // 4. Seed 2 Officers per Department (18 Officers total)
    console.log('👷 Seeding Department Nodal Officers (2 per department)...');
    const officerData = [
      // ROADS
      {
        name: 'Er. Rajesh Verma',
        code: 'ROADS',
        email: 'roads.officer1@civicsetu.gov.in',
        designation: 'Executive Engineer (Roads & Highways)',
        ward: 'Ward 2 - North',
        phone: '+91 98202 11001',
      },
      {
        name: 'Anjali Sharma',
        code: 'ROADS',
        email: 'roads.officer2@civicsetu.gov.in',
        designation: 'Assistant Ward Inspector (Pavements)',
        ward: 'Ward 3 - East',
        phone: '+91 98202 11002',
      },
      // WATER
      {
        name: 'Suresh Menon',
        code: 'WATER',
        email: 'water.officer1@civicsetu.gov.in',
        designation: 'Superintending Hydro-Engineer',
        ward: 'Ward 4 - South',
        phone: '+91 98202 22001',
      },
      {
        name: 'Pooja Kulkarni',
        code: 'WATER',
        email: 'water.officer2@civicsetu.gov.in',
        designation: 'Pipeline Maintenance Officer',
        ward: 'Ward 5 - West',
        phone: '+91 98202 22002',
      },
      // ELEC
      {
        name: 'Vikramaditya Rao',
        code: 'ELEC',
        email: 'elec.officer1@civicsetu.gov.in',
        designation: 'Chief Grid Inspector (Lighting)',
        ward: 'Ward 1 - Central',
        phone: '+91 98202 33001',
      },
      {
        name: 'Priyanka Sen',
        code: 'ELEC',
        email: 'elec.officer2@civicsetu.gov.in',
        designation: 'Assistant Lighting Supervisor',
        ward: 'Ward 6 - Metro',
        phone: '+91 98202 33002',
      },
      // WASTE
      {
        name: 'Rameshwar Yadav',
        code: 'WASTE',
        email: 'waste.officer1@civicsetu.gov.in',
        designation: 'Sanitation Chief Supervisor',
        ward: 'Ward 7 - Suburbs',
        phone: '+91 98202 44001',
      },
      {
        name: 'Kavita Iyer',
        code: 'WASTE',
        email: 'waste.officer2@civicsetu.gov.in',
        designation: 'Waste Segregation Ward Officer',
        ward: 'Ward 8 - Industrial',
        phone: '+91 98202 44002',
      },
      // DRAIN
      {
        name: 'Mohammad Tariq',
        code: 'DRAIN',
        email: 'drain.officer1@civicsetu.gov.in',
        designation: 'Senior Sewerage Network Engineer',
        ward: 'Ward 2 - North',
        phone: '+91 98202 55001',
      },
      {
        name: 'Sunita Deshmukh',
        code: 'DRAIN',
        email: 'drain.officer2@civicsetu.gov.in',
        designation: 'Drainage Field Inspector',
        ward: 'Ward 4 - South',
        phone: '+91 98202 55002',
      },
      // HEALTH
      {
        name: 'Dr. Arvind Swaminathan',
        code: 'HEALTH',
        email: 'health.officer1@civicsetu.gov.in',
        designation: 'Chief Medical Health Officer',
        ward: 'Ward 1 - Central',
        phone: '+91 98202 66001',
      },
      {
        name: 'Meena Roy',
        code: 'HEALTH',
        email: 'health.officer2@civicsetu.gov.in',
        designation: 'Vector & Pest Control Inspector',
        ward: 'Ward 3 - East',
        phone: '+91 98202 66002',
      },
      // TRAFFIC
      {
        name: 'Inspector Gurpreet Singh',
        code: 'TRAFFIC',
        email: 'traffic.officer1@civicsetu.gov.in',
        designation: 'Traffic Marshall & Enforcement Head',
        ward: 'Ward 6 - Metro',
        phone: '+91 98202 77001',
      },
      {
        name: 'Deepak Joshi',
        code: 'TRAFFIC',
        email: 'traffic.officer2@civicsetu.gov.in',
        designation: 'Parking & Signage Compliance Officer',
        ward: 'Ward 5 - West',
        phone: '+91 98202 77002',
      },
      // PARKS
      {
        name: 'Alok Ranjan',
        code: 'PARKS',
        email: 'parks.officer1@civicsetu.gov.in',
        designation: 'Horticulture & Urban Forestry Officer',
        ward: 'Ward 7 - Suburbs',
        phone: '+91 98202 88001',
      },
      {
        name: 'Shweta Nair',
        code: 'PARKS',
        email: 'parks.officer2@civicsetu.gov.in',
        designation: 'Public Playground Safety Officer',
        ward: 'Ward 3 - East',
        phone: '+91 98202 88002',
      },
      // OTHER
      {
        name: 'Bhaskar Bannerjee',
        code: 'OTHER',
        email: 'other.officer1@civicsetu.gov.in',
        designation: 'Public Grievance Liaison Officer',
        ward: 'Ward 1 - Central',
        phone: '+91 98202 99001',
      },
      {
        name: 'Farida Khan',
        code: 'OTHER',
        email: 'other.officer2@civicsetu.gov.in',
        designation: 'Civic Helpdesk Ombudsman',
        ward: 'Ward 8 - Industrial',
        phone: '+91 98202 99002',
      },
      // Third Officers for high-load departments
      {
        name: 'Kavita Joshi',
        code: 'ROADS',
        email: 'roads.officer3@civicsetu.gov.in',
        designation: 'Senior Asphalt Maintenance Inspector',
        ward: 'Ward 3 - East',
        phone: '+91 98202 11003',
      },
      {
        name: 'Gaurav Kulkarni',
        code: 'WATER',
        email: 'water.officer3@civicsetu.gov.in',
        designation: 'Hydro Distribution & Pressure Specialist',
        ward: 'Ward 4 - South',
        phone: '+91 98202 22003',
      },
      {
        name: 'Sunita Deshmukh',
        code: 'WASTE',
        email: 'waste.officer3@civicsetu.gov.in',
        designation: 'Zonal Compost & Waste Marshall',
        ward: 'Ward 2 - North',
        phone: '+91 98202 44003',
      },
    ];

    const officerDocs = [];
    for (const off of officerData) {
      const dept = deptMap[off.code];
      const user = await User.create({
        name: off.name,
        email: off.email,
        password: 'Officer@123',
        role: ROLES.OFFICER,
        phone: off.phone,
        department: dept._id,
        designation: off.designation,
        ward: off.ward,
        address: `Zonal Office, ${dept.name}, ${off.ward}`,
        isActive: true,
      });
      officerDocs.push(user);
    }
    console.log(`✅ Seeded ${officerDocs.length} municipal officers (2-3 per department).`);

    // 5. Seed 12 Realistic Demo Citizens
    console.log('👥 Seeding 12 Demo Citizens...');
    const citizenData = [
      { name: 'Aarav Sharma', email: 'citizen1@example.com', ward: 'Ward 1 - Central', address: '42 MG Road, Heritage Quarter', phone: '+91 98111 00001' },
      { name: 'Diya Mukherjee', email: 'citizen2@example.com', ward: 'Ward 2 - North', address: '18 Lakeview Enclave, Sector 4', phone: '+91 98111 00002' },
      { name: 'Kabir Singhania', email: 'citizen3@example.com', ward: 'Ward 3 - East', address: '104 Sunrise Residency, Bypass Rd', phone: '+91 98111 00003' },
      { name: 'Ananya Pillai', email: 'citizen4@example.com', ward: 'Ward 4 - South', address: '7 Green Valley Apartments, Hillview', phone: '+91 98111 00004' },
      { name: 'Rohan Mehra', email: 'citizen5@example.com', ward: 'Ward 5 - West', address: '55 Ashoka Colony, Old City', phone: '+91 98111 00005' },
      { name: 'Tanvi Agarwal', email: 'citizen6@example.com', ward: 'Ward 6 - Metro', address: '12 Transit Tower, Commercial Hub', phone: '+91 98111 00006' },
      { name: 'Vivek Chawla', email: 'citizen7@example.com', ward: 'Ward 7 - Suburbs', address: '88 Orchid Lane, North Expy', phone: '+91 98111 00007' },
      { name: 'Sneha Nambiar', email: 'citizen8@example.com', ward: 'Ward 8 - Industrial', address: '201 Factory Road, MIDC Phase 2', phone: '+91 98111 00008' },
      { name: 'Priya Deshmukh', email: 'citizen9@example.com', ward: 'Ward 9 - Heritage', address: '14 Fort Lane, Clock Tower Square', phone: '+91 98111 00009' },
      { name: 'Kunal Verma', email: 'citizen10@example.com', ward: 'Ward 1 - Central', address: '302 Regal Avenue, Marine Boulevard', phone: '+91 98111 00010' },
      { name: 'Meera Joshi', email: 'citizen11@example.com', ward: 'Ward 2 - North', address: '76 Gulmohar Heights, Sector 8', phone: '+91 98111 00011' },
      { name: 'Sanjay Kulkarni', email: 'citizen12@example.com', ward: 'Ward 3 - East', address: '19 Riverfront Colony, Bypass Road', phone: '+91 98111 00012' },
    ];

    const citizenDocs = [];
    for (const cit of citizenData) {
      const user = await User.create({
        name: cit.name,
        email: cit.email,
        password: 'Citizen@123',
        role: ROLES.CITIZEN,
        phone: cit.phone,
        ward: cit.ward,
        address: cit.address,
        isActive: true,
      });
      citizenDocs.push(user);
    }
    console.log(`✅ Seeded ${citizenDocs.length} citizens.`);

    // 6. Print Seed Credentials Table
    console.log(`\n======================================================`);
    console.log(`📋 CIVICSETU MUNICIPAL CORPORATION — DEMO CREDENTIALS`);
    console.log(`======================================================`);

    const credentialsTable = [
      {
        Role: 'ADMIN',
        Name: adminUser.name,
        Email: adminUser.email,
        Password: 'Admin@123',
        Dept_or_Designation: adminUser.designation,
      },
      ...officerData.slice(0, 4).map((off) => ({
        Role: 'OFFICER',
        Name: off.name,
        Email: off.email,
        Password: 'Officer@123',
        Dept_or_Designation: `${off.code}: ${off.designation}`,
      })),
      {
        Role: 'OFFICER (Note)',
        Name: '...and 14 more officers',
        Email: '[dept].officer[1|2]@civicsetu.gov.in',
        Password: 'Officer@123',
        Dept_or_Designation: 'All 9 Departments (ROADS, WATER, ELEC, etc.)',
      },
      ...citizenData.slice(0, 3).map((cit) => ({
        Role: 'CITIZEN',
        Name: cit.name,
        Email: cit.email,
        Password: 'Citizen@123',
        Dept_or_Designation: cit.ward,
      })),
      {
        Role: 'CITIZEN (Note)',
        Name: '...and 5 more citizens',
        Email: 'citizen[4-8]@example.com',
        Password: 'Citizen@123',
        Dept_or_Designation: 'Wards 4 through 8',
      },
    ];

    console.table(credentialsTable);

    console.log(`\n======================================================`);
    console.log(`🎉 Database seeding successfully finished!`);
    console.log(`======================================================\n`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeder Error:', error);
    process.exit(1);
  }
};

seedDatabase();
