/**
 * BeatBloom Seed Data
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
  await knex('refreshTokens').del();
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
  await knex('users').del();

  console.log('🗑️  Cleared existing data');

  // ==========================================
  // 1. USERS
  // ==========================================
  const defaultPassword = await passwordHasher.hash('Password123!');

  const users = await knex('users')
    .insert([
      {
        name: 'Admin User',
        email: 'admin@beatbloom.com',
        password: defaultPassword,
        role: 'admin',
        status: 'active',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80',
        emailVerifiedAt: new Date(),
        emailNotifications: true,
        pushNotifications: true,
        publicProfile: false,
        theme: 'dark',
      },
      {
        name: 'CloudNine',
        email: 'cloudnine@beatbloom.com',
        password: defaultPassword,
        role: 'producer',
        status: 'active',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&q=80',
        emailVerifiedAt: new Date(),
        emailNotifications: true,
        pushNotifications: true,
        publicProfile: true,
        theme: 'dark',
      },
      {
        name: 'SynthWave Pro',
        email: 'synthwave@beatbloom.com',
        password: defaultPassword,
        role: 'producer',
        status: 'active',
        avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400&q=80',
        emailVerifiedAt: new Date(),
        emailNotifications: true,
        pushNotifications: false,
        publicProfile: true,
        theme: 'dark',
      },
      {
        name: 'UrbanFlow',
        email: 'urbanflow@beatbloom.com',
        password: defaultPassword,
        role: 'producer',
        status: 'active',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
        emailVerifiedAt: new Date(),
        emailNotifications: true,
        pushNotifications: true,
        publicProfile: true,
        theme: 'dark',
      },
      {
        name: 'VibeMaster',
        email: 'vibemaster@beatbloom.com',
        password: defaultPassword,
        role: 'producer',
        status: 'active',
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80',
        emailVerifiedAt: new Date(),
        emailNotifications: true,
        pushNotifications: true,
        publicProfile: true,
        theme: 'dark',
      },
      {
        name: 'ShadowProd',
        email: 'shadowprod@beatbloom.com',
        password: defaultPassword,
        role: 'producer',
        status: 'active',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80',
        emailVerifiedAt: new Date(),
        emailNotifications: true,
        pushNotifications: false,
        publicProfile: true,
        theme: 'dark',
      },
      {
        name: 'Alex Producer',
        email: 'alex@beatbloom.com',
        password: defaultPassword,
        role: 'producer',
        status: 'active',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
        emailVerifiedAt: new Date(),
        emailNotifications: true,
        pushNotifications: true,
        publicProfile: true,
        theme: 'dark',
      },
      {
        name: 'Test Artist',
        email: 'artist@beatbloom.com',
        password: defaultPassword,
        role: 'artist',
        status: 'active',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&q=80',
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
  // 2. PRODUCERS (Profile data only - stats calculated real-time)
  // ==========================================
  const producers = await knex('producers')
    .insert([
      {
        userId: userMap['cloudnine@beatbloom.com'].id,
        username: 'cloudnine',
        displayName: 'CloudNine',
        bio: 'Multi-platinum producer specializing in dark trap and melodic beats. Known for atmospheric soundscapes and hard-hitting 808s.',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&q=80',
        coverImage: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1200&q=80',
        location: 'Atlanta, GA',
        website: 'https://cloudnine.beats',
        instagram: 'cloudnine_beats',
        twitter: 'cloudnine',
        isVerified: true,
      },
      {
        userId: userMap['synthwave@beatbloom.com'].id,
        username: 'synthwave',
        displayName: 'SynthWave Pro',
        bio: 'Retro-futuristic producer bringing the 80s back with modern production techniques. Specializes in synthwave and electronic music.',
        avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400&q=80',
        coverImage: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=1200&q=80',
        location: 'Los Angeles, CA',
        website: 'https://synthwavepro.com',
        youtube: 'https://youtube.com/@synthwavepro',
        isVerified: true,
      },
      {
        userId: userMap['urbanflow@beatbloom.com'].id,
        username: 'urbanflow',
        displayName: 'UrbanFlow',
        bio: 'Golden era hip hop meets modern production. Creating timeless beats with soul and authenticity.',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
        coverImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&q=80',
        location: 'Brooklyn, NY',
        website: 'https://urbanflow.nyc',
        instagram: 'urbanflow_nyc',
        soundcloud: 'https://soundcloud.com/urbanflow',
        isVerified: true,
      },
      {
        userId: userMap['vibemaster@beatbloom.com'].id,
        username: 'vibemaster',
        displayName: 'VibeMaster',
        bio: 'Experimental producer blending electronic, soul, and R&B. Pushing boundaries with innovative sound design.',
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80',
        coverImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&q=80',
        location: 'London, UK',
        website: 'https://vibemaster.co.uk',
        spotify: 'https://open.spotify.com/artist/vibemaster',
        isVerified: true,
      },
      {
        userId: userMap['shadowprod@beatbloom.com'].id,
        username: 'shadow',
        displayName: 'ShadowProd',
        bio: 'Dark, aggressive production for drill and trap. Working with top artists in the UK drill scene.',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80',
        coverImage: 'https://images.unsplash.com/photo-1504898770365-14faca6a7320?w=1200&q=80',
        location: 'London, UK',
        instagram: 'shadowprod_uk',
        isVerified: true,
      },
      {
        userId: userMap['alex@beatbloom.com'].id,
        username: 'alexproducer',
        displayName: 'Alex Producer',
        bio: 'Independent beatmaker creating unique sounds. Available for custom work.',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
        coverImage: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1200&q=80',
        location: 'Los Angeles, CA',
        website: 'https://beatdrop.com/alexproducer',
        isVerified: false,
      },
    ])
    .returning('*');

  console.log(`✅ Created ${producers.length} producers`);

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
        description: 'Hard-hitting 808s and hi-hats',
        color: '#ea580c',
        slug: 'trap',
        beatCount: 1250,
      },
      {
        name: 'Hip Hop',
        description: 'Classic boom bap and modern hip hop',
        color: '#9333ea',
        slug: 'hip-hop',
        beatCount: 2100,
      },
      {
        name: 'R&B',
        description: 'Smooth contemporary R&B',
        color: '#2563eb',
        slug: 'rnb',
        beatCount: 890,
      },
      {
        name: 'Electronic',
        description: 'EDM, house, and electronic music',
        color: '#059669',
        slug: 'electronic',
        beatCount: 1560,
      },
      {
        name: 'Lo-Fi',
        description: 'Chill lo-fi beats for studying',
        color: '#ca8a04',
        slug: 'lofi',
        beatCount: 720,
      },
      {
        name: 'Pop',
        description: 'Catchy pop instrumentals',
        color: '#db2777',
        slug: 'pop',
        beatCount: 980,
      },
      {
        name: 'Drill',
        description: 'UK and NY drill production',
        color: '#dc2626',
        slug: 'drill',
        beatCount: 650,
      },
      {
        name: 'Synthwave',
        description: 'Retro 80s synth sounds',
        color: '#7c3aed',
        slug: 'synthwave',
        beatCount: 420,
      },
    ])
    .returning('*');

  console.log(`✅ Created ${genres.length} genres`);

  // Map genres by name
  const genreMap = {};
  genres.forEach((g) => {
    genreMap[g.name] = g;
  });

  // ==========================================
  // 4. BEATS
  // ==========================================
  const beats = await knex('beats')
    .insert([
      // CloudNine beats
      {
        producerId: producerMap['cloudnine'].id,
        genreId: genreMap['Trap'].id,
        title: 'Midnight Dreams',
        description:
          'A captivating trap beat with dark, melodic elements and hard-hitting 808s. Perfect for artists looking to create powerful tracks that resonate with listeners.',
        bpm: 140,
        musicalKey: 'Am',
        duration: 204, // 3:24 in seconds
        price: 29.99,
        coverImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80',
        previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        tags: JSON.stringify(['Trap', 'Dark', 'Melodic']),
        plays: 481000,
        likes: 12500,
        sales: 89,
        status: 'active',
        isFeatured: true,
      },
      {
        producerId: producerMap['cloudnine'].id,
        genreId: genreMap['Hip Hop'].id,
        title: 'Urban Legend',
        description:
          'Classic boom bap hip hop with gritty drums and soulful samples. Perfect for conscious rap and storytelling.',
        bpm: 95,
        musicalKey: 'Gm',
        duration: 225,
        price: 24.99,
        coverImage: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=800&q=80',
        previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
        tags: JSON.stringify(['Hip Hop', 'Boom Bap', 'Gritty']),
        plays: 89000,
        likes: 3200,
        sales: 34,
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
        duration: 168,
        price: 24.99,
        coverImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80',
        previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
        tags: JSON.stringify(['LoFi', 'Study', 'Relaxing']),
        plays: 253000,
        likes: 8900,
        sales: 67,
        status: 'active',
        isFeatured: false,
      },
      {
        producerId: producerMap['cloudnine'].id,
        genreId: genreMap['Trap'].id,
        title: 'Cloud Walker',
        description: 'Ethereal melodic trap with heavenly pads floating over punchy drums.',
        bpm: 130,
        musicalKey: 'Gb',
        duration: 235,
        price: 39.99,
        coverImage: 'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=800&q=80',
        previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3',
        tags: JSON.stringify(['Melodic', 'Trap', 'Ethereal']),
        plays: 521000,
        likes: 15600,
        sales: 112,
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
        duration: 175,
        price: 24.99,
        coverImage: 'https://images.unsplash.com/photo-1532767153582-b1a0e5145009?w=800&q=80',
        previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
        tags: JSON.stringify(['LoFi', 'Chill', 'Night']),
        plays: 178000,
        likes: 5400,
        sales: 45,
        status: 'active',
        isFeatured: false,
      },
      // SynthWave Pro beats
      {
        producerId: producerMap['synthwave'].id,
        genreId: genreMap['Synthwave'].id,
        title: 'Neon Horizon',
        description:
          'An energetic synthwave track with retro, upbeat vibes reminiscent of the 80s.',
        bpm: 128,
        musicalKey: 'Cm',
        duration: 252,
        price: 34.99,
        coverImage: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=800&q=80',
        previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
        tags: JSON.stringify(['Synthwave', 'Retro', 'Upbeat']),
        plays: 156000,
        likes: 4800,
        sales: 56,
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
        duration: 216,
        price: 44.99,
        coverImage: 'https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?w=800&q=80',
        previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
        tags: JSON.stringify(['Cyberpunk', 'Industrial', 'Heavy']),
        plays: 107000,
        likes: 3100,
        sales: 38,
        status: 'active',
        isFeatured: false,
      },
      {
        producerId: producerMap['synthwave'].id,
        genreId: genreMap['Synthwave'].id,
        title: 'Tokyo Nights',
        description: 'Neon-drenched synthwave journey through futuristic cityscapes.',
        bpm: 118,
        musicalKey: 'Am',
        duration: 255,
        price: 44.99,
        coverImage: 'https://images.unsplash.com/photo-1480796927426-f609979314bd?w=800&q=80',
        previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3',
        tags: JSON.stringify(['Synthwave', 'Cyberpunk', 'Neon']),
        plays: 312000,
        likes: 9800,
        sales: 78,
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
        duration: 218,
        price: 39.99,
        coverImage: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80',
        previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3',
        tags: JSON.stringify(['Electronic', 'Future', 'Upbeat']),
        plays: 283000,
        likes: 7600,
        sales: 65,
        status: 'active',
        isFeatured: false,
      },
      {
        producerId: producerMap['synthwave'].id,
        genreId: genreMap['Electronic'].id,
        title: 'Interstellar',
        description: 'Epic cinematic production that takes you on a journey through the cosmos.',
        bpm: 135,
        musicalKey: 'Fm',
        duration: 270,
        price: 49.99,
        coverImage: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&q=80',
        previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
        tags: JSON.stringify(['Cinematic', 'Epic', 'Space']),
        plays: 267000,
        likes: 8200,
        sales: 72,
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
        duration: 260,
        price: 34.99,
        coverImage: 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=800&q=80',
        previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
        tags: JSON.stringify(['RnB', 'Chill', 'Smooth']),
        plays: 81000,
        likes: 2900,
        sales: 28,
        status: 'active',
        isFeatured: false,
      },
      {
        producerId: producerMap['urbanflow'].id,
        genreId: genreMap['Hip Hop'].id,
        title: 'Street Dreams',
        description:
          'Emotional rap instrumental featuring beautiful piano melodies over crisp drums.',
        bpm: 88,
        musicalKey: 'Bbm',
        duration: 245,
        price: 54.99,
        coverImage: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800&q=80',
        previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
        tags: JSON.stringify(['Rap', 'Piano', 'Emotional']),
        plays: 74000,
        likes: 2100,
        sales: 22,
        status: 'active',
        isFeatured: false,
      },
      {
        producerId: producerMap['urbanflow'].id,
        genreId: genreMap['Hip Hop'].id,
        title: 'Crown Royal',
        description: 'Luxurious hip hop instrumental with sophisticated piano chords.',
        bpm: 78,
        musicalKey: 'Cm',
        duration: 222,
        price: 49.99,
        coverImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80',
        previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3',
        tags: JSON.stringify(['Hip Hop', 'Luxury', 'Smooth']),
        plays: 245000,
        likes: 7100,
        sales: 58,
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
        duration: 202,
        price: 29.99,
        coverImage: 'https://images.unsplash.com/photo-1485579149621-3123dd979885?w=800&q=80',
        previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        tags: JSON.stringify(['Boom Bap', 'Classic', 'New York']),
        plays: 134000,
        likes: 4200,
        sales: 35,
        status: 'active',
        isFeatured: false,
      },
      // VibeMaster beats
      {
        producerId: producerMap['vibemaster'].id,
        genreId: genreMap['Electronic'].id,
        title: 'Electric Soul',
        description: 'Futuristic electronic production meets soulful melodies.',
        bpm: 128,
        musicalKey: 'Cm',
        duration: 238,
        price: 39.99,
        coverImage: 'https://images.unsplash.com/photo-1614149162883-504ce4d13909?w=800&q=80',
        previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
        tags: JSON.stringify(['Electronic', 'Soul', 'Future']),
        plays: 228000,
        likes: 6700,
        sales: 54,
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
        duration: 232,
        price: 29.99,
        coverImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80',
        previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3',
        tags: JSON.stringify(['RnB', 'Smooth', 'Summer']),
        plays: 198000,
        likes: 5800,
        sales: 47,
        status: 'active',
        isFeatured: false,
      },
      {
        producerId: producerMap['vibemaster'].id,
        genreId: genreMap['R&B'].id,
        title: 'Vintage Soul',
        description: 'Warm vintage soul production with authentic analog textures.',
        bpm: 98,
        musicalKey: 'Bb',
        duration: 248,
        price: 34.99,
        coverImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80',
        previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3',
        tags: JSON.stringify(['Soul', 'Vintage', 'Warm']),
        plays: 167000,
        likes: 4900,
        sales: 41,
        status: 'active',
        isFeatured: false,
      },
      {
        producerId: producerMap['vibemaster'].id,
        genreId: genreMap['Pop'].id,
        title: 'Paradise',
        description: 'Tropical pop production with sunny melodies and bouncy rhythms.',
        bpm: 105,
        musicalKey: 'C',
        duration: 225,
        price: 44.99,
        coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
        previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
        tags: JSON.stringify(['Tropical', 'Pop', 'Summer']),
        plays: 345000,
        likes: 10200,
        sales: 89,
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
        duration: 198,
        price: 39.99,
        coverImage: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&q=80',
        previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
        tags: JSON.stringify(['Drill', 'Dark', 'Hard']),
        plays: 457000,
        likes: 13500,
        sales: 102,
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
        duration: 208,
        price: 34.99,
        coverImage: 'https://images.unsplash.com/photo-1504898770365-14faca6a7320?w=800&q=80',
        previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3',
        tags: JSON.stringify(['Trap', 'Dark', 'Aggressive']),
        plays: 389000,
        likes: 11200,
        sales: 87,
        status: 'active',
        isFeatured: false,
      },
      {
        producerId: producerMap['shadow'].id,
        genreId: genreMap['Drill'].id,
        title: 'Savage Mode',
        description: 'Ruthless UK drill instrumental with sliding 808s and menacing hi-hats.',
        bpm: 155,
        musicalKey: 'Gm',
        duration: 192,
        price: 54.99,
        coverImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
        previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
        tags: JSON.stringify(['Drill', 'UK', 'Hard']),
        plays: 612000,
        likes: 18900,
        sales: 145,
        status: 'active',
        isFeatured: true,
      },
    ])
    .returning('*');

  console.log(`✅ Created ${beats.length} beats`);

  // ==========================================
  // 5. LICENSE TIERS
  // ==========================================
  const licenseTiers = [];

  for (const beat of beats) {
    licenseTiers.push(
      {
        beatId: beat.id,
        tierType: 'mp3',
        name: 'MP3 Lease',
        price: beat.price,
        description: 'Basic license for non-profit use. Includes tagged MP3 file.',
        includedFiles: JSON.stringify(['Tagged MP3 File']),
        isExclusive: false,
        sortOrder: 1,
      },
      {
        beatId: beat.id,
        tierType: 'wav',
        name: 'WAV Lease',
        price: beat.price + 20,
        description: 'Standard lease with untagged MP3 and high-quality WAV files.',
        includedFiles: JSON.stringify(['Untagged MP3 File', 'High-Quality WAV File']),
        isExclusive: false,
        sortOrder: 2,
      },
      {
        beatId: beat.id,
        tierType: 'stems',
        name: 'Trackout',
        price: beat.price + 70,
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
        price: beat.price * 15,
        description: 'Full ownership transfer. Beat will be removed from store after purchase.',
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
  }

  await knex('licenseTiers').insert(licenseTiers);
  console.log(`✅ Created ${licenseTiers.length} license tiers`);

  // ==========================================
  // 6. PLAYLISTS
  // ==========================================
  const artistUser = userMap['artist@beatbloom.com'];

  const playlists = await knex('playlists')
    .insert([
      {
        userId: artistUser.id,
        name: 'Favorites',
        description: 'My favorite beats',
        color: '#ea580c',
        isPublic: false,
        beatCount: 5,
      },
      {
        userId: artistUser.id,
        name: 'Workout Vibes',
        description: 'High energy beats for the gym',
        color: '#22c55e',
        isPublic: true,
        beatCount: 3,
      },
      {
        userId: artistUser.id,
        name: 'Chill Sessions',
        description: 'Lo-fi beats to relax to',
        color: '#3b82f6',
        isPublic: true,
        beatCount: 4,
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
    // Cross-producer likes
    { userId: userMap['cloudnine@beatbloom.com'].id, beatId: beats[5].id },
    { userId: userMap['synthwave@beatbloom.com'].id, beatId: beats[0].id },
    { userId: userMap['urbanflow@beatbloom.com'].id, beatId: beats[14].id },
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
    { followerId: userMap['cloudnine@beatbloom.com'].id, producerId: producerMap['synthwave'].id },
    { followerId: userMap['synthwave@beatbloom.com'].id, producerId: producerMap['shadow'].id },
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
        details: JSON.stringify({
          bankName: 'Chase',
          accountLast4: '4567',
          routingNumber: '****5678',
        }),
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
    ])
    .returning('*');

  console.log(`✅ Created ${payoutMethods.length} payout methods`);

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
        tax: 0,
        total: 29.99,
        status: 'completed',
        paymentMethod: 'paystack',
        paymentReference: 'PSK_123456789',
        paidAt: new Date('2026-01-10'),
      },
      {
        userId: artistUser.id,
        orderNumber: 'BB-2026-0002',
        email: artistUser.email,
        subtotal: 89.97,
        tax: 0,
        total: 89.97,
        status: 'completed',
        paymentMethod: 'paystack',
        paymentReference: 'PSK_123456790',
        paidAt: new Date('2026-01-15'),
      },
    ])
    .returning('*');

  console.log(`✅ Created ${orders.length} orders`);

  // Order items
  const allLicenseTiers = await knex('licenseTiers').select('*');
  const tierMap = {};
  allLicenseTiers.forEach((t) => {
    if (!tierMap[t.beatId]) {tierMap[t.beatId] = {};}
    tierMap[t.beatId][t.tierType] = t;
  });

  const orderItems = await knex('orderItems')
    .insert([
      {
        orderId: orders[0].id,
        beatId: beats[0].id,
        licenseTierId: tierMap[beats[0].id]['mp3'].id,
        beatTitle: beats[0].title,
        producerName: 'CloudNine',
        licenseName: 'MP3 Lease',
        price: 29.99,
        downloadUrl: 'https://storage.beatbloom.com/downloads/beat-1-mp3.zip',
      },
      {
        orderId: orders[1].id,
        beatId: beats[5].id,
        licenseTierId: tierMap[beats[5].id]['wav'].id,
        beatTitle: beats[5].title,
        producerName: 'SynthWave Pro',
        licenseName: 'WAV Lease',
        price: 54.99,
        downloadUrl: 'https://storage.beatbloom.com/downloads/beat-6-wav.zip',
      },
      {
        orderId: orders[1].id,
        beatId: beats[14].id,
        licenseTierId: tierMap[beats[14].id]['mp3'].id,
        beatTitle: beats[14].title,
        producerName: 'VibeMaster',
        licenseName: 'MP3 Lease',
        price: 34.99,
        downloadUrl: 'https://storage.beatbloom.com/downloads/beat-15-mp3.zip',
      },
    ])
    .returning('*');

  console.log(`✅ Created ${orderItems.length} order items`);

  // User purchases
  await knex('userPurchases').insert([
    {
      userId: artistUser.id,
      beatId: beats[0].id,
      orderId: orders[0].id,
      licenseTierId: tierMap[beats[0].id]['mp3'].id,
    },
    {
      userId: artistUser.id,
      beatId: beats[5].id,
      orderId: orders[1].id,
      licenseTierId: tierMap[beats[5].id]['wav'].id,
    },
    {
      userId: artistUser.id,
      beatId: beats[14].id,
      orderId: orders[1].id,
      licenseTierId: tierMap[beats[14].id]['mp3'].id,
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
  ]);

  console.log(`✅ Created producer earning records`);

  // ==========================================
  // 11. PLAY HISTORY
  // ==========================================
  const now = new Date();
  const playHistory = beats.slice(0, 10).map((beat, idx) => ({
    userId: artistUser.id,
    beatId: beat.id,
    playedAt: new Date(now.getTime() - idx * 60000), // Stagger by 1 minute
    duration: Math.floor(Math.random() * 180) + 30, // Random duration 30-210 seconds
    completed: Math.random() > 0.3,
  }));

  await knex('playHistory').insert(playHistory);
  console.log(`✅ Created ${playHistory.length} play history entries`);

  // ==========================================
  // 12. NOTIFICATIONS
  // ==========================================
  await knex('notifications').insert([
    {
      userId: userMap['cloudnine@beatbloom.com'].id,
      type: 'newSale',
      title: 'New Sale!',
      message: 'Someone purchased "Midnight Dreams" for $29.99',
      data: JSON.stringify({ beatId: beats[0].id, orderId: orders[0].id }),
      isRead: true,
      readAt: new Date(),
    },
    {
      userId: userMap['synthwave@beatbloom.com'].id,
      type: 'newFollower',
      title: 'New Follower',
      message: 'Test Artist started following you',
      data: JSON.stringify({ followerId: artistUser.id }),
      isRead: false,
    },
    {
      userId: artistUser.id,
      type: 'systemAlert',
      title: 'Welcome to BeatBloom!',
      message: 'Start discovering amazing beats from top producers.',
      data: JSON.stringify({}),
      isRead: true,
      readAt: new Date(),
    },
  ]);

  console.log(`✅ Created notifications`);

  console.log('\n🎉 Seeding completed successfully!\n');
  console.log('📧 Test accounts (password: Password123!):');
  console.log('   - Admin:    admin@beatbloom.com');
  console.log('   - Producer: cloudnine@beatbloom.com');
  console.log('   - Producer: synthwave@beatbloom.com');
  console.log('   - Producer: urbanflow@beatbloom.com');
  console.log('   - Producer: vibemaster@beatbloom.com');
  console.log('   - Producer: shadowprod@beatbloom.com');
  console.log('   - Producer: alex@beatbloom.com');
  console.log('   - Artist:   artist@beatbloom.com');
};
