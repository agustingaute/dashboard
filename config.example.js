// ============================================
// Dashboard Configuration - EXAMPLE FILE
// ============================================
// Copy this to config.js and fill in your keys.
// config.js is gitignored so your keys stay private.
//
// Setup steps:
// 1. console.cloud.google.com -> create project -> enable Calendar API
//    -> create API Key -> GOOGLE_API_KEY
//    -> create OAuth Web app client -> GOOGLE_CLIENT_ID
// 2. Run: python3 -m http.server 8080 (from this folder)
// 3. Open: http://localhost:8080

window.CONFIG = {
  GOOGLE_CLIENT_ID: 'YOUR_CLIENT_ID.apps.googleusercontent.com',
  GOOGLE_API_KEY: 'YOUR_GOOGLE_API_KEY',
  RIVER_PLATE_TEAM_ID: 435,
  LIGA_PROFESIONAL_LEAGUE_ID: 128,
  FOOTBALL_SEASON: 2024,
};
