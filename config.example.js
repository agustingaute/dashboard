// ============================================
// Dashboard Configuration - EXAMPLE FILE
// ============================================
// Copy this to config.js and fill in your keys.
// config.js is gitignored so your keys stay private.
//
// Setup steps:
// 1. api-sports.io -> register free -> copy API key -> FOOTBALL_API_KEY
// 2. console.cloud.google.com -> create project -> enable Calendar API
//    -> OAuth consent screen -> create Web app client ID
//    -> authorized origin: http://localhost:8080
//    -> copy Client ID -> GOOGLE_CLIENT_ID
//    -> create API Key -> GOOGLE_API_KEY
// 3. Run: python3 -m http.server 8080 (from this folder)
// 4. Open: http://localhost:8080

const CONFIG = {
  GOOGLE_CLIENT_ID: 'YOUR_CLIENT_ID.apps.googleusercontent.com',
  GOOGLE_API_KEY: 'YOUR_GOOGLE_API_KEY',

  FOOTBALL_API_KEY: 'YOUR_API_FOOTBALL_KEY',

  RIVER_PLATE_TEAM_ID: 541,
  LIGA_PROFESIONAL_LEAGUE_ID: 128,
  FOOTBALL_SEASON: 2025,
};
