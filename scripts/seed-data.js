const { Client } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const TORONTO_CENTER = { lat: 43.6532, lng: -79.3832 };

// Sample obstacle types and severities
const obstacleTypes = ['speedbump', 'pothole', 'construction', 'steep_grade', 'railroad_crossing'];
const severities = ['low', 'medium', 'high'];

async function seedData() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Check if data already exists
    const userCheck = await client.query('SELECT COUNT(*) FROM users');
    if (parseInt(userCheck.rows[0].count) > 0) {
      console.log('⚠️  Database already has data. Skipping seed.');
      return;
    }

    console.log('\n📝 Creating sample users...');

    // Create sample users
    const passwordHash = await bcrypt.hash('password123', 10);

    const users = [
      {
        email: 'admin@stride.app',
        name: 'Admin User',
        role: 'admin',
        subscription: 'premium',
        reputation: 5000,
      },
      {
        email: 'premium1@example.com',
        name: 'John Doe',
        role: 'user',
        subscription: 'premium',
        reputation: 1200,
      },
      {
        email: 'premium2@example.com',
        name: 'Jane Smith',
        role: 'user',
        subscription: 'premium_annual',
        reputation: 850,
      },
      {
        email: 'user1@example.com',
        name: 'Mike Johnson',
        role: 'user',
        subscription: 'free',
        reputation: 320,
      },
      {
        email: 'user2@example.com',
        name: 'Sarah Williams',
        role: 'user',
        subscription: 'free',
        reputation: 150,
      },
    ];

    const userIds = [];
    for (const user of users) {
      const result = await client.query(
        `INSERT INTO users (email, password_hash, name, role, subscription_status, subscription_expires_at, reputation_points)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id`,
        [
          user.email,
          passwordHash,
          user.name,
          user.role,
          user.subscription,
          user.subscription !== 'free' ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) : null, // 1 year from now
          user.reputation,
        ]
      );
      userIds.push(result.rows[0].id);
      console.log(`  ✓ Created user: ${user.name} (${user.email})`);
    }

    console.log('\n🚧 Creating sample obstacles in Toronto area...');

    // Create 100 sample obstacles around Toronto
    const obstacleIds = [];
    for (let i = 0; i < 100; i++) {
      // Random location within ~10km of Toronto center
      const lat = TORONTO_CENTER.lat + (Math.random() - 0.5) * 0.2;
      const lng = TORONTO_CENTER.lng + (Math.random() - 0.5) * 0.2;
      const type = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
      const severity = severities[Math.floor(Math.random() * severities.length)];
      const createdBy = userIds[Math.floor(Math.random() * userIds.length)];
      const verified = Math.random() > 0.5;
      const verificationCount = verified ? Math.floor(Math.random() * 5) + 3 : Math.floor(Math.random() * 3);

      const result = await client.query(
        `INSERT INTO obstacles (type, location, severity, verified, verification_count, status, created_by)
         VALUES ($1, ST_SetSRID(ST_MakePoint($2, $3), 4326)::geography, $4, $5, $6, 'active', $7)
         RETURNING id`,
        [type, lng, lat, severity, verified, verificationCount, createdBy]
      );

      obstacleIds.push(result.rows[0].id);

      if ((i + 1) % 20 === 0) {
        console.log(`  ✓ Created ${i + 1} obstacles`);
      }
    }

    console.log(`  ✓ Total obstacles created: ${obstacleIds.length}`);

    console.log('\n📊 Creating sample reports...');

    // Create sample reports for obstacles
    for (let i = 0; i < 50; i++) {
      const obstacleId = obstacleIds[Math.floor(Math.random() * obstacleIds.length)];
      const userId = userIds[Math.floor(Math.random() * userIds.length)];
      const reportType = ['confirm', 'fixed', 'dispute'][Math.floor(Math.random() * 3)];
      const severity = severities[Math.floor(Math.random() * severities.length)];

      await client.query(
        `INSERT INTO reports (obstacle_id, user_id, report_type, severity, description)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          obstacleId,
          userId,
          reportType,
          severity,
          `Sample ${reportType} report for testing`,
        ]
      );
    }

    console.log('  ✓ Created 50 sample reports');

    console.log('\n🏆 Creating sample achievements...');

    // Award some achievements
    const achievementTypes = ['early_adopter', 'reporter_10', 'explorer_100km'];
    for (let i = 0; i < userIds.length; i++) {
      for (let j = 0; j <= i; j++) {
        if (j < achievementTypes.length) {
          await client.query(
            `INSERT INTO achievements (user_id, badge_type)
             VALUES ($1, $2)`,
            [userIds[i], achievementTypes[j]]
          );
        }
      }
    }

    console.log('  ✓ Created sample achievements');

    console.log('\n🚗 Creating sample vehicles for premium users...');

    // Create sample vehicles for premium users
    const vehicles = [
      {
        userId: userIds[1], // premium1
        name: '2020 Honda Civic Si',
        type: 'sports_car',
        suspension: 'lowered_springs',
        clearance: 4.5,
      },
      {
        userId: userIds[1],
        name: '2018 Toyota 4Runner',
        type: 'suv',
        suspension: 'stock',
        clearance: 9.0,
      },
      {
        userId: userIds[2], // premium2
        name: '2021 Porsche 911',
        type: 'exotic',
        suspension: 'coilovers',
        clearance: 3.8,
      },
    ];

    for (const vehicle of vehicles) {
      await client.query(
        `INSERT INTO vehicles (user_id, name, vehicle_type, suspension_type, ground_clearance_inches, is_active)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [vehicle.userId, vehicle.name, vehicle.type, vehicle.suspension, vehicle.clearance, true]
      );
      console.log(`  ✓ Created vehicle: ${vehicle.name}`);
    }

    console.log('\n❤️  Creating sample favorites...');

    // Create sample favorites
    const favorites = [
      { userId: userIds[1], name: 'Home', lat: 43.65, lng: -79.38, address: '123 Main St, Toronto' },
      { userId: userIds[1], name: 'Work', lat: 43.66, lng: -79.39, address: '456 Bay St, Toronto' },
      { userId: userIds[2], name: 'Home', lat: 43.64, lng: -79.37, address: '789 Queen St, Toronto' },
      { userId: userIds[3], name: 'Gym', lat: 43.67, lng: -79.40, address: '321 King St, Toronto' },
    ];

    for (const fav of favorites) {
      await client.query(
        `INSERT INTO favorites (user_id, place_name, location, address)
         VALUES ($1, $2, ST_SetSRID(ST_MakePoint($3, $4), 4326)::geography, $5)`,
        [fav.userId, fav.name, fav.lng, fav.lat, fav.address]
      );
    }

    console.log(`  ✓ Created ${favorites.length} sample favorites`);

    console.log('\n🏁 Creating sample car clubs...');

    // Create sample car clubs
    const clubs = [
      {
        name: 'Toronto JDM Society',
        description: 'For Japanese car enthusiasts in the GTA',
        ownerId: userIds[1],
        isPrivate: false,
      },
      {
        name: 'Lowered Lifestyle',
        description: 'Community for lowered and slammed cars',
        ownerId: userIds[2],
        isPrivate: false,
      },
      {
        name: 'Classic Car Collectors',
        description: 'Preserving automotive history',
        ownerId: userIds[1],
        isPrivate: true,
      },
    ];

    for (const club of clubs) {
      const clubResult = await client.query(
        `INSERT INTO car_clubs (name, description, owner_id, is_private)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [club.name, club.description, club.ownerId, club.isPrivate]
      );

      const clubId = clubResult.rows[0].id;

      // Add owner as member
      await client.query(
        `INSERT INTO club_members (club_id, user_id, role)
         VALUES ($1, $2, 'owner')`,
        [clubId, club.ownerId]
      );

      // Add a few more members
      for (let i = 0; i < 3; i++) {
        const memberId = userIds[Math.floor(Math.random() * userIds.length)];
        if (memberId !== club.ownerId) {
          try {
            await client.query(
              `INSERT INTO club_members (club_id, user_id, role)
               VALUES ($1, $2, 'member')`,
              [clubId, memberId]
            );

            await client.query(
              'UPDATE car_clubs SET member_count = member_count + 1 WHERE id = $1',
              [clubId]
            );
          } catch (err) {
            // Ignore duplicate member errors
          }
        }
      }

      console.log(`  ✓ Created club: ${club.name}`);
    }

    console.log('\n🎉 Seed data created successfully!');
    console.log('\n📊 Summary:');
    console.log(`  • Users: ${userIds.length}`);
    console.log(`  • Obstacles: ${obstacleIds.length}`);
    console.log(`  • Reports: 50`);
    console.log(`  • Vehicles: ${vehicles.length}`);
    console.log(`  • Favorites: ${favorites.length}`);
    console.log(`  • Car Clubs: ${clubs.length}`);
    console.log('\n🔑 Test login credentials:');
    console.log('  Admin:    admin@stride.app / password123');
    console.log('  Premium:  premium1@example.com / password123');
    console.log('  Free:     user1@example.com / password123');
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await client.end();
  }
}

seedData();
