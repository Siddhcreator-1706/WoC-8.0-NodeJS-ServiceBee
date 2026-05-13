/**
 * Seed Script — Adds demo services, providers, companies, and an admin to the database.
 *
 * Usage:  node seed/seed.js
 *   or:   npm run seed --prefix backend
 *
 * • If a user/company/service already exists (matched by email or name+company), it is SKIPPED.
 * • Safe to run multiple times — idempotent.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const User = require('../models/User');
const Company = require('../models/Company');
const Service = require('../models/Service');

// ──────────────────────────── Seed Data ────────────────────────────

const ADMIN = {
    name: 'Super Admin',
    email: 'admin@servicebee.com',
    password: 'adminpassword123',
    role: 'admin',
    phone: '+91 9000000000',
    city: 'Mumbai',
    state: 'Maharashtra'
};

const PROVIDERS = [
    {
        user: {
            name: 'Rajesh Kumar',
            email: 'rajesh@servicebee.com',
            password: 'provider123',
            role: 'provider',
            phone: '+91 9876543210',
            city: 'Mumbai',
            state: 'Maharashtra'
        },
        company: {
            name: 'Kumar Home Solutions',
            description: 'Professional home repair and maintenance services across Mumbai.',
            serviceType: 'Home Services',
            email: 'info@kumarhome.com',
            phone: '+91 9876543210',
            address: { street: '45 MG Road', city: 'Mumbai', state: 'Maharashtra', zipCode: '400001' }
        },
        services: [
            {
                name: 'Complete Home Deep Cleaning',
                description: 'Thorough deep cleaning of your entire home including kitchen, bathrooms, bedrooms, and living areas. We use eco-friendly products and industrial-grade equipment.',
                price: 2500,
                priceType: 'starting-from',
                category: 'cleaning',
                city: 'Mumbai',
                state: 'Maharashtra',
                duration: '4-6 hours'
            },
            {
                name: 'AC Repair & Servicing',
                description: 'Expert air conditioner repair, gas refilling, and preventive maintenance. All brands supported including split and window ACs.',
                price: 800,
                priceType: 'starting-from',
                category: 'repair',
                city: 'Mumbai',
                state: 'Maharashtra',
                duration: '1-2 hours'
            },
            {
                name: 'Electrical Wiring & Troubleshooting',
                description: 'Licensed electricians for all wiring needs — new installations, fault detection, switchboard upgrades, and MCB fitting.',
                price: 500,
                priceType: 'hourly',
                category: 'electrical',
                city: 'Mumbai',
                state: 'Maharashtra',
                duration: '1-3 hours'
            },
            {
                name: 'Full House Painting',
                description: 'Interior and exterior painting with premium paints. Includes wall preparation, primer coating, and 2-coat finish. Color consultation available.',
                price: 15000,
                priceType: 'starting-from',
                category: 'painting',
                city: 'Mumbai',
                state: 'Maharashtra',
                duration: '3-5 days'
            }
        ]
    },
    {
        user: {
            name: 'Priya Sharma',
            email: 'priya@servicebee.com',
            password: 'provider123',
            role: 'provider',
            phone: '+91 9123456789',
            city: 'Delhi',
            state: 'Delhi'
        },
        company: {
            name: 'Glamour Studio',
            description: 'Premium beauty and wellness services at your doorstep.',
            serviceType: 'Beauty & Wellness',
            email: 'hello@glamourstudio.in',
            phone: '+91 9123456789',
            address: { street: '12 Connaught Place', city: 'New Delhi', state: 'Delhi', zipCode: '110001' }
        },
        services: [
            {
                name: 'Bridal Makeup Package',
                description: 'Complete bridal makeup with HD finish, hairstyling, draping assistance, and touch-up kit. Includes pre-bridal skin prep session.',
                price: 25000,
                priceType: 'fixed',
                category: 'beauty',
                city: 'New Delhi',
                state: 'Delhi',
                duration: '3-4 hours'
            },
            {
                name: 'Hair Spa & Treatment',
                description: 'Deep conditioning hair spa with keratin treatment options. Includes scalp massage, steam therapy, and premium hair mask application.',
                price: 1500,
                priceType: 'fixed',
                category: 'beauty',
                city: 'New Delhi',
                state: 'Delhi',
                duration: '1.5 hours'
            },
            {
                name: 'Party Makeup',
                description: 'Glamorous party-ready look with contouring, eye makeup, and hairstyling. Perfect for weddings, receptions, and special occasions.',
                price: 5000,
                priceType: 'fixed',
                category: 'beauty',
                city: 'New Delhi',
                state: 'Delhi',
                duration: '1.5-2 hours'
            }
        ]
    },
    {
        user: {
            name: 'Amit Patel',
            email: 'amit@servicebee.com',
            password: 'provider123',
            role: 'provider',
            phone: '+91 9988776655',
            city: 'Ahmedabad',
            state: 'Gujarat'
        },
        company: {
            name: 'TechFix Solutions',
            description: 'Expert computer, laptop, and smartphone repair services.',
            serviceType: 'Tech Support',
            email: 'support@techfix.in',
            phone: '+91 9988776655',
            address: { street: '78 CG Road', city: 'Ahmedabad', state: 'Gujarat', zipCode: '380009' }
        },
        services: [
            {
                name: 'Laptop Repair & Upgrade',
                description: 'Hardware diagnostics, screen replacement, SSD upgrade, RAM upgrade, and OS installation. All laptop brands supported.',
                price: 1000,
                priceType: 'starting-from',
                category: 'tech',
                city: 'Ahmedabad',
                state: 'Gujarat',
                duration: '1-2 days'
            },
            {
                name: 'Home WiFi Setup & Networking',
                description: 'Complete home network setup including router configuration, WiFi range extenders, LAN cabling, and smart home device integration.',
                price: 1500,
                priceType: 'fixed',
                category: 'tech',
                city: 'Ahmedabad',
                state: 'Gujarat',
                duration: '2-3 hours'
            },
            {
                name: 'CCTV Installation',
                description: 'Professional CCTV camera installation with mobile app setup for remote viewing. Includes 4-camera system, DVR, and 1TB storage.',
                price: 12000,
                priceType: 'starting-from',
                category: 'tech',
                city: 'Ahmedabad',
                state: 'Gujarat',
                duration: 'Same day'
            }
        ]
    },
    {
        user: {
            name: 'Suresh Reddy',
            email: 'suresh@servicebee.com',
            password: 'provider123',
            role: 'provider',
            phone: '+91 9555444333',
            city: 'Hyderabad',
            state: 'Telangana'
        },
        company: {
            name: 'GreenScape Gardens',
            description: 'Landscaping, gardening, and outdoor space transformation experts.',
            serviceType: 'Gardening & Landscaping',
            email: 'care@greenscape.in',
            phone: '+91 9555444333',
            address: { street: '23 Jubilee Hills', city: 'Hyderabad', state: 'Telangana', zipCode: '500033' }
        },
        services: [
            {
                name: 'Garden Design & Landscaping',
                description: 'Complete garden design from concept to installation. Includes plant selection, soil preparation, irrigation system, and decorative elements.',
                price: 20000,
                priceType: 'starting-from',
                category: 'gardening',
                city: 'Hyderabad',
                state: 'Telangana',
                duration: '1-2 weeks'
            },
            {
                name: 'Monthly Garden Maintenance',
                description: 'Regular garden upkeep including lawn mowing, hedge trimming, weeding, fertilizing, and pest control. 4 visits per month.',
                price: 3000,
                priceType: 'fixed',
                category: 'gardening',
                city: 'Hyderabad',
                state: 'Telangana',
                duration: '2-3 hours per visit'
            },
            {
                name: 'Terrace Garden Setup',
                description: 'Transform your terrace into a green oasis. Includes waterproofing consultation, container gardening, vertical planters, and drip irrigation.',
                price: 15000,
                priceType: 'starting-from',
                category: 'gardening',
                city: 'Hyderabad',
                state: 'Telangana',
                duration: '3-5 days'
            }
        ]
    },
    {
        user: {
            name: 'Vikram Singh',
            email: 'vikram@servicebee.com',
            password: 'provider123',
            role: 'provider',
            phone: '+91 9333222111',
            city: 'Pune',
            state: 'Maharashtra'
        },
        company: {
            name: 'Swift Movers & Packers',
            description: 'Reliable and affordable packing, moving, and relocation services.',
            serviceType: 'Moving & Relocation',
            email: 'book@swiftmovers.in',
            phone: '+91 9333222111',
            address: { street: '56 FC Road', city: 'Pune', state: 'Maharashtra', zipCode: '411004' }
        },
        services: [
            {
                name: 'Local House Shifting',
                description: 'Complete door-to-door house shifting within the city. Includes packing materials, loading, transport, unloading, and basic furniture assembly.',
                price: 5000,
                priceType: 'starting-from',
                category: 'moving',
                city: 'Pune',
                state: 'Maharashtra',
                duration: 'Same day'
            },
            {
                name: 'Interstate Relocation',
                description: 'Full-service interstate moving with GPS-tracked transport, transit insurance, custom crating for fragile items, and unpacking at destination.',
                price: 15000,
                priceType: 'starting-from',
                category: 'moving',
                city: 'Pune',
                state: 'Maharashtra',
                duration: '3-7 days'
            },
            {
                name: 'Plumbing Repair & Installation',
                description: 'Expert plumbers for leaky faucets, pipe repair, geyser installation, bathroom fittings, and drainage solutions.',
                price: 400,
                priceType: 'hourly',
                category: 'plumbing',
                city: 'Pune',
                state: 'Maharashtra',
                duration: '1-3 hours'
            }
        ]
    }
];

const DEMO_USERS = [
    {
        name: 'Ananya Verma',
        email: 'ananya@example.com',
        password: 'user123456',
        role: 'user',
        phone: '+91 9111222333',
        city: 'Mumbai',
        state: 'Maharashtra'
    },
    {
        name: 'Rohit Mehta',
        email: 'rohit@example.com',
        password: 'user123456',
        role: 'user',
        phone: '+91 9444555666',
        city: 'Ahmedabad',
        state: 'Gujarat'
    }
];

// ──────────────────────────── Seed Logic ────────────────────────────

const seedAdmin = async () => {
    const existing = await User.findOne({ email: ADMIN.email });
    if (existing) {
        console.log(`  ⏭️  Admin already exists: ${ADMIN.email}`);
        return existing;
    }
    const admin = await User.create(ADMIN);
    console.log(`  ✅ Admin created: ${admin.email}`);
    return admin;
};

const seedDemoUsers = async () => {
    const created = [];
    for (const userData of DEMO_USERS) {
        const existing = await User.findOne({ email: userData.email });
        if (existing) {
            console.log(`  ⏭️  User already exists: ${userData.email}`);
            created.push(existing);
            continue;
        }
        const user = await User.create(userData);
        console.log(`  ✅ User created: ${user.email}`);
        created.push(user);
    }
    return created;
};

const seedProviders = async () => {
    let servicesCreated = 0;
    let servicesSkipped = 0;

    for (const providerData of PROVIDERS) {
        // 1. Create or find provider user
        let user = await User.findOne({ email: providerData.user.email });
        if (!user) {
            user = await User.create(providerData.user);
            console.log(`  ✅ Provider created: ${user.email}`);
        } else {
            console.log(`  ⏭️  Provider already exists: ${user.email}`);
        }

        // 2. Create or find company
        let company = await Company.findOne({ owner: user._id });
        if (!company) {
            company = await Company.create({
                ...providerData.company,
                owner: user._id
            });
            // Link company to user
            user.company = company._id;
            await user.save();
            console.log(`  ✅ Company created: ${company.name}`);
        } else {
            console.log(`  ⏭️  Company already exists: ${company.name}`);
        }

        // 3. Create services (skip if already exists by name + company combo)
        for (const serviceData of providerData.services) {
            const existingService = await Service.findOne({
                name: serviceData.name,
                company: company._id
            });

            if (existingService) {
                console.log(`  ⏭️  Service already exists: "${serviceData.name}"`);
                servicesSkipped++;
                continue;
            }

            await Service.create({
                ...serviceData,
                company: company._id,
                createdBy: user._id
            });
            console.log(`  ✅ Service created: "${serviceData.name}"`);
            servicesCreated++;
        }
    }

    return { servicesCreated, servicesSkipped };
};

// ──────────────────────────── Main ────────────────────────────

const seed = async () => {
    try {
        await connectDB();
        console.log('\n🌱 Starting database seed...\n');

        console.log('── Admin ──');
        await seedAdmin();

        console.log('\n── Demo Users ──');
        await seedDemoUsers();

        console.log('\n── Providers, Companies & Services ──');
        const { servicesCreated, servicesSkipped } = await seedProviders();

        // Summary
        const totalUsers = await User.countDocuments();
        const totalCompanies = await Company.countDocuments();
        const totalServices = await Service.countDocuments();

        console.log('\n════════════════════════════════════');
        console.log('  🎃 Seed Complete!');
        console.log('════════════════════════════════════');
        console.log(`  Users in DB:      ${totalUsers}`);
        console.log(`  Companies in DB:  ${totalCompanies}`);
        console.log(`  Services in DB:   ${totalServices}`);
        console.log(`  Services added:   ${servicesCreated}`);
        console.log(`  Services skipped: ${servicesSkipped}`);
        console.log('════════════════════════════════════');
        console.log('\n  📋 Demo Logins:');
        console.log('  ─────────────────────────────────');
        console.log('  Admin:    admin@servicebee.com / adminpassword123');
        console.log('  Provider: rajesh@servicebee.com / provider123');
        console.log('  User:     ananya@example.com / user123456');
        console.log('════════════════════════════════════\n');

        process.exit(0);
    } catch (error) {
        console.error('\n❌ Seed failed:', error.message);
        console.error(error);
        process.exit(1);
    }
};

seed();
