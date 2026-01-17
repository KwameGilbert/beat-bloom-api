import { passwordHasher } from '../../utils/passwordHasher.js';

/**
 * Seed the database with initial data
 * @param { import("knex").Knex } knex
 */
export const seed = async (knex) => {
  // Clear existing data
  await knex('users').del();

  // Create a super admin user
  const passwordHash = await passwordHasher.hash('Admin@123');

  const [superAdmin] = await knex('users')
    .insert({
      email: 'admin@example.com',
      password_hash: passwordHash,
      first_name: 'Super',
      last_name: 'Admin',
      role: 'super_admin',
      status: 'active',
      email_verified_at: new Date(),
    })
    .returning('*');

  console.log(`Created super admin: ${superAdmin.email} (${superAdmin.id})`);

  // Create a regular admin user
  const [admin] = await knex('users')
    .insert({
      email: 'manager@example.com',
      password_hash: passwordHash,
      first_name: 'Manager',
      last_name: 'User',
      role: 'admin',
      status: 'active',
      email_verified_at: new Date(),
    })
    .returning('*');

  console.log(`Created admin: ${admin.email} (${admin.id})`);

  // Create a regular user
  const [user] = await knex('users')
    .insert({
      email: 'user@example.com',
      password_hash: passwordHash,
      first_name: 'Regular',
      last_name: 'User',
      role: 'user',
      status: 'active',
      email_verified_at: new Date(),
    })
    .returning('*');

  console.log(`Created user: ${user.email} (${user.id})`);

  console.log('\n✅ Database seeded successfully!');
  console.log('\nDefault credentials:');
  console.log('  Email: admin@example.com (Super Admin)');
  console.log('  Email: manager@example.com (Admin)');
  console.log('  Email: user@example.com (User)');
  console.log('  Password: Admin@123 (for all users)');
};
