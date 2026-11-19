const express = require("express");
const { pool } = require("../db");

const router = express.Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UNIQUE_VIOLATION = "23505";

// Whitelist of sortable columns (never interpolate user input into SQL).
const SORT_COLUMNS = { name: "LOWER(name)", role: "LOWER(role)", created_at: "created_at" };

function httpError(status, message) {
  return Object.assign(new Error(message), { status });
}

/** Returns a cleaned payload or throws a 400 error. */
function validate(body = {}) {
  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const role = String(body.role ?? "").trim();

  if (!name || !email || !role) {
    throw httpError(400, "Name, email and role are required.");
  }
  if (name.length > 100 || role.length > 100) {
    throw httpError(400, "Name and role must be 100 characters or fewer.");
  }
  if (!EMAIL_RE.test(email) || email.length > 255) {
    throw httpError(400, "Please provide a valid email address.");
  }
  return { name, email, role };
}

/** Wraps async handlers and maps DB errors to HTTP errors. */
const handle = (fn) => async (req, res, next) => {
  try {
    await fn(req, res);
  } catch (err) {
    if (err.code === UNIQUE_VIOLATION) {
      return next(httpError(409, "An employee with this email already exists."));
    }
    next(err);
  }
};

function parseId(value) {
  const id = Number(value);
  if (!Number.isInteger(id) || id < 1) throw httpError(400, "Invalid employee id.");
  return id;
}

// GET /employees?search=&role=&sort=&order=&page=&limit=
router.get(
  "/",
  handle(async (req, res) => {
    const search = String(req.query.search ?? "").trim();
    const role = String(req.query.role ?? "").trim();
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
    const sortColumn = SORT_COLUMNS[req.query.sort] ?? SORT_COLUMNS.created_at;
    const direction = req.query.order === "asc" ? "ASC" : "DESC";
    const pattern = `%${search.replace(/[%_\\]/g, "\\$&")}%`;

    const where = "WHERE name ILIKE $1 AND ($2 = '' OR role = $2)";

    const [{ rows }, count] = await Promise.all([
      pool.query(
        `SELECT id, name, email, role, created_at
           FROM employees
           ${where}
          ORDER BY ${sortColumn} ${direction}, id DESC
          LIMIT $3 OFFSET $4`,
        [pattern, role, limit, (page - 1) * limit]
      ),
      pool.query(`SELECT COUNT(*)::int AS total FROM employees ${where}`, [pattern, role]),
    ]);

    const total = count.rows[0].total;
    res.json({ data: rows, total, page, limit, totalPages: Math.max(Math.ceil(total / limit), 1) });
  })
);

// GET /employees/meta  -> dashboard stats + distinct roles
router.get(
  "/meta",
  handle(async (_req, res) => {
    const [roles, recent] = await Promise.all([
      pool.query("SELECT role, COUNT(*)::int AS count FROM employees GROUP BY role ORDER BY count DESC, role"),
      pool.query("SELECT COUNT(*)::int AS recent FROM employees WHERE created_at > NOW() - INTERVAL '7 days'"),
    ]);
    const total = roles.rows.reduce((sum, r) => sum + r.count, 0);
    res.json({ total, recent: recent.rows[0].recent, roles: roles.rows });
  })
);

// POST /employees
router.post(
  "/",
  handle(async (req, res) => {
    const { name, email, role } = validate(req.body);
    const { rows } = await pool.query(
      "INSERT INTO employees (name, email, role) VALUES ($1, $2, $3) RETURNING *",
      [name, email, role]
    );
    res.status(201).json(rows[0]);
  })
);

// PUT /employees/:id
router.put(
  "/:id",
  handle(async (req, res) => {
    const id = parseId(req.params.id);
    const { name, email, role } = validate(req.body);
    const { rows } = await pool.query(
      "UPDATE employees SET name = $1, email = $2, role = $3 WHERE id = $4 RETURNING *",
      [name, email, role, id]
    );
    if (!rows.length) throw httpError(404, "Employee not found.");
    res.json(rows[0]);
  })
);

// DELETE /employees/:id
router.delete(
  "/:id",
  handle(async (req, res) => {
    const id = parseId(req.params.id);
    const { rowCount } = await pool.query("DELETE FROM employees WHERE id = $1", [id]);
    if (!rowCount) throw httpError(404, "Employee not found.");
    res.status(204).end();
  })
);

module.exports = router;
