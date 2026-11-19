require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { initDb } = require("./db");
const employeesRouter = require("./routes/employees");

const app = express();
const PORT = process.env.PORT || 5000;
const origins = (process.env.CORS_ORIGIN || "http://localhost:5173").split(",").map((o) => o.trim());

app.use(cors({ origin: origins }));
app.use(express.json());

app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.use("/employees", employeesRouter);

app.use((_req, res) => res.status(404).json({ message: "Route not found." }));

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  const status = err.status || 500;
  if (status === 500) console.error(err);
  res.status(status).json({ message: status === 500 ? "Internal server error." : err.message });
});

initDb()
  .then(() => app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`)))
  .catch((err) => {
    console.error("Failed to initialise database:", err.message);
    process.exit(1);
  });
