/**
 * EasyBeats Seed Data
 *
 * Seeds the database with sample data for development and testing.
 *
 * Run with: pnpm run seed
 */

import { passwordHasher } from '../../utils/passwordHasher.js';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const seed = async function (knex) {
  // Clear existing data (in reverse order of dependencies)
  await knex('notifications').del();
  await knex('authTokens').del();
  // await knex('refreshTokens').del(); // Not in migrations seen so far, but keep if it exists
  await knex('cartItems').del();
  await knex('payouts').del();
  await knex('producerEarnings').del();
  await knex('payoutMethods').del();
  await knex('playHistory').del();
  await knex('follows').del();
  await knex('likes').del();
  await knex('playlistBeats').del();
  await knex('playlists').del();
  await knex('userPurchases').del();
  await knex('orderItems').del();
  await knex('orders').del();
  await knex('beatFiles').del();
  await knex('licenseTiers').del();
  await knex('beats').del();
  await knex('producers').del();
  await knex('genres').del();
  await knex('admins').del();
  await knex('artists').del();
  await knex('platformSettings').del();
  await knex('users').del();

  console.log('🗑️  Cleared existing data');

  const slugify = (str) => {
    return str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  // ==========================================
  // 1. USERS
  // ==========================================
  const defaultPassword = await passwordHasher.hash('Password123!');

  const users = await knex('users')
    .insert([
      {
        name: 'Admin User',
        email: 'admin@EasyBeats.com',
        password: defaultPassword,
        role: 'admin',
        status: 'active',
        emailVerifiedAt: new Date(),
        emailNotifications: true,
        pushNotifications: true,
        publicProfile: false,
        theme: 'dark',
      },
      {
        name: 'CloudNine',
        email: 'cloudnine@EasyBeats.com',
        password: defaultPassword,
        role: 'producer',
        status: 'active',
        emailVerifiedAt: new Date(),
        emailNotifications: true,
        pushNotifications: true,
        publicProfile: true,
        theme: 'dark',
      },
      {
        name: 'SynthWave Pro',
        email: 'synthwave@EasyBeats.com',
        password: defaultPassword,
        role: 'producer',
        status: 'active',
        emailVerifiedAt: new Date(),
        emailNotifications: true,
        pushNotifications: false,
        publicProfile: true,
        theme: 'dark',
      },
      {
        name: 'UrbanFlow',
        email: 'urbanflow@EasyBeats.com',
        password: defaultPassword,
        role: 'producer',
        status: 'active',
        emailVerifiedAt: new Date(),
        emailNotifications: true,
        pushNotifications: true,
        publicProfile: true,
        theme: 'dark',
      },
      {
        name: 'VibeMaster',
        email: 'vibemaster@EasyBeats.com',
        password: defaultPassword,
        role: 'producer',
        status: 'active',
        emailVerifiedAt: new Date(),
        emailNotifications: true,
        pushNotifications: true,
        publicProfile: true,
        theme: 'dark',
      },
      {
        name: 'ShadowProd',
        email: 'shadowprod@EasyBeats.com',
        password: defaultPassword,
        role: 'producer',
        status: 'active',
        emailVerifiedAt: new Date(),
        emailNotifications: true,
        pushNotifications: false,
        publicProfile: true,
        theme: 'dark',
      },
      {
        name: 'Alex Producer',
        email: 'alex@EasyBeats.com',
        password: defaultPassword,
        role: 'producer',
        status: 'active',
        emailVerifiedAt: new Date(),
        emailNotifications: true,
        pushNotifications: true,
        publicProfile: true,
        theme: 'dark',
      },
      {
        name: 'AfroBeatsKing',
        email: 'afrobeatsking@EasyBeats.com',
        password: defaultPassword,
        role: 'producer',
        status: 'active',
        emailVerifiedAt: new Date(),
        emailNotifications: true,
        pushNotifications: true,
        publicProfile: true,
        theme: 'dark',
      },
      {
        name: 'MelodyMaker',
        email: 'melodymaker@EasyBeats.com',
        password: defaultPassword,
        role: 'producer',
        status: 'active',
        emailVerifiedAt: new Date(),
        emailNotifications: true,
        pushNotifications: false,
        publicProfile: true,
        theme: 'dark',
      },
      {
        name: 'RockLegend',
        email: 'rocklegend@EasyBeats.com',
        password: defaultPassword,
        role: 'producer',
        status: 'active',
        emailVerifiedAt: new Date(),
        emailNotifications: true,
        pushNotifications: true,
        publicProfile: true,
        theme: 'dark',
      },
      {
        name: 'Test Artist',
        email: 'artist@EasyBeats.com',
        password: defaultPassword,
        role: 'artist',
        status: 'active',
        emailVerifiedAt: new Date(),
        emailNotifications: true,
        pushNotifications: true,
        publicProfile: true,
        theme: 'dark',
      },
    ])
    .returning('*');

  console.log(`✅ Created ${users.length} users`);

  // Map users by email for easy lookup
  const userMap = {};
  users.forEach((u) => {
    userMap[u.email] = u;
  });

  // ==========================================
  // 2. PRODUCERS
  // ==========================================
  const producers = await knex('producers')
    .insert([
      {
        userId: userMap['cloudnine@EasyBeats.com'].id,
        username: 'cloudnine',
        displayName: 'CloudNine',
        bio: 'Multi-platinum producer specializing in dark trap and melodic beats. Known for atmospheric soundscapes and hard-hitting 808s.',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&q=80',
        coverImage: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1200&q=80',
        location: 'Atlanta, GA',
        website: 'https://cloudnine.beats',
        isVerified: true,
      },
      {
        userId: userMap['synthwave@EasyBeats.com'].id,
        username: 'synthwave',
        displayName: 'SynthWave Pro',
        bio: 'Retro-futuristic producer bringing the 80s back with modern production techniques. Specializes in synthwave and electronic music.',
        avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400&q=80',
        coverImage: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=1200&q=80',
        location: 'Los Angeles, CA',
        website: 'https://synthwavepro.com',
        isVerified: true,
      },
      {
        userId: userMap['urbanflow@EasyBeats.com'].id,
        username: 'urbanflow',
        displayName: 'UrbanFlow',
        bio: 'Golden era hip hop meets modern production. Creating timeless beats with soul and authenticity.',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
        coverImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&q=80',
        location: 'Brooklyn, NY',
        website: 'https://urbanflow.nyc',
        isVerified: true,
      },
      {
        userId: userMap['vibemaster@EasyBeats.com'].id,
        username: 'vibemaster',
        displayName: 'VibeMaster',
        bio: 'Experimental producer blending electronic, soul, and R&B. Pushing boundaries with innovative sound design.',
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80',
        coverImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&q=80',
        location: 'London, UK',
        website: 'https://vibemaster.co.uk',
        isVerified: true,
      },
      {
        userId: userMap['shadowprod@EasyBeats.com'].id,
        username: 'shadow',
        displayName: 'ShadowProd',
        bio: 'Dark, aggressive production for drill and trap. Working with top artists in the UK drill scene.',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80',
        coverImage: 'https://images.unsplash.com/photo-1504898770365-14faca6a7320?w=1200&q=80',
        location: 'London, UK',
        isVerified: true,
      },
      {
        userId: userMap['alex@EasyBeats.com'].id,
        username: 'alexproducer',
        displayName: 'Alex Producer',
        bio: 'Independent beatmaker creating unique sounds. Available for custom work.',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
        coverImage: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1200&q=80',
        location: 'Los Angeles, CA',
        website: 'https://beatdrop.com/alexproducer',
        twitter: 'alexprod',
        instagram: 'alex.producer',
        isVerified: false,
      },
      {
        userId: userMap['afrobeatsking@EasyBeats.com'].id,
        username: 'afrobeatsking',
        displayName: 'AfroBeatsKing',
        bio: 'Afrobeat & Amapiano specialist. Bringing hot rhythms and infectious polyrhythms from Lagos to the world.',
        avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&q=80',
        coverImage: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200&q=80',
        location: 'Lagos, Nigeria',
        website: 'https://afrobeatsking.com',
        isVerified: true,
      },
      {
        userId: userMap['melodymaker@EasyBeats.com'].id,
        username: 'melodymaker',
        displayName: 'MelodyMaker',
        bio: 'Pop, R&B, and Cinematic music producer. Creating commercial hits with catchy hooks and lush orchestrations.',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80',
        coverImage: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=1200&q=80',
        location: 'Miami, FL',
        website: 'https://melodymaker.audio',
        isVerified: true,
      },
      {
        userId: userMap['rocklegend@EasyBeats.com'].id,
        username: 'rocklegend',
        displayName: 'RockLegend',
        bio: 'Bringing raw energy with electric guitars, heavy basslines, and live drums. Rock, grunge, and alternative styles.',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
        coverImage: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=1200&q=80',
        location: 'Seattle, WA',
        website: 'https://rocklegend.store',
        isVerified: false,
      },
    ])
    .returning('*');

  console.log(`✅ Created ${producers.length} producers`);

  // ==========================================
  // 3. ARTISTS
  // ==========================================
  const artists = await knex('artists')
    .insert([
      {
        userId: userMap['artist@EasyBeats.com'].id,
        displayName: 'Test Artist',
        bio: 'Up-and-coming artist looking for the perfect sound.',
        avatar: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80',
        location: 'Miami, FL',
        instagram: 'testartist_official',
      },
    ])
    .returning('*');

  console.log(`✅ Created ${artists.length} artists`);

  // ==========================================
  // 4. ADMINS
  // ==========================================
  const admins = await knex('admins')
    .insert([
      {
        userId: userMap['admin@EasyBeats.com'].id,
        displayName: 'Admin User',
        bio: 'System administrator for EasyBeats.',
        avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80',
      },
    ])
    .returning('*');

  console.log(`✅ Created ${admins.length} admins`);

  // Map producers by username
  const producerMap = {};
  producers.forEach((p) => {
    producerMap[p.username] = p;
  });

  // ==========================================
  // 3. GENRES
  // ==========================================
  const genres = await knex('genres')
    .insert([
      {
        name: 'Trap',
        slug: 'trap',
        color: 'bg-orange-700/80 hover:bg-orange-600/80',
      },
      {
        name: 'Hip Hop',
        slug: 'hip-hop',
        color: 'bg-purple-700/80 hover:bg-purple-600/80',
      },
      { name: 'R&B', slug: 'rnb', color: 'bg-blue-700/80 hover:bg-blue-600/80' },
      {
        name: 'Electronic',
        slug: 'electronic',
        color: 'bg-emerald-700/80 hover:bg-emerald-600/80',
      },
      {
        name: 'Lo-Fi',
        slug: 'lofi',
        color: 'bg-yellow-700/80 hover:bg-yellow-600/80',
      },
      { name: 'Pop', slug: 'pop', color: 'bg-pink-700/80 hover:bg-pink-600/80' },
      { name: 'Drill', slug: 'drill', color: 'bg-red-700/80 hover:bg-red-600/80' },
      {
        name: 'Synthwave',
        slug: 'synthwave',
        color: 'bg-indigo-700/80 hover:bg-indigo-600/80',
      },
      {
        name: 'Afrobeat',
        slug: 'afrobeat',
        color: 'bg-amber-700/80 hover:bg-amber-600/80',
      },
      {
        name: 'Reggae',
        slug: 'reggae',
        color: 'bg-green-700/80 hover:bg-green-500/80',
      },
      {
        name: 'Cinematic',
        slug: 'cinematic',
        color: 'bg-teal-700/80 hover:bg-teal-600/80',
      },
      {
        name: 'Rock',
        slug: 'rock',
        color: 'bg-slate-700/80 hover:bg-slate-600/80',
      },
      {
        name: 'Amapiano',
        slug: 'amapiano',
        color: 'bg-rose-700/80 hover:bg-rose-600/80',
      },
    ])
    .returning('*');

  console.log(`✅ Created ${genres.length} genres`);

  // ==========================================
  // 6. PLATFORM SETTINGS
  // ==========================================
  await knex('platformSettings').insert([
    {
      key: 'platformCommissionRate',
      value: '15',
      type: 'number',
      category: 'fees',
      description: 'Platform commission percentage',
    },
    {
      key: 'processingFeePercentage',
      value: '2.9',
      type: 'number',
      category: 'fees',
      description: 'Payment processing fee percentage',
    },
    {
      key: 'processingFeeFixed',
      value: '0.30',
      type: 'number',
      category: 'fees',
      description: 'Fixed processing fee per transaction in USD',
    },
    {
      key: 'minimumPayoutAmount',
      value: '50',
      type: 'number',
      category: 'payout',
      description: 'Minimum balance required for payout in USD',
    },
    {
      key: 'payoutFrequency',
      value: 'weekly',
      type: 'string',
      category: 'payout',
      description: 'Payout frequency',
    },
    {
      key: 'maintenanceMode',
      value: 'false',
      type: 'boolean',
      category: 'general',
      description: 'Enable maintenance mode',
    },
  ]);
  console.log('✅ Created platform settings');

  // Map genres by name
  const genreMap = {};
  genres.forEach((g) => {
    genreMap[g.name] = g;
  });

  // ==========================================
  // 4. BEATS
  // ==========================================
  const beatData = [
    // CloudNine beats
    {
      producerId: producerMap['cloudnine'].id,
      genreId: genreMap['Trap'].id,
      title: 'Midnight Dreams',
      description: 'A captivating trap beat with dark, melodic elements and hard-hitting 808s.',
      bpm: 140,
      musicalKey: 'Am',
      duration: '3:24',
      durationSeconds: 204,
      price: 29.99, // For license tiers calculation
      coverImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80',
      previewAudioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      tags: JSON.stringify(['Trap', 'Dark', 'Melodic']),
      playsCount: 481000,
      likesCount: 12500,
      status: 'active',
      isFeatured: true,
    },
    {
      producerId: producerMap['cloudnine'].id,
      genreId: genreMap['Hip Hop'].id,
      title: 'Urban Legend',
      description: 'Classic boom bap hip hop with gritty drums and soulful samples.',
      bpm: 95,
      musicalKey: 'Gm',
      duration: '3:45',
      durationSeconds: 225,
      price: 24.99,
      coverImage: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=800&q=80',
      previewAudioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
      tags: JSON.stringify(['Hip Hop', 'Boom Bap', 'Gritty']),
      playsCount: 89000,
      likesCount: 3200,
      status: 'active',
      isFeatured: true,
    },
    {
      producerId: producerMap['cloudnine'].id,
      genreId: genreMap['Lo-Fi'].id,
      title: 'Chill Vibes',
      description: 'Relaxing lo-fi hip hop beat perfect for studying, working, or unwinding.',
      bpm: 85,
      musicalKey: 'Em',
      duration: '2:48',
      durationSeconds: 168,
      price: 24.99,
      coverImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80',
      previewAudioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
      tags: JSON.stringify(['LoFi', 'Study', 'Relaxing']),
      playsCount: 253000,
      likesCount: 8900,
      status: 'active',
    },
    {
      producerId: producerMap['cloudnine'].id,
      genreId: genreMap['Trap'].id,
      title: 'Cloud Walker',
      description: 'Ethereal melodic trap with heavenly pads floating over punchy drums.',
      bpm: 130,
      musicalKey: 'Gb',
      duration: '3:55',
      durationSeconds: 235,
      price: 39.99,
      coverImage: 'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=800&q=80',
      previewAudioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3',
      tags: JSON.stringify(['Melodic', 'Trap', 'Ethereal']),
      playsCount: 521000,
      likesCount: 15600,
      status: 'active',
      isFeatured: true,
    },
    {
      producerId: producerMap['cloudnine'].id,
      genreId: genreMap['Lo-Fi'].id,
      title: 'Moonlight',
      description:
        'Peaceful lo-fi beat for late-night sessions. Gentle piano melodies and mellow drums.',
      bpm: 75,
      musicalKey: 'Ab',
      duration: '2:55',
      durationSeconds: 175,
      price: 24.99,
      coverImage: 'https://images.unsplash.com/photo-1532767153582-b1a0e5145009?w=800&q=80',
      previewAudioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
      tags: JSON.stringify(['LoFi', 'Chill', 'Night']),
      playsCount: 178000,
      likesCount: 5400,
      status: 'active',
    },
    // SynthWave Pro beats
    {
      producerId: producerMap['synthwave'].id,
      genreId: genreMap['Synthwave'].id,
      title: 'Neon Horizon',
      description: 'An energetic synthwave track with retro, upbeat vibes reminiscent of the 80s.',
      bpm: 128,
      musicalKey: 'Cm',
      duration: '4:12',
      durationSeconds: 252,
      price: 34.99,
      coverImage: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=800&q=80',
      previewAudioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
      tags: JSON.stringify(['Synthwave', 'Retro', 'Upbeat']),
      playsCount: 156000,
      likesCount: 4800,
      status: 'active',
      isFeatured: true,
    },
    {
      producerId: producerMap['synthwave'].id,
      genreId: genreMap['Electronic'].id,
      title: 'Neon Lights',
      description: 'Intense cyberpunk beat with industrial elements and heavy bass.',
      bpm: 150,
      musicalKey: 'Fm',
      duration: '3:36',
      durationSeconds: 216,
      price: 44.99,
      coverImage: 'https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?w=800&q=80',
      previewAudioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
      tags: JSON.stringify(['Cyberpunk', 'Industrial', 'Heavy']),
      playsCount: 107000,
      likesCount: 3100,
      status: 'active',
    },
    {
      producerId: producerMap['synthwave'].id,
      genreId: genreMap['Synthwave'].id,
      title: 'Tokyo Nights',
      description: 'Neon-drenched synthwave journey through futuristic cityscapes.',
      bpm: 118,
      musicalKey: 'Am',
      duration: '4:15',
      durationSeconds: 255,
      price: 44.99,
      coverImage: 'https://images.unsplash.com/photo-1480796927426-f609979314bd?w=800&q=80',
      previewAudioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3',
      tags: JSON.stringify(['Synthwave', 'Cyberpunk', 'Neon']),
      playsCount: 312000,
      likesCount: 9800,
      status: 'active',
      isFeatured: true,
    },
    {
      producerId: producerMap['synthwave'].id,
      genreId: genreMap['Electronic'].id,
      title: 'Neon Dreams',
      description: 'Futuristic electronic beat with glittering synths and driving rhythms.',
      bpm: 125,
      musicalKey: 'Dm',
      duration: '3:38',
      durationSeconds: 218,
      price: 39.99,
      coverImage: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80',
      previewAudioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3',
      tags: JSON.stringify(['Electronic', 'Future', 'Upbeat']),
      playsCount: 283000,
      likesCount: 7600,
      status: 'active',
    },
    {
      producerId: producerMap['synthwave'].id,
      genreId: genreMap['Electronic'].id,
      title: 'Interstellar',
      description: 'Epic cinematic production that takes you on a journey through the cosmos.',
      bpm: 135,
      musicalKey: 'Fm',
      duration: '4:30',
      durationSeconds: 270,
      price: 49.99,
      coverImage: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&q=80',
      previewAudioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
      tags: JSON.stringify(['Cinematic', 'Epic', 'Space']),
      playsCount: 267000,
      likesCount: 8200,
      status: 'active',
      isFeatured: true,
    },
    // UrbanFlow beats
    {
      producerId: producerMap['urbanflow'].id,
      genreId: genreMap['R&B'].id,
      title: 'Golden Hour',
      description: 'Smooth R&B instrumental with warm keys and silky drum patterns.',
      bpm: 110,
      musicalKey: 'Gm',
      duration: '4:20',
      durationSeconds: 260,
      price: 34.99,
      coverImage: 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=800&q=80',
      previewAudioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
      tags: JSON.stringify(['RnB', 'Chill', 'Smooth']),
      playsCount: 81000,
      likesCount: 2900,
      status: 'active',
    },
    {
      producerId: producerMap['urbanflow'].id,
      genreId: genreMap['Hip Hop'].id,
      title: 'Street Dreams',
      description:
        'Emotional rap instrumental featuring beautiful piano melodies over crisp drums.',
      bpm: 88,
      musicalKey: 'Bbm',
      duration: '4:05',
      durationSeconds: 245,
      price: 54.99,
      coverImage: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800&q=80',
      previewAudioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
      tags: JSON.stringify(['Rap', 'Piano', 'Emotional']),
      playsCount: 74000,
      likesCount: 2100,
      status: 'active',
    },
    {
      producerId: producerMap['urbanflow'].id,
      genreId: genreMap['Hip Hop'].id,
      title: 'Crown Royal',
      description: 'Luxurious hip hop instrumental with sophisticated piano chords.',
      bpm: 78,
      musicalKey: 'Cm',
      duration: '3:42',
      durationSeconds: 222,
      price: 49.99,
      coverImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80',
      previewAudioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3',
      tags: JSON.stringify(['Hip Hop', 'Luxury', 'Smooth']),
      playsCount: 245000,
      likesCount: 7100,
      status: 'active',
      isFeatured: true,
    },
    {
      producerId: producerMap['urbanflow'].id,
      genreId: genreMap['Hip Hop'].id,
      title: 'Brooklyn Bridge',
      description: 'Classic New York boom bap with hard-hitting drums and soulful samples.',
      bpm: 90,
      musicalKey: 'Em',
      duration: '3:22',
      durationSeconds: 202,
      price: 29.99,
      coverImage: 'https://images.unsplash.com/photo-1485579149621-3123dd979885?w=800&q=80',
      previewAudioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      tags: JSON.stringify(['Boom Bap', 'Classic', 'New York']),
      playsCount: 134000,
      likesCount: 4200,
      status: 'active',
    },
    // VibeMaster beats
    {
      producerId: producerMap['vibemaster'].id,
      genreId: genreMap['Electronic'].id,
      title: 'Electric Soul',
      description: 'Futuristic electronic production meets soulful melodies.',
      bpm: 128,
      musicalKey: 'Cm',
      duration: '3:58',
      durationSeconds: 238,
      price: 39.99,
      coverImage: 'https://images.unsplash.com/photo-1614149162883-504ce4d13909?w=800&q=80',
      previewAudioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
      tags: JSON.stringify(['Electronic', 'Soul', 'Future']),
      playsCount: 228000,
      likesCount: 6700,
      status: 'active',
      isFeatured: true,
    },
    {
      producerId: producerMap['vibemaster'].id,
      genreId: genreMap['R&B'].id,
      title: 'Sunset Boulevard',
      description: 'Smooth summer R&B vibes with warm synths and laid-back drums.',
      bpm: 92,
      musicalKey: 'Dm',
      duration: '3:52',
      durationSeconds: 232,
      price: 29.99,
      coverImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80',
      previewAudioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3',
      tags: JSON.stringify(['RnB', 'Smooth', 'Summer']),
      playsCount: 198000,
      likesCount: 5800,
      status: 'active',
    },
    {
      producerId: producerMap['vibemaster'].id,
      genreId: genreMap['R&B'].id,
      title: 'Vintage Soul',
      description: 'Warm vintage soul production with authentic analog textures.',
      bpm: 98,
      musicalKey: 'Bb',
      duration: '4:08',
      durationSeconds: 248,
      price: 34.99,
      coverImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80',
      previewAudioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3',
      tags: JSON.stringify(['Soul', 'Vintage', 'Warm']),
      playsCount: 167000,
      likesCount: 4900,
      status: 'active',
    },
    {
      producerId: producerMap['vibemaster'].id,
      genreId: genreMap['Pop'].id,
      title: 'Paradise',
      description: 'Tropical pop production with sunny melodies and bouncy rhythms.',
      bpm: 105,
      musicalKey: 'C',
      duration: '3:45',
      durationSeconds: 225,
      price: 44.99,
      coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
      previewAudioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
      tags: JSON.stringify(['Tropical', 'Pop', 'Summer']),
      playsCount: 345000,
      likesCount: 10200,
      status: 'active',
      isFeatured: true,
    },
    // ShadowProd beats
    {
      producerId: producerMap['shadow'].id,
      genreId: genreMap['Drill'].id,
      title: 'Dark Matter',
      description:
        'Hard-hitting drill beat with menacing 808 slides and dark atmospheric elements.',
      bpm: 145,
      musicalKey: 'Ebm',
      duration: '3:18',
      durationSeconds: 198,
      price: 39.99,
      coverImage: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&q=80',
      previewAudioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
      tags: JSON.stringify(['Drill', 'Dark', 'Hard']),
      playsCount: 457000,
      likesCount: 13500,
      status: 'active',
      isFeatured: true,
    },
    {
      producerId: producerMap['shadow'].id,
      genreId: genreMap['Trap'].id,
      title: 'Phantom',
      description: 'Aggressive trap beat with haunting melodies and thunderous 808s.',
      bpm: 140,
      musicalKey: 'Fm',
      duration: '3:28',
      durationSeconds: 208,
      price: 34.99,
      coverImage: 'https://images.unsplash.com/photo-1504898770365-14faca6a7320?w=800&q=80',
      previewAudioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3',
      tags: JSON.stringify(['Trap', 'Dark', 'Aggressive']),
      playsCount: 389000,
      likesCount: 11200,
      status: 'active',
    },
    {
      producerId: producerMap['shadow'].id,
      genreId: genreMap['Drill'].id,
      title: 'Savage Mode',
      description: 'Ruthless UK drill instrumental with sliding 808s and menacing hi-hats.',
      bpm: 155,
      musicalKey: 'Gm',
      duration: '3:12',
      durationSeconds: 192,
      price: 54.99,
      coverImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
      previewAudioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
      tags: JSON.stringify(['Drill', 'UK', 'Hard']),
      playsCount: 612000,
      likesCount: 18900,
      status: 'active',
      isFeatured: true,
    },
    // ==========================================
    // ADDITIONAL VARIETY BEATS
    // ==========================================
    // Alex Producer beats
    {
      producerId: producerMap['alexproducer'].id,
      genreId: genreMap['Lo-Fi'].id,
      title: 'Desert Mirage',
      description: 'Atmospheric lo-fi hip hop with dusty vinyl crackles and a soulful guitar riff.',
      bpm: 80,
      musicalKey: 'F#m',
      duration: '3:02',
      durationSeconds: 182,
      price: 29.99,
      coverImage: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&q=80',
      previewAudioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3',
      tags: JSON.stringify(['LoFi', 'Desert', 'Guitar']),
      playsCount: 45000,
      likesCount: 1500,
      status: 'active',
    },
    {
      producerId: producerMap['alexproducer'].id,
      genreId: genreMap['Synthwave'].id,
      title: 'Midnight Highway',
      description: 'Late-night driving synthwave with fat analog basslines and soaring lead synths.',
      bpm: 115,
      musicalKey: 'Em',
      duration: '3:40',
      durationSeconds: 220,
      price: 34.99,
      coverImage: 'https://images.unsplash.com/photo-1515462277126-270d878326e5?w=800&q=80',
      previewAudioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3',
      tags: JSON.stringify(['Synthwave', 'Highway', 'Retro']),
      playsCount: 28000,
      likesCount: 920,
      status: 'active',
    },
    // AfroBeatsKing beats
    {
      producerId: producerMap['afrobeatsking'].id,
      genreId: genreMap['Afrobeat'].id,
      title: 'Lagos Groove',
      description: 'Infectious Afrobeat vibes with bright brass sections, organic percussion, and dance rhythms.',
      bpm: 110,
      musicalKey: 'Bm',
      duration: '3:15',
      durationSeconds: 195,
      price: 39.99,
      coverImage: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80',
      previewAudioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
      tags: JSON.stringify(['Afrobeat', 'Groove', 'Lagos']),
      playsCount: 320000,
      likesCount: 9800,
      status: 'active',
      isFeatured: true,
    },
    {
      producerId: producerMap['afrobeatsking'].id,
      genreId: genreMap['Amapiano'].id,
      title: 'Soweto Bass',
      description: 'Deep Amapiano track with the signature heavy log drum, jazzy keys, and shaker loops.',
      bpm: 113,
      musicalKey: 'Am',
      duration: '4:02',
      durationSeconds: 242,
      price: 44.99,
      coverImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80',
      previewAudioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
      tags: JSON.stringify(['Amapiano', 'Bass', 'LogDrum']),
      playsCount: 180000,
      likesCount: 5400,
      status: 'active',
    },
    {
      producerId: producerMap['afrobeatsking'].id,
      genreId: genreMap['Afrobeat'].id,
      title: 'Ocean Breeze',
      description: 'Chill Afrobeat instrumental with acoustic guitars, smooth bass, and breezy pads.',
      bpm: 105,
      musicalKey: 'C#m',
      duration: '3:30',
      durationSeconds: 210,
      price: 34.99,
      coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
      previewAudioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
      tags: JSON.stringify(['Afrobeat', 'Chill', 'Vibes']),
      playsCount: 150000,
      likesCount: 4300,
      status: 'active',
    },
    {
      producerId: producerMap['afrobeatsking'].id,
      genreId: genreMap['Amapiano'].id,
      title: 'Piano Sunsets',
      description: 'Beautiful melodic Amapiano with lush Rhodes piano, deep sub-bass, and smooth woodwinds.',
      bpm: 111,
      musicalKey: 'D',
      duration: '4:25',
      durationSeconds: 265,
      price: 39.99,
      coverImage: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800&q=80',
      previewAudioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
      tags: JSON.stringify(['Amapiano', 'Chill', 'LogDrum']),
      playsCount: 95000,
      likesCount: 2900,
      status: 'active',
    },
    // MelodyMaker beats
    {
      producerId: producerMap['melodymaker'].id,
      genreId: genreMap['Pop'].id,
      title: 'Rising Sun',
      description: 'Uplifting commercial pop production with an explosive chorus, synth brass, and clean guitars.',
      bpm: 120,
      musicalKey: 'G',
      duration: '3:10',
      durationSeconds: 190,
      price: 49.99,
      coverImage: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=800&q=80',
      previewAudioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
      tags: JSON.stringify(['Pop', 'Uplifting', 'Anthem']),
      playsCount: 410000,
      likesCount: 12100,
      status: 'active',
      isFeatured: true,
    },
    {
      producerId: producerMap['melodymaker'].id,
      genreId: genreMap['R&B'].id,
      title: 'Heartstrings',
      description: 'Emotional R&B beat with a melancholic Spanish guitar melody and heavy sub-bass.',
      bpm: 92,
      musicalKey: 'Abm',
      duration: '3:48',
      durationSeconds: 228,
      price: 34.99,
      coverImage: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800&q=80',
      previewAudioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3',
      tags: JSON.stringify(['RnB', 'Guitar', 'Sad']),
      playsCount: 124000,
      likesCount: 3800,
      status: 'active',
    },
    {
      producerId: producerMap['melodymaker'].id,
      genreId: genreMap['Cinematic'].id,
      title: 'Epic Journey',
      description: 'Grand orchestral cinematic backing track with dramatic string ostinatos, brass swells, and big drums.',
      bpm: 130,
      musicalKey: 'Dm',
      duration: '4:50',
      durationSeconds: 290,
      price: 59.99,
      coverImage: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&q=80',
      previewAudioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3',
      tags: JSON.stringify(['Cinematic', 'Orchestral', 'Epic']),
      playsCount: 88000,
      likesCount: 2400,
      status: 'active',
    },
    {
      producerId: producerMap['melodymaker'].id,
      genreId: genreMap['Pop'].id,
      title: 'Neon Glow',
      description: 'Dance-pop instrumental with shimmering arpeggiated synths, groovy baseline, and punchy 4x4 drums.',
      bpm: 124,
      musicalKey: 'C',
      duration: '3:15',
      durationSeconds: 195,
      price: 39.99,
      coverImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80',
      previewAudioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
      tags: JSON.stringify(['Pop', 'Dance', 'Synthesizer']),
      playsCount: 210000,
      likesCount: 6500,
      status: 'active',
    },
    {
      producerId: producerMap['melodymaker'].id,
      genreId: genreMap['Reggae'].id,
      title: 'Island Breeze',
      description: 'Relaxed roots reggae beat with a bubbly organ, skanking guitars, and a heavy dub bassline.',
      bpm: 78,
      musicalKey: 'G',
      duration: '3:40',
      durationSeconds: 220,
      price: 29.99,
      coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
      previewAudioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      tags: JSON.stringify(['Reggae', 'Island', 'Dub']),
      playsCount: 75000,
      likesCount: 2200,
      status: 'active',
    },
    // RockLegend beats
    {
      producerId: producerMap['rocklegend'].id,
      genreId: genreMap['Rock'].id,
      title: 'Raging Thunder',
      description: 'High-octane hard rock track featuring screaming electric guitar solos, heavy riffs, and thundering live drums.',
      bpm: 140,
      musicalKey: 'Em',
      duration: '3:45',
      durationSeconds: 225,
      price: 49.99,
      coverImage: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=800&q=80',
      previewAudioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
      tags: JSON.stringify(['Rock', 'Guitar', 'Energetic']),
      playsCount: 165000,
      likesCount: 4800,
      status: 'active',
      isFeatured: true,
    },
    {
      producerId: producerMap['rocklegend'].id,
      genreId: genreMap['Rock'].id,
      title: 'Seattle Rain',
      description: 'Haunting alternative rock/grunge beat with chorused clean guitars building up to heavy distorted choruses.',
      bpm: 120,
      musicalKey: 'Am',
      duration: '4:12',
      durationSeconds: 252,
      price: 39.99,
      coverImage: 'https://images.unsplash.com/photo-1485579149621-3123dd979885?w=800&q=80',
      previewAudioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
      tags: JSON.stringify(['Grunge', 'Rock', 'Atmospheric']),
      playsCount: 112000,
      likesCount: 3100,
      status: 'active',
    },
    {
      producerId: producerMap['rocklegend'].id,
      genreId: genreMap['Rock'].id,
      title: 'Acoustic Dreams',
      description: 'Mellow alternative rock beat with acoustic guitars, warm bass, and a gentle tambourine rhythm.',
      bpm: 90,
      musicalKey: 'D',
      duration: '3:55',
      durationSeconds: 235,
      price: 29.99,
      coverImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80',
      previewAudioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3',
      tags: JSON.stringify(['Acoustic', 'Rock', 'Melodic']),
      playsCount: 84000,
      likesCount: 2100,
      status: 'active',
    },
    // New variety for CloudNine
    {
      producerId: producerMap['cloudnine'].id,
      genreId: genreMap['Trap'].id,
      title: 'Tokyo Drifter',
      description: 'High-energy trap beat with Japanese flute samples and fast-rolling hi-hats.',
      bpm: 142,
      musicalKey: 'Bbm',
      duration: '3:05',
      durationSeconds: 185,
      price: 34.99,
      coverImage: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80',
      previewAudioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3',
      tags: JSON.stringify(['Trap', 'Tokyo', 'Fast']),
      playsCount: 310000,
      likesCount: 9200,
      status: 'active',
    },
    {
      producerId: producerMap['cloudnine'].id,
      genreId: genreMap['Trap'].id,
      title: 'Savage Heart',
      description: 'Melodic trap with emotional vocal chops and heavy 808 basslines.',
      bpm: 135,
      musicalKey: 'C#m',
      duration: '3:12',
      durationSeconds: 192,
      price: 29.99,
      coverImage: 'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=800&q=80',
      previewAudioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3',
      tags: JSON.stringify(['Trap', 'Melodic', 'Emotional']),
      playsCount: 220000,
      likesCount: 6800,
      status: 'active',
    },
    // New variety for SynthWave Pro
    {
      producerId: producerMap['synthwave'].id,
      genreId: genreMap['Electronic'].id,
      title: 'Cyber Runner',
      description: 'Fast-paced cyberpunk electro track with driving arpeggiators and dark synth chords.',
      bpm: 126,
      musicalKey: 'Gm',
      duration: '3:50',
      durationSeconds: 230,
      price: 39.99,
      coverImage: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80',
      previewAudioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3',
      tags: JSON.stringify(['Cyberpunk', 'Electronic', 'Driving']),
      playsCount: 145000,
      likesCount: 4100,
      status: 'active',
    },
    {
      producerId: producerMap['synthwave'].id,
      genreId: genreMap['Synthwave'].id,
      title: 'Retro Sunset',
      description: 'Mellow synthwave track perfect for sunset drives, with soft pads and vintage drums.',
      bpm: 110,
      musicalKey: 'Fm',
      duration: '4:05',
      durationSeconds: 245,
      price: 34.99,
      coverImage: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=800&q=80',
      previewAudioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
      tags: JSON.stringify(['Synthwave', 'Retro', 'Chill']),
      playsCount: 118000,
      likesCount: 3400,
      status: 'active',
    },
    // New variety for UrbanFlow
    {
      producerId: producerMap['urbanflow'].id,
      genreId: genreMap['Lo-Fi'].id,
      title: 'Lo-Fi Cafe',
      description: 'Jazzy lo-fi beat with electric piano chords, coffee shop ambient noise, and laid-back drums.',
      bpm: 82,
      musicalKey: 'Cm',
      duration: '2:50',
      durationSeconds: 170,
      price: 24.99,
      coverImage: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&q=80',
      previewAudioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
      tags: JSON.stringify(['LoFi', 'Jazz', 'Chill']),
      playsCount: 260000,
      likesCount: 8100,
      status: 'active',
    },
    {
      producerId: producerMap['urbanflow'].id,
      genreId: genreMap['Hip Hop'].id,
      title: 'Harlem Nights',
      description: 'Soulful boom bap beat with vintage vocal samples, horn stabs, and boom bap drums.',
      bpm: 92,
      musicalKey: 'Gm',
      duration: '3:35',
      durationSeconds: 215,
      price: 29.99,
      coverImage: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=800&q=80',
      previewAudioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
      tags: JSON.stringify(['Hip Hop', 'Boom Bap', 'Soul']),
      playsCount: 115000,
      likesCount: 3600,
      status: 'active',
    },
    // New variety for VibeMaster
    {
      producerId: producerMap['vibemaster'].id,
      genreId: genreMap['R&B'].id,
      title: 'Future Soul',
      description: 'Contemporary R&B/Future Soul track with sliding synths, warm keypads, and sharp drums.',
      bpm: 100,
      musicalKey: 'F#m',
      duration: '3:55',
      durationSeconds: 235,
      price: 34.99,
      coverImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80',
      previewAudioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3',
      tags: JSON.stringify(['RnB', 'Future', 'Soul']),
      playsCount: 135000,
      likesCount: 3900,
      status: 'active',
    },
    {
      producerId: producerMap['vibemaster'].id,
      genreId: genreMap['Pop'].id,
      title: 'Summer Wave',
      description: 'Danceable synth pop beat with a tropical touch, catchy pluck melodies, and driving bass.',
      bpm: 112,
      musicalKey: 'G',
      duration: '3:20',
      durationSeconds: 200,
      price: 39.99,
      coverImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80',
      previewAudioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
      tags: JSON.stringify(['Pop', 'Dance', 'Summer']),
      playsCount: 195000,
      likesCount: 5200,
      status: 'active',
    },
    // New variety for ShadowProd
    {
      producerId: producerMap['shadow'].id,
      genreId: genreMap['Drill'].id,
      title: 'Gaza Block',
      description: 'Grimy UK drill instrumental with sliding subs, eerie vocal chops, and fast percussion.',
      bpm: 142,
      musicalKey: 'Ebm',
      duration: '3:25',
      durationSeconds: 205,
      price: 44.99,
      coverImage: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&q=80',
      previewAudioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      tags: JSON.stringify(['Drill', 'UK', 'Aggressive']),
      playsCount: 290000,
      likesCount: 8800,
      status: 'active',
    },
    {
      producerId: producerMap['shadow'].id,
      genreId: genreMap['Drill'].id,
      title: 'Ghost Town',
      description: 'Atmospheric and spooky drill beat with a haunted piano theme and punchy 808 slides.',
      bpm: 144,
      musicalKey: 'Fm',
      duration: '3:10',
      durationSeconds: 190,
      price: 39.99,
      coverImage: 'https://images.unsplash.com/photo-1504898770365-14faca6a7320?w=800&q=80',
      previewAudioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3',
      tags: JSON.stringify(['Drill', 'Dark', 'Haunting']),
      playsCount: 185000,
      likesCount: 5100,
      status: 'active',
    },
  ];

  // Insert beats and calculate slugs
  const beats = await knex('beats')
    .insert(
      beatData.map((b) => {
        const { price, ...rest } = b;
        return {
          ...rest,
          slug: slugify(b.title),
        };
      })
    )
    .returning('*');

  console.log(`✅ Created ${beats.length} beats`);

  // ==========================================
  // 6. BEAT FILES
  // ==========================================
  const beatFiles = [];
  beats.forEach((beat) => {
    beatFiles.push(
      {
        beatId: beat.id,
        fileType: 'preview',
        fileName: `${beat.slug}-preview.mp3`,
        filePath: `beats/${beat.producerId}/${beat.id}/preview.mp3`,
        mimeType: 'audio/mpeg',
        fileSize: 3500000,
        isPublic: true,
      },
      {
        beatId: beat.id,
        fileType: 'masterMp3',
        fileName: `${beat.slug}-master.mp3`,
        filePath: `beats/${beat.producerId}/${beat.id}/master.mp3`,
        mimeType: 'audio/mpeg',
        fileSize: 8500000,
        isPublic: false,
      },
      {
        beatId: beat.id,
        fileType: 'masterWav',
        fileName: `${beat.slug}-master.wav`,
        filePath: `beats/${beat.producerId}/${beat.id}/master.wav`,
        mimeType: 'audio/wav',
        fileSize: 45000000,
        isPublic: false,
      },
      {
        beatId: beat.id,
        fileType: 'stems',
        fileName: `${beat.slug}-stems.zip`,
        filePath: `beats/${beat.producerId}/${beat.id}/stems.zip`,
        mimeType: 'application/zip',
        fileSize: 150000000,
        isPublic: false,
      },
      {
        beatId: beat.id,
        fileType: 'projectFiles',
        fileName: `${beat.slug}-project.zip`,
        filePath: `beats/${beat.producerId}/${beat.id}/project.zip`,
        mimeType: 'application/zip',
        fileSize: 250000000,
        isPublic: false,
      }
    );
  });

  await knex('beatFiles').insert(beatFiles);
  console.log(`✅ Created ${beatFiles.length} beat files`);

  // ==========================================
  // 5. LICENSE TIERS
  // ==========================================
  const licenseTierData = [];

  beats.forEach((beat, index) => {
    const originalPrice = beatData[index].price;
    licenseTierData.push(
      {
        beatId: beat.id,
        tierType: 'mp3',
        name: 'MP3 Lease',
        price: originalPrice,
        description: 'Basic license for non-profit use. Includes tagged MP3 file.',
        includedFiles: JSON.stringify(['Tagged MP3 File']),
        isExclusive: false,
        sortOrder: 1,
      },
      {
        beatId: beat.id,
        tierType: 'wav',
        name: 'WAV Lease',
        price: originalPrice + 20,
        description: 'Standard lease with untagged MP3 and high-quality WAV files.',
        includedFiles: JSON.stringify(['Untagged MP3 File', 'High-Quality WAV File']),
        isExclusive: false,
        sortOrder: 2,
      },
      {
        beatId: beat.id,
        tierType: 'stems',
        name: 'Trackout',
        price: originalPrice + 70,
        description: 'Full trackout package with individual stems for mixing.',
        includedFiles: JSON.stringify([
          'Untagged MP3 File',
          'High-Quality WAV File',
          'Trackout Stems (ZIP)',
        ]),
        isExclusive: false,
        sortOrder: 3,
      },
      {
        beatId: beat.id,
        tierType: 'exclusive',
        name: 'Exclusive Rights',
        price: originalPrice * 15,
        description: 'Full ownership transfer. Beat removed from store after purchase.',
        includedFiles: JSON.stringify([
          'Untagged MP3 File',
          'High-Quality WAV File',
          'Trackout Stems (ZIP)',
          'Project Files',
        ]),
        isExclusive: true,
        sortOrder: 4,
      }
    );
  });

  await knex('licenseTiers').insert(licenseTierData);
  console.log(`✅ Created ${licenseTierData.length} license tiers`);

  // ==========================================
  // 6. PLAYLISTS
  // ==========================================
  const artistUser = userMap['artist@EasyBeats.com'];

  const playlists = await knex('playlists')
    .insert([
      {
        userId: artistUser.id,
        name: 'Favorites',
        description: 'My favorite beats',
        color: 'bg-orange-500',
        isPublic: false,
        beatsCount: 8,
      },
      {
        userId: artistUser.id,
        name: 'Workout Vibes',
        description: 'High energy beats for the gym',
        color: 'bg-green-500',
        isPublic: true,
        beatsCount: 5,
      },
      {
        userId: artistUser.id,
        name: 'Chill Sessions',
        description: 'Lo-fi beats to relax to',
        color: 'bg-blue-500',
        isPublic: true,
        beatsCount: 6,
      },
    ])
    .returning('*');

  console.log(`✅ Created ${playlists.length} playlists`);

  // Add beats to playlists
  const playlistBeats = [
    { playlistId: playlists[0].id, beatId: beats[0].id, position: 1 },
    { playlistId: playlists[0].id, beatId: beats[3].id, position: 2 },
    { playlistId: playlists[0].id, beatId: beats[5].id, position: 3 },
    { playlistId: playlists[0].id, beatId: beats[8].id, position: 4 },
    { playlistId: playlists[0].id, beatId: beats[14].id, position: 5 },
    { playlistId: playlists[1].id, beatId: beats[18].id, position: 1 },
    { playlistId: playlists[1].id, beatId: beats[19].id, position: 2 },
    { playlistId: playlists[1].id, beatId: beats[20].id, position: 3 },
    { playlistId: playlists[2].id, beatId: beats[2].id, position: 1 },
    { playlistId: playlists[2].id, beatId: beats[4].id, position: 2 },
    { playlistId: playlists[2].id, beatId: beats[10].id, position: 3 },
    { playlistId: playlists[2].id, beatId: beats[15].id, position: 4 },
    // New variety beats in playlists
    { playlistId: playlists[0].id, beatId: beats[23].id, position: 6 },
    { playlistId: playlists[0].id, beatId: beats[27].id, position: 7 },
    { playlistId: playlists[0].id, beatId: beats[32].id, position: 8 },
    { playlistId: playlists[1].id, beatId: beats[24].id, position: 4 },
    { playlistId: playlists[1].id, beatId: beats[37].id, position: 5 },
    { playlistId: playlists[2].id, beatId: beats[21].id, position: 5 },
    { playlistId: playlists[2].id, beatId: beats[39].id, position: 6 },
  ];

  await knex('playlistBeats').insert(playlistBeats);
  console.log(`✅ Added ${playlistBeats.length} beats to playlists`);

  // ==========================================
  // 7. LIKES
  // ==========================================
  const likes = [
    { userId: artistUser.id, beatId: beats[0].id },
    { userId: artistUser.id, beatId: beats[3].id },
    { userId: artistUser.id, beatId: beats[5].id },
    { userId: artistUser.id, beatId: beats[8].id },
    { userId: artistUser.id, beatId: beats[14].id },
    { userId: artistUser.id, beatId: beats[18].id },
    { userId: artistUser.id, beatId: beats[20].id },
    { userId: userMap['cloudnine@EasyBeats.com'].id, beatId: beats[5].id },
    { userId: userMap['synthwave@EasyBeats.com'].id, beatId: beats[0].id },
    { userId: userMap['urbanflow@EasyBeats.com'].id, beatId: beats[14].id },
    // New variety likes
    { userId: artistUser.id, beatId: beats[23].id },
    { userId: artistUser.id, beatId: beats[27].id },
    { userId: artistUser.id, beatId: beats[32].id },
    { userId: artistUser.id, beatId: beats[39].id },
    { userId: userMap['afrobeatsking@EasyBeats.com'].id, beatId: beats[24].id },
    { userId: userMap['melodymaker@EasyBeats.com'].id, beatId: beats[27].id },
  ];

  await knex('likes').insert(likes);
  console.log(`✅ Created ${likes.length} likes`);

  // ==========================================
  // 8. FOLLOWS
  // ==========================================
  const follows = [
    { followerId: artistUser.id, producerId: producerMap['cloudnine'].id },
    { followerId: artistUser.id, producerId: producerMap['synthwave'].id },
    { followerId: artistUser.id, producerId: producerMap['shadow'].id },
    { followerId: userMap['cloudnine@EasyBeats.com'].id, producerId: producerMap['synthwave'].id },
    { followerId: userMap['synthwave@EasyBeats.com'].id, producerId: producerMap['shadow'].id },
    // New follows
    { followerId: artistUser.id, producerId: producerMap['afrobeatsking'].id },
    { followerId: artistUser.id, producerId: producerMap['melodymaker'].id },
    { followerId: artistUser.id, producerId: producerMap['rocklegend'].id },
  ];

  await knex('follows').insert(follows);
  console.log(`✅ Created ${follows.length} follows`);

  // ==========================================
  // 9. PAYOUT METHODS
  // ==========================================
  const payoutMethods = await knex('payoutMethods')
    .insert([
      {
        producerId: producerMap['cloudnine'].id,
        type: 'paypal',
        details: JSON.stringify({ email: 'cloudnine@paypal.com' }),
        isDefault: true,
        isVerified: true,
      },
      {
        producerId: producerMap['synthwave'].id,
        type: 'bank',
        details: JSON.stringify({ bankName: 'Chase', accountLast4: '4567' }),
        isDefault: true,
        isVerified: true,
      },
      {
        producerId: producerMap['shadow'].id,
        type: 'paypal',
        details: JSON.stringify({ email: 'shadow@paypal.com' }),
        isDefault: true,
        isVerified: true,
      },
      {
        producerId: producerMap['afrobeatsking'].id,
        type: 'paypal',
        details: JSON.stringify({ email: 'afrobeatsking@paypal.com' }),
        isDefault: true,
        isVerified: true,
      },
      {
        producerId: producerMap['melodymaker'].id,
        type: 'bank',
        details: JSON.stringify({ bankName: 'Wells Fargo', accountLast4: '9876' }),
        isDefault: true,
        isVerified: true,
      },
      {
        producerId: producerMap['rocklegend'].id,
        type: 'paypal',
        details: JSON.stringify({ email: 'rocklegend@paypal.com' }),
        isDefault: true,
        isVerified: true,
      },
    ])
    .returning('*');

  console.log(`✅ Created ${payoutMethods.length} payout methods`);

  // ==========================================
  // 10. PAYOUTS
  // ==========================================
  await knex('payouts')
    .insert([
      {
        producerId: producerMap['cloudnine'].id,
        payoutMethodId: payoutMethods[0].id,
        payoutNumber: 'BB-PO-2026-0001',
        amount: 150.0,
        currency: 'USD',
        status: 'completed',
        transactionReference: 'PAY-CLOUDNINE-001',
        completedAt: new Date('2026-01-01'),
      },
      {
        producerId: producerMap['synthwave'].id,
        payoutMethodId: payoutMethods[1].id,
        payoutNumber: 'BB-PO-2026-0002',
        amount: 200.0,
        currency: 'USD',
        status: 'pending',
        transactionReference: 'PAY-SYNTHWAVE-001',
      },
    ])
    .returning('*');
  console.log('✅ Created sample payout records');

  // ==========================================
  // 10. SAMPLE ORDERS
  // ==========================================
  const orders = await knex('orders')
    .insert([
      {
        userId: artistUser.id,
        orderNumber: 'BB-2026-0001',
        email: artistUser.email,
        subtotal: 29.99,
        total: 29.99,
        status: 'completed',
        paymentProvider: 'paystack',
        paymentReference: 'PSK_123456789',
        paidAt: new Date('2026-01-10'),
      },
      {
        userId: artistUser.id,
        orderNumber: 'BB-2026-0002',
        email: artistUser.email,
        subtotal: 89.97,
        total: 89.97,
        status: 'completed',
        paymentProvider: 'paystack',
        paymentReference: 'PSK_123456790',
        paidAt: new Date('2026-01-15'),
      },
      {
        userId: artistUser.id,
        orderNumber: 'BB-2026-0003',
        email: artistUser.email,
        subtotal: 89.98,
        total: 89.98,
        status: 'completed',
        paymentProvider: 'paystack',
        paymentReference: 'PSK_123456791',
        paidAt: new Date('2026-02-01'),
      },
    ])
    .returning('*');

  console.log(`✅ Created ${orders.length} orders`);

  // Order items helper mapping
  const allLicenseTiers = await knex('licenseTiers').select('*');
  const tierMap = {};
  allLicenseTiers.forEach((t) => {
    if (!tierMap[t.beatId]) {
      tierMap[t.beatId] = {};
    }
    tierMap[t.beatId][t.tierType] = t;
  });

  const orderItems = await knex('orderItems')
    .insert([
      {
        orderId: orders[0].id,
        beatId: beats[0].id,
        licenseTierId: tierMap[beats[0].id]['mp3'].id,
        producerId: producerMap['cloudnine'].id,
        beatTitle: beats[0].title,
        licenseName: 'MP3 Lease',
        price: 29.99,
        producerEarnings: 25.49,
        platformFee: 4.5,
        isExclusive: false,
      },
      {
        orderId: orders[1].id,
        beatId: beats[5].id,
        licenseTierId: tierMap[beats[5].id]['wav'].id,
        producerId: producerMap['synthwave'].id,
        beatTitle: beats[5].title,
        licenseName: 'WAV Lease',
        price: 54.99,
        producerEarnings: 46.74,
        platformFee: 8.25,
        isExclusive: false,
      },
      {
        orderId: orders[1].id,
        beatId: beats[14].id,
        licenseTierId: tierMap[beats[14].id]['mp3'].id,
        producerId: producerMap['vibemaster'].id,
        beatTitle: beats[14].title,
        licenseName: 'MP3 Lease',
        price: 34.99,
        producerEarnings: 29.74,
        platformFee: 5.25,
        isExclusive: false,
      },
      {
        orderId: orders[2].id,
        beatId: beats[23].id,
        licenseTierId: tierMap[beats[23].id]['mp3'].id,
        producerId: producerMap['afrobeatsking'].id,
        beatTitle: beats[23].title,
        licenseName: 'MP3 Lease',
        price: 39.99,
        producerEarnings: 33.99,
        platformFee: 6.00,
        isExclusive: false,
      },
      {
        orderId: orders[2].id,
        beatId: beats[32].id,
        licenseTierId: tierMap[beats[32].id]['wav'].id,
        producerId: producerMap['rocklegend'].id,
        beatTitle: beats[32].title,
        licenseName: 'WAV Lease',
        price: 49.99,
        producerEarnings: 42.49,
        platformFee: 7.50,
        isExclusive: false,
      },
    ])
    .returning('*');

  console.log(`✅ Created ${orderItems.length} order items`);

  // User purchases
  await knex('userPurchases').insert([
    {
      userId: artistUser.id,
      beatId: beats[0].id,
      orderItemId: orderItems[0].id,
      licenseTierId: tierMap[beats[0].id]['mp3'].id,
      licenseType: 'mp3',
      purchasedAt: new Date('2026-01-10'),
    },
    {
      userId: artistUser.id,
      beatId: beats[5].id,
      orderItemId: orderItems[1].id,
      licenseTierId: tierMap[beats[5].id]['wav'].id,
      licenseType: 'wav',
      purchasedAt: new Date('2026-01-15'),
    },
    {
      userId: artistUser.id,
      beatId: beats[14].id,
      orderItemId: orderItems[2].id,
      licenseTierId: tierMap[beats[14].id]['mp3'].id,
      licenseType: 'mp3',
      purchasedAt: new Date('2026-01-15'),
    },
    {
      userId: artistUser.id,
      beatId: beats[23].id,
      orderItemId: orderItems[3].id,
      licenseTierId: tierMap[beats[23].id]['mp3'].id,
      licenseType: 'mp3',
      purchasedAt: new Date('2026-02-01'),
    },
    {
      userId: artistUser.id,
      beatId: beats[32].id,
      orderItemId: orderItems[4].id,
      licenseTierId: tierMap[beats[32].id]['wav'].id,
      licenseType: 'wav',
      purchasedAt: new Date('2026-02-01'),
    },
  ]);

  console.log(`✅ Created user purchase records`);

  // Producer earnings
  await knex('producerEarnings').insert([
    {
      producerId: producerMap['cloudnine'].id,
      orderId: orders[0].id,
      orderItemId: orderItems[0].id,
      beatId: beats[0].id,
      grossAmount: 29.99,
      platformFee: 4.5,
      netAmount: 25.49,
      status: 'available',
    },
    {
      producerId: producerMap['synthwave'].id,
      orderId: orders[1].id,
      orderItemId: orderItems[1].id,
      beatId: beats[5].id,
      grossAmount: 54.99,
      platformFee: 8.25,
      netAmount: 46.74,
      status: 'available',
    },
    {
      producerId: producerMap['vibemaster'].id,
      orderId: orders[1].id,
      orderItemId: orderItems[2].id,
      beatId: beats[14].id,
      grossAmount: 34.99,
      platformFee: 5.25,
      netAmount: 29.74,
      status: 'available',
    },
    {
      producerId: producerMap['afrobeatsking'].id,
      orderId: orders[2].id,
      orderItemId: orderItems[3].id,
      beatId: beats[23].id,
      grossAmount: 39.99,
      platformFee: 6.00,
      netAmount: 33.99,
      status: 'available',
    },
    {
      producerId: producerMap['rocklegend'].id,
      orderId: orders[2].id,
      orderItemId: orderItems[4].id,
      beatId: beats[32].id,
      grossAmount: 49.99,
      platformFee: 7.50,
      netAmount: 42.49,
      status: 'available',
    },
  ]);

  console.log(`✅ Created producer earning records`);

  // ==========================================
  // 11. PLAY HISTORY
  const now = new Date();
  const historyEntries = beats.slice(0, 10).map((beat, idx) => ({
    userId: artistUser.id,
    beatId: beat.id,
    playedAt: new Date(now.getTime() - idx * 60000),
    playDurationSeconds: Math.floor(Math.random() * 180) + 30,
  }));

  await knex('playHistory').insert(historyEntries);
  console.log(`✅ Created ${historyEntries.length} play history entries`);

  // ==========================================
  // 12. NOTIFICATIONS
  // ==========================================
  await knex('notifications').insert([
    {
      userId: userMap['cloudnine@EasyBeats.com'].id,
      type: 'newSale',
      title: 'New Sale!',
      message: 'Someone purchased "Midnight Dreams" for $29.99',
      data: JSON.stringify({ beatId: beats[0].id, orderId: orders[0].id }),
      isRead: true,
      readAt: new Date(),
    },
    {
      userId: userMap['synthwave@EasyBeats.com'].id,
      type: 'newFollower',
      title: 'New Follower',
      message: 'Test Artist started following you',
      data: JSON.stringify({ followerId: artistUser.id }),
      isRead: false,
    },
    {
      userId: artistUser.id,
      type: 'systemAlert',
      title: 'Welcome to EasyBeats!',
      message: 'Start discovering amazing beats from top producers.',
      data: JSON.stringify({}),
      isRead: true,
      readAt: new Date(),
    },
    {
      userId: userMap['afrobeatsking@EasyBeats.com'].id,
      type: 'newSale',
      title: 'New Sale!',
      message: 'Someone purchased "Lagos Groove" for $39.99',
      data: JSON.stringify({ beatId: beats[23].id, orderId: orders[2].id }),
      isRead: false,
    },
  ]);

  console.log('✅ Created notifications');

  // ==========================================
  // 13. CART ITEMS
  // ==========================================
  await knex('cartItems').insert([
    {
      userId: artistUser.id,
      beatId: beats[1].id,
      licenseTierId: tierMap[beats[1].id]['mp3'].id,
    },
    {
      userId: artistUser.id,
      beatId: beats[6].id,
      licenseTierId: tierMap[beats[6].id]['wav'].id,
    },
  ]);
  console.log('✅ Created sample cart items');

  console.log('\n🎉 Seeding completed successfully!\n');
};
