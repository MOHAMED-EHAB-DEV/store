import { Client } from "@upstash/qstash";

async function setupSchedules() {
  const token = process.env.QSTASH_TOKEN;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://my-store.vercel.app";

  if (!token) {
    console.error("❌ QSTASH_TOKEN is missing in environment variables.");
    process.exit(1);
  }

  const client = new Client({ token });

  console.log(`🚀 Setting up QStash schedules for ${baseUrl}...`);

  try {
    // 1. Flush tracking every 5 minutes
    const trackingSchedule = await client.schedules.create({
      destination: `${baseUrl}/api/cron/flush-tracking`,
      cron: "*/5 * * * *",
    });
    console.log("✅ Created tracking flush schedule (every 5 min):", trackingSchedule.scheduleId);

    // 2. Flush Web Vitals every 10 minutes
    const vitalsSchedule = await client.schedules.create({
      destination: `${baseUrl}/api/cron/flush-vitals`,
      cron: "*/10 * * * *",
    });
    console.log("✅ Created vitals flush schedule (every 10 min):", vitalsSchedule.scheduleId);

    // 3. Flush API metrics every 10 minutes
    const metricsSchedule = await client.schedules.create({
      destination: `${baseUrl}/api/cron/flush-metrics`,
      cron: "*/10 * * * *",
    });
    console.log("✅ Created API metrics flush schedule (every 10 min):", metricsSchedule.scheduleId);

    console.log("🎉 All QStash schedules registered successfully!");
  } catch (error) {
    console.error("❌ Failed to set up QStash schedules:", error);
    process.exit(1);
  }
}

setupSchedules();
