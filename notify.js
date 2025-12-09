
const fs = require("fs");
const admin = require("firebase-admin");

// Load Firebase service account from GitHub secret
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

// Read old + new playlists
const oldData = JSON.parse(fs.readFileSync("old_playlists.json", "utf8"));
const newData = JSON.parse(fs.readFileSync("playlists.json", "utf8"));

// Compare data
if (JSON.stringify(oldData) === JSON.stringify(newData)) {
    console.log("No changes detected. No notification sent.");
    process.exit(0);
}

// Send notification
admin.messaging().send({
    topic: "new_music",
    notification: {
        title: "Playlist Updated 🎶",
        body: "New music added!",
    }
})
.then(() => console.log("Notification sent!"))
.catch(err => console.error("FCM ERROR:", err));

// Save new version
fs.writeFileSync("old_playlists.json", JSON.stringify(newData, null, 2));
