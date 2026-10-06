const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const config = require('../config');

// Ensure data directory exists
const dataDir = path.dirname(config.DB_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Ensure uploads directory exists
if (!fs.existsSync(config.UPLOAD_DIR)) {
  fs.mkdirSync(config.UPLOAD_DIR, { recursive: true });
}

let dbInstance = null;

function getDb() {
  if (dbInstance) return dbInstance;

  try {
    dbInstance = new Database(config.DB_FILE);
    dbInstance.pragma('foreign_keys = ON');
    dbInstance.pragma('journal_mode = WAL');
    return dbInstance;
  } catch (error) {
    console.error('Failed to initialize SQLite database:', error);
    throw error;
  }
}

/**
 * Execute raw SQL script
 */
function execScript(sql) {
  const db = getDb();
  return db.exec(sql);
}

/**
 * Run a single parameter query (INSERT, UPDATE, DELETE)
 * Returns { changes, lastInsertRowid }
 */
function run(sql, params = []) {
  const db = getDb();
  const stmt = db.prepare(sql);
  return stmt.run(params);
}

/**
 * Get a single row
 */
function get(sql, params = []) {
  const db = getDb();
  const stmt = db.prepare(sql);
  return stmt.get(params);
}

/**
 * Get all matching rows
 */
function all(sql, params = []) {
  const db = getDb();
  const stmt = db.prepare(sql);
  return stmt.all(params);
}

/**
 * Transaction helper
 */
function transaction(fn) {
  const db = getDb();
  return db.transaction(fn);
}

/**
 * Initialize Schema
 */
function initSchema() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  execScript(schemaSql);
  console.log('[DB] Schema initialized successfully');
}

module.exports = {
  getDb,
  run,
  get,
  all,
  execScript,
  transaction,
  initSchema
};
