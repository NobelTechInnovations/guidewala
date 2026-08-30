/**
 * One-time seed for starter blog posts, so /blog isn't empty on first run.
 * Safe to re-run — skips posts whose slug already exists.
 *
 * Usage: npx tsx scripts/seed-blog.ts
 */
import { config as loadEnv } from "dotenv";
import path from "path";
loadEnv({ path: path.resolve(__dirname, "../.env.local") });

import mongoose from "mongoose";
import { BlogPost } from "../src/models";

const POSTS = [
  {
    TITLE: "5 Reasons to Book a Government-Approved Guide in Jaipur",
    SLUG: "government-approved-guide-jaipur",
    EXCERPT:
      "Jaipur's forts and palaces hide centuries of stories — here's why a certified local guide changes how you see the Pink City.",
    COVER_IMAGE: "/assets/img/jaipur.jpg",
    AUTHOR_NAME: "Team Guidewala",
    TAGS: ["Jaipur", "Travel Tips"],
    CONTENT_HTML: `
      <p>Jaipur rewards travelers who go beyond the surface — and nobody does that better than a guide who has spent years walking its forts, bazaars, and havelis.</p>
      <h3>1. Context you won't find on a plaque</h3>
      <p>A good guide connects the dots between Amber Fort's mirror work, the Jal Mahal's engineering, and the royal family's history — turning a photo stop into a story.</p>
      <h3>2. Safety and authenticity</h3>
      <p>Every Guidewala guide carries a valid Ministry of Tourism license, so you know exactly who you're with and that the information is accurate.</p>
      <h3>3. Skip the tourist-trap detours</h3>
      <p>Local guides know which shops are worth a visit and which ones exist purely for commission — and they'll tell you the difference.</p>
      <h3>4. Time saved is time gained</h3>
      <p>A well-paced itinerary means you see the City Palace, Hawa Mahal, and Jantar Mantar in a single day without rushing.</p>
      <h3>5. Fair pay for local experts</h3>
      <p>Booking directly through Guidewala means your guide gets fair, transparent compensation — no middlemen taking a cut.</p>
      <p>Ready to explore the Pink City properly? <a href="/book-guide">Book your Jaipur guide here</a>.</p>
    `,
  },
  {
    TITLE: "Beyond the Taj: A First-Timer's Guide to Agra",
    SLUG: "first-timers-guide-to-agra",
    EXCERPT:
      "The Taj Mahal is only the beginning. Here's what else to see in Agra, and how to make the most of a single day in the city.",
    COVER_IMAGE: "/assets/img/agra.jpg",
    AUTHOR_NAME: "Team Guidewala",
    TAGS: ["Agra", "Travel Tips"],
    CONTENT_HTML: `
      <p>Most visitors come to Agra for one building — but the city holds a lot more Mughal history than the Taj Mahal alone.</p>
      <h3>Agra Fort</h3>
      <p>A red sandstone fortress-palace where Shah Jahan himself was later imprisoned, with a view of the Taj from his window.</p>
      <h3>Itmad-ud-Daulah ("Baby Taj")</h3>
      <p>Often overlooked, this smaller marble tomb predates the Taj Mahal and is considered a draft for its famous inlay work.</p>
      <h3>Fatehpur Sikri</h3>
      <p>A half-day trip from Agra to a UNESCO-listed Mughal city, abandoned not long after it was built due to water shortages.</p>
      <h3>Best time to visit the Taj</h3>
      <p>Early morning, right at sunrise opening — the light is best for photos and the crowds are thinnest.</p>
      <p>Want a guide who knows exactly how to sequence your day? <a href="/book-guide">Book an Agra tour guide</a>.</p>
    `,
  },
];

async function main() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  console.log("✅ MongoDB connected");

  for (const post of POSTS) {
    const exists = await BlogPost.findOne({ SLUG: post.SLUG });
    if (exists) {
      console.log(`  skip (exists): ${post.SLUG}`);
      continue;
    }
    await BlogPost.create({ ...post, IS_PUBLISHED: true, PUBLISHED_ON: new Date() });
    console.log(`  created: ${post.SLUG}`);
  }

  await mongoose.disconnect();
  console.log("✅ Done.");
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
