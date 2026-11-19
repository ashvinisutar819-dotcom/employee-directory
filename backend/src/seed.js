require("dotenv").config();

const { pool, initDb } = require("./db");

const PEOPLE = [
  ["Aarav Sharma", "aarav.sharma@company.com", "Software Engineer"],
  ["Priya Nair", "priya.nair@company.com", "Product Manager"],
  ["Rohan Mehta", "rohan.mehta@company.com", "UI/UX Designer"],
  ["Ananya Iyer", "ananya.iyer@company.com", "Software Engineer"],
  ["Vikram Singh", "vikram.singh@company.com", "DevOps Engineer"],
  ["Sneha Kulkarni", "sneha.kulkarni@company.com", "QA Engineer"],
  ["Arjun Reddy", "arjun.reddy@company.com", "Data Analyst"],
  ["Meera Joshi", "meera.joshi@company.com", "HR Manager"],
  ["Karan Patel", "karan.patel@company.com", "Software Engineer"],
  ["Divya Menon", "divya.menon@company.com", "Product Manager"],
  ["Rahul Verma", "rahul.verma@company.com", "Engineering Manager"],
  ["Isha Gupta", "isha.gupta@company.com", "UI/UX Designer"],
];

(async () => {
  await initDb();
  for (const [name, email, role] of PEOPLE) {
    await pool.query(
      "INSERT INTO employees (name, email, role) VALUES ($1, $2, $3) ON CONFLICT (email) DO NOTHING",
      [name, email, role]
    );
  }
  console.log(`Seeded ${PEOPLE.length} sample employees.`);
  await pool.end();
})().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
