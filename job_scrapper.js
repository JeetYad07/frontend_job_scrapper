import fetch from "node-fetch";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

// Load .env variables
dotenv.config();

const companies = ["stripe", "coinbase", "doordash"]; // Greenhouse boards
const keywords = [
  "frontend", "react", "typescript", "node", "javascript",
  "html", "css", "java", "backend", "sql", "nosql",
  "springboot", "python", "sales"
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

        if (keywords.some((kw) => title.includes(kw) || desc.includes(kw))) {
          jobsFound.push(`${job.title} @ ${company} - ${job.absolute_url}`);
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
    ? `Hi Jeet,\n\nHere are today's frontend jobs:\n\n${jobs.join("\n")}`
    : "No matching jobs today.";

  // Debug env variables
  console.log("USER:", process.env.EMAIL_USER);
  console.log("PASS exists:", !!process.env.EMAIL_PASS);
  console.log("TO:", process.env.TO_EMAIL);

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // Gmail App Password
    },
  });

  await transporter.sendMail({
    from: `"Job Bot 🤖" <${process.env.EMAIL_USER}>`,
    to: process.env.TO_EMAIL,
    subject: "Daily Frontend Jobs Digest",
    text: body,
  });

  console.log("✅ Email sent to Jeet!");
}

(async () => {
  const jobs = await fetchJobs();
  await sendEmail(jobs);
})();
