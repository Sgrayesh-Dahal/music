
const fs = require("fs");
const admin = require("firebase-admin");

// Load old playlist
let oldList = [];
try {
  oldList = JSON.parse(fs.readFileSync("old.json"));
} catch {}

// Load new playlist
let newList = [];
try {
  newList = JSON.parse(fs.readFileSync("playlists.json"));
} catch {}

// Convert base64 service account
const key = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT, "base64").toString("utf8");
const serviceAccount = JSON.parse(key);

// Init Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Detect new items (checks by "id")
const oldIds = new Set(oldList.map(item => item.id));
const added = newList.filter(item => !oldIds.has(item.id));

console.log("Added:", added);

if (added.length === 0) {
  console.log("No new music");
  process.exit(0);
}

// Pick first new item
const first = added[0];

// FCM message
const message = {
  notification: {
    title: "New Music Added!",
    body: `${first.title} - ${first.artist ?? ""}`
  },
  topic: "new-music"
};

// Send FCM
admin.messaging().send(message)
  .then(res => console.log("Sent:", res))
  .catch(err => console.error(err));
