import { env } from './env.js';

// OAuth Configuration
const oauthConfig = {
  oauth: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      redirectUri:
        env.GOOGLE_REDIRECT_URI ||
        `${env.APP_URL || 'http://localhost:3000'}/api/auth/google/callback`,
    },
    frontendUrl: env.FRONTEND_URL,
  },
};

export default oauthConfig;