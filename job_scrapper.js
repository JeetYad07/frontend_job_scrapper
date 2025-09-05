import fetch from "node-fetch";
import nodemailer from "nodemailer";

const companies = ["stripe", "coinbase", "doordash"]; // Greenhouse boards
const keywords = [
  "frontend",
  "backend",
  "fullstack",
  "react",
  "typescript",
  "javascript",
  "node",
  "html",
  "css",
  "software engineer",
  "developer",
  "python",
  "java",
  "springboot",
  "sql",
  "nosql"
];

async function fetchJobs() {
  let jobsFound = [];

  for (const company of companies) {
    const url = `https://boards-api.greenhouse.io/v1/boards/${company}/jobs`;
    try {
      const res = await fetch(url);
      const data = await res.json();

      for (const job of data.jobs || []) {
        const title = job.title.toLowerCase();
        const desc = (job.content || "").toLowerCase();

        console.log(`🔎 Checking: ${job.title} @ ${company}`);

        if (keywords.some((kw) => title.includes(kw) || desc.includes(kw))) {
          const jobInfo = `${job.title} @ ${company} - ${job.absolute_url}`;
          console.log(`✅ MATCHED: ${jobInfo}`);
          jobsFound.push(jobInfo);
        } else {
          console.log(`❌ Skipped: ${job.title}`);
        }
      }
    } catch (err) {
      console.error(`Error fetching ${company}:`, err);
    }
  }
  return jobsFound;
}

async function sendEmail(jobs) {
  const body = jobs.length
    ? `Hi Jeet,\n\nHere are today's matching jobs:\n\n${jobs.join("\n")}`
    : "No matching jobs today.";

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER, // Gmail (App Password)
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Job Bot 🤖" <${process.env.EMAIL_USER}>`,
    to: process.env.TO_EMAIL,
    subject: "Daily Frontend/Backend Jobs Digest",
    text: body,
  });

  console.log("📧 Email sent!");
}

(async () => {
  const jobs = await fetchJobs();
  await sendEmail(jobs);
})();
