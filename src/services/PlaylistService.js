import { db } from '../config/database.js';
import { NotFoundError, ForbiddenError } from '../utils/errors.js';

/**
 * Playlist Service
 */
export const PlaylistService = {
  /**
   * List user's playlists
   */
  async listUserPlaylists(userId) {
    return db('playlists').where('userId', userId).orderBy('updatedAt', 'desc');
  },

  /**
   * Get playlist details including beats
   */
  async getPlaylistDetail(playlistId, userId) {
    const playlist = await db('playlists').where('id', playlistId).first();

    if (!playlist) {
      throw new NotFoundError('Playlist not found');
    }

    // Check visibility
    if (!playlist.isPublic && playlist.userId !== userId) {
      throw new ForbiddenError('This playlist is private');
    }

    const beats = await db('beats')
      .select(
        'beats.*',
        'producers.displayName as producerName',
        'producers.username as producerUsername',
        'genres.name as genreName'
      )
      .join('playlistBeats', 'beats.id', 'playlistBeats.beatId')
      .leftJoin('producers', 'beats.producerId', 'producers.id')
      .leftJoin('genres', 'beats.genreId', 'genres.id')
      .where('playlistBeats.playlistId', playlistId)
      .orderBy('playlistBeats.position', 'asc');

    return {
      ...playlist,
      beats,
    };
  },

  /**
   * Create a new playlist
   */
  async createPlaylist(userId, data) {
    const [id] = await db('playlists')
      .insert({
        userId,
        name: data.name,
        description: data.description,
        color: data.color || 'bg-orange-500',
        isPublic: data.isPublic || false,
      })
      .returning('id');

    return this.getPlaylistDetail(id, userId);
  },

  /**
   * Update playlist
   */
  async updatePlaylist(playlistId, userId, data) {
    const playlist = await db('playlists').where({ id: playlistId, userId }).first();

    if (!playlist) {
      throw new NotFoundError('Playlist not found or you do not have permission');
    }

    await db('playlists').where('id', playlistId).update({
      name: data.name,
      description: data.description,
      color: data.color,
      isPublic: data.isPublic,
      updatedAt: new Date(),
    });

    return this.getPlaylistDetail(playlistId, userId);
  },

  /**
   * Delete playlist
   */
  async deletePlaylist(playlistId, userId) {
    const deleted = await db('playlists').where({ id: playlistId, userId }).del();

    return deleted > 0;
  },

  /**
   * Add beat to playlist
   */
  async addBeatToPlaylist(playlistId, userId, beatId) {
    const playlist = await db('playlists').where({ id: playlistId, userId }).first();

    if (!playlist) {
      throw new NotFoundError('Playlist not found');
    }

    // Get max position
    const lastPos = await db('playlistBeats')
      .where('playlistId', playlistId)
      .max('position as maxPos')
      .first();

    const position = (lastPos.maxPos || 0) + 1;

    await db('playlistBeats').insert({
      playlistId,
      beatId,
      position,
    });

    // Update beat count
    await db('playlists').where('id', playlistId).increment('beatsCount', 1);

    return true;
  },

  /**
   * Remove beat from playlist
   */
  async removeBeatFromPlaylist(playlistId, userId, beatId) {
    const playlist = await db('playlists').where({ id: playlistId, userId }).first();

    if (!playlist) {
      throw new NotFoundError('Playlist not found');
    }

    const deleted = await db('playlistBeats').where({ playlistId, beatId }).del();

    if (deleted > 0) {
      await db('playlists').where('id', playlistId).decrement('beatsCount', 1);
    }

    return deleted > 0;
  },
};

export default PlaylistService;
