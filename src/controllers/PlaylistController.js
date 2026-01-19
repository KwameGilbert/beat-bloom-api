import { PlaylistService } from '../services/PlaylistService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { successResponse } from '../utils/response.js';

/**
 * Playlist Controller
 */
export const PlaylistController = {
  /**
   * List user's playlists
   */
  list: asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const playlists = await PlaylistService.listUserPlaylists(userId);
    return successResponse(res, playlists, 'Playlists retrieved successfully');
  }),

  /**
   * Get playlist detail
   */
  get: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user?.id;
    const playlist = await PlaylistService.getPlaylistDetail(id, userId);
    return successResponse(res, playlist, 'Playlist retrieved successfully');
  }),

  /**
   * Create playlist
   */
  create: asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const playlist = await PlaylistService.createPlaylist(userId, req.body);
    return successResponse(res, playlist, 'Playlist created successfully', {}, 201);
  }),

  /**
   * Update playlist
   */
  update: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const playlist = await PlaylistService.updatePlaylist(id, userId, req.body);
    return successResponse(res, playlist, 'Playlist updated successfully');
  }),

  /**
   * Delete playlist
   */
  delete: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    await PlaylistService.deletePlaylist(id, userId);
    return successResponse(res, null, 'Playlist deleted successfully');
  }),

  /**
   * Add beat to playlist
   */
  addBeat: asyncHandler(async (req, res) => {
    const { id: playlistId } = req.params;
    const { beatId } = req.body;
    const userId = req.user.id;

    await PlaylistService.addBeatToPlaylist(playlistId, userId, beatId);
    return successResponse(res, null, 'Beat added to playlist');
  }),

  /**
   * Remove beat from playlist
   */
  removeBeat: asyncHandler(async (req, res) => {
    const { id: playlistId, beatId } = req.params;
    const userId = req.user.id;

    await PlaylistService.removeBeatFromPlaylist(playlistId, userId, beatId);
    return successResponse(res, null, 'Beat removed from playlist');
  }),
};

export default PlaylistController;
