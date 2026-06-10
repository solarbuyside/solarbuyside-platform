// Generate bcrypt hashes for admin passwords
const bcrypt = require('bcrypt');

const COST = 12;

const admins = [
  { email: 'francis_poloni@yahoo.com.br', password: 'Nerac47600@' },
  { email: 'gab.feelix@gmail.com', password: 'gafe3622' }
];

async function generateHashes() {
  console.log('-- Generated bcrypt hashes (cost=12)');
  console.log('-- Execute this SQL on the server:\n');

  for (const admin of admins) {
    const hash = await bcrypt.hash(admin.password, COST);
    console.log(`UPDATE admin_users SET password_hash = '${hash}', password = NULL WHERE email = '${admin.email}';`);
  }

  console.log('\n-- Verify migration:');
  console.log('SELECT id, email, (password IS NULL) as plain_removed, (password_hash IS NOT NULL) as hashed FROM admin_users;');
}

generateHashes();
