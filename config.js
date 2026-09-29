/* ============================================================
   MARRIAGE INVITATION — CONFIGURATION

   ┌──────────────────────────────────────────────────────────┐
   │  PER-CLIENT SALE WORKFLOW                                │
   │  Everything you touch for a new client lives in the      │
   │  "EDIT PER CLIENT" block below: names, date/time,         │
   │  photos, and venue/address. That's it.                   │
   │                                                            │
   │  Everything under "TEMPLATE COPY" further down is         │
   │  pre-written to work for any couple — leave it alone.     │
   │  (You CAN still edit it for a client who wants custom     │
   │  wording, it just isn't required.)                        │
   └──────────────────────────────────────────────────────────┘
   ============================================================ */

const INVITE_CONFIG = {

    // ============================================================
    // 1) EDIT PER CLIENT — this is the whole sale workflow
    // ============================================================

    // Names
    groomName: "Abhishek",
    brideName: "Vaishnavi",

    // Date & time
    eventDate: "2026-11-15",     // YYYY-MM-DD
    eventTime: "07:00 PM",       // HH:MM AM/PM

    // Photos — only 6 files needed for the whole site:
    //   1 couple photo (used for both the opening and closing scene)
    //   1 venue photo
    //   4 gallery photos
    // Drop client photos into /assets using these exact filenames
    // and you don't need to touch this config at all for photos.
    photos: {
        couple: "assets/couple.jpg",
        venue: "assets/venue.jpg",
        gallery: [
            "assets/photo1.jpg",
            "assets/photo2.jpg",
            "assets/photo3.jpg",
            "assets/photo4.jpg",
            "assets/photo5.jpg"
        ]
    },

    // Venue / address
    venue: {
        name: "A G S CONVENTION",
        address: "Chevella, Telangana, India 501503",
        mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3809.181415641421!2d78.15969679999999!3d17.3067939!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcbc3000dda2f35%3A0x54ef1fb201efb83f!2sA%20G%20S%20CONVENTION!5e0!3m2!1sen!2sin!4v1790521082001!5m2!1sen!2sin"
    },

    // Ceremony schedule — only the dates/times/venue names are
    // client-specific; the event titles + one-line descriptions
    // below are already generic. Add/remove entries freely.
    events: [
        { name: "Engagement", date: "2026-10-16", time: "", venue: "VINAY BANQUET HALL A/C" },
        { name: "Pasupu Muhurtham", date: "2026-11-11", time: "", venue: "" },
        { name: "Haldi", date: "2026-11-13", time: "", venue: "Sai Nature Farm Moinabad" },
        { name: "Mehndi", date: "2026-11-13", time: "", venue: "Sai Nature Farm Moinabad" },
        { name: "Pochamma Naagulu", date: "2026-11-14", time: "", venue: "Sai Nature Farm Moinabad" },
        { name: "Kotnam", date: "2026-11-14", time: "", venue: "Sai Nature Farm Moinabad" },
        { name: "Wedding", date: "2026-11-15", time: "", venue: "A G S CONVENTION" },
        { name: "Reception", date: "2026-11-18", time: "", venue: "" }
    ],

    // Visual style — a business choice, not text. Pick whichever
    // mood fits the client; the copy below never needs to change.
    style: "royal",           // royal | cinematic | editorial
    theme: { preset: "imperialGold" }, // imperialGold | noirCinema | blushEditorial (matched to style above)


    // ============================================================
    // 2) TEMPLATE COPY — universal, pre-written, safe to leave as-is
    // ============================================================

    gate: {
        eyebrow: "The Wedding Of",
        buttonLabel: "Open Invitation"
    },

    hero: {
        subtitle: "Together with their families"
    },

    invitation: [
        "Join us to celebrate the union of love and commitment.",
        "We would be delighted to have you share in our joy as we embark on this beautiful journey together."
    ],

    countdown: { enabled: true },

    // Personal love-story text is the one section that genuinely
    // can't be "universal" — it's off by default so you never have
    // to write custom copy. Flip enabled:true and fill it in only
    // for clients who specifically want that section.
    story: {
        enabled: false,
        title: "Our Story",
        intro: "Every love story is beautiful, but ours is our favorite.",
        milestones: [
            { date: "2019", text: "We met and fell in love over shared dreams and laughter." },
            { date: "2025", text: "He got down on one knee, and she said yes without a moment's hesitation." }
        ],
        closing: "And now, we're excited to start our forever together."
    },

    music: {
        enabled: true,
        file: "assets/music.mp3"
    },

    finalScene: {
        message: "We can't wait to celebrate with you."
    },

    autoProgress: {
        enabled: true    // stops permanently the instant guest touches/scrolls/types
    }
};