import cron from 'node-cron';
import { logger } from '../config/logger.js';
import { db } from '../config/database.js';

/**
 * Job Registry - stores all registered jobs
 */
const jobRegistry = new Map();

/**
 * Register a cron job
 * @param {string} name - Unique job name
 * @param {string} schedule - Cron expression
 * @param {Function} handler - Job handler function
 * @param {Object} options - Additional options
 */
export const registerJob = (name, schedule, handler, options = {}) => {
  if (jobRegistry.has(name)) {
    logger.warn({ job: name }, 'Job already registered, skipping');
    return;
  }

  const job = cron.schedule(
    schedule,
    async () => {
      const startTime = Date.now();
      logger.info({ job: name }, 'Starting scheduled job');

      try {
        await handler();
        const duration = Date.now() - startTime;
        logger.info({ job: name, duration }, 'Job completed successfully');
      } catch (error) {
        logger.error({ job: name, error: error.message }, 'Job failed');
      }
    },
    {
      scheduled: options.autoStart !== false,
      timezone: options.timezone || 'UTC',
    }
  );

  jobRegistry.set(name, {
    job,
    schedule,
    handler,
    options,
  });

  logger.info({ job: name, schedule }, 'Registered cron job');
};

/**
 * Start all registered jobs
 */
export const startAllJobs = () => {
  for (const [name, { job }] of jobRegistry) {
    job.start();
    logger.info({ job: name }, 'Started job');
  }
};

/**
 * Stop all registered jobs
 */
export const stopAllJobs = () => {
  for (const [name, { job }] of jobRegistry) {
    job.stop();
    logger.info({ job: name }, 'Stopped job');
  }
};

/**
 * Get job status
 */
export const getJobStatus = (name) => {
  const jobInfo = jobRegistry.get(name);
  if (!jobInfo) return null;

  return {
    name,
    schedule: jobInfo.schedule,
    running: jobInfo.job.running,
  };
};

/**
 * Get all jobs status
 */
export const getAllJobsStatus = () => {
  const jobs = [];
  for (const [name, jobInfo] of jobRegistry) {
    jobs.push({
      name,
      schedule: jobInfo.schedule,
      running: jobInfo.job.running,
    });
  }
  return jobs;
};

// ============ EXAMPLE JOBS ============

/**
 * Cleanup expired password reset tokens
 * Runs every hour
 */
export const cleanupExpiredTokens = async () => {
  const result = await db('users')
    .whereNotNull('password_reset_token')
    .where('password_reset_expires', '<', new Date())
    .update({
      password_reset_token: null,
      password_reset_expires: null,
    });

  logger.info({ count: result }, 'Cleaned up expired password reset tokens');
};

/**
 * Cleanup soft-deleted records older than 30 days
 * Runs daily at midnight
 */
export const cleanupDeletedRecords = async () => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Add more tables as needed
  const tables = ['users'];

  for (const table of tables) {
    const result = await db(table)
      .whereNotNull('deleted_at')
      .where('deleted_at', '<', thirtyDaysAgo)
      .del();

    if (result > 0) {
      logger.info({ table, count: result }, 'Permanently deleted old records');
    }
  }
};

/**
 * Cleanup token tables (verification, reset, blacklist)
 * Runs every hour
 */
export const cleanupTokens = async () => {
  const { tokenService } = await import('../services/TokenService.js');
  const result = await tokenService.cleanup();

  if (result.deletedTokens > 0 || result.deletedBlacklist > 0) {
    logger.info(result, 'Cleaned up token tables');
  }
};

/**
 * Initialize and register all jobs
 */
export const initializeJobs = () => {
  // Cleanup expired password reset tokens every hour (legacy)
  registerJob('cleanup-expired-tokens', '0 * * * *', cleanupExpiredTokens);

  // Cleanup token tables every hour
  registerJob('cleanup-token-tables', '30 * * * *', cleanupTokens);

  // Cleanup deleted records daily at midnight
  registerJob('cleanup-deleted-records', '0 0 * * *', cleanupDeletedRecords);

  logger.info('All cron jobs initialized');
};

export default {
  registerJob,
  startAllJobs,
  stopAllJobs,
  getJobStatus,
  getAllJobsStatus,
  initializeJobs,
};
