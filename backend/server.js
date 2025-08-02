#!/usr/bin/env node
/**
 * EndoCare Backend API
 * Node.js/Express server for endometriosis tracking app with SQLite database
 */

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors()); // Enable CORS for React Native
app.use(express.json()); // Parse JSON requests

// Database file path
const DB_PATH = path.join(__dirname, 'endocare.db');

// Simple logging helper
const log = (message) => {
    console.log(message);
};

// Initialize SQLite database
function initDatabase() {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(DB_PATH, (err) => {
            if (err) {
                reject(err);
                return;
            }
            
            // Create tables
            db.serialize(() => {
                // Sleep logs table
                db.run(`
                    CREATE TABLE IF NOT EXISTS sleep_logs (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        date TEXT NOT NULL,
                        duration REAL NOT NULL,
                        quality INTEGER NOT NULL,
                        disruptions TEXT,
                        notes TEXT,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                    )
                `);
                
                // Diet logs table
                db.run(`
                    CREATE TABLE IF NOT EXISTS diet_logs (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        meal TEXT NOT NULL,
                        date TEXT NOT NULL,
                        items TEXT NOT NULL,
                        notes TEXT,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                    )
                `);
                
                // Menstrual logs table
                db.run(`
                    CREATE TABLE IF NOT EXISTS menstrual_logs (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        period_event TEXT NOT NULL,
                        date TEXT NOT NULL,
                        flow_level TEXT,
                        notes TEXT,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                    )
                `);
                
                // Symptoms logs table
                db.run(`
                    CREATE TABLE IF NOT EXISTS symptoms_logs (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        date TEXT NOT NULL,
                        nausea INTEGER NOT NULL,
                        fatigue INTEGER NOT NULL,
                        pain INTEGER NOT NULL,
                        notes TEXT,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                    )
                `);
            });
            
            db.close((err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    });
}

// Database helper
function getDbConnection() {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(DB_PATH, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve(db);
            }
        });
    });
}

// Promise wrapper for database queries
function dbQuery(db, sql, params = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

function dbRun(db, sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) {
                reject(err);
            } else {
                resolve({ id: this.lastID, changes: this.changes });
            }
        });
    });
}

// ============================================================================
// HEALTH CHECK ENDPOINT
// ============================================================================

app.get('/health', async (req, res) => {
    let db = null;
    try {
        db = await getDbConnection();
        await dbQuery(db, "SELECT 1");
        
        res.json({
            status: 'healthy',
            database: 'connected',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            status: 'unhealthy',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    } finally {
        if (db) db.close();
    }
});

// ============================================================================
// SLEEP ENDPOINTS
// ============================================================================

app.get('/get_all_sleep', async (req, res) => {
    let db = null;
    try {
        db = await getDbConnection();
        const rows = await dbQuery(db, "SELECT * FROM sleep_logs ORDER BY date DESC");
        
        const sleepData = rows.map(row => ({
            id: row.id,
            date: row.date,
            duration: row.duration,
            quality: row.quality,
            disruptions: row.disruptions || '',
            notes: row.notes || ''
        }));
        
        res.json(sleepData);
        
    } catch (error) {
        res.json([]);
    } finally {
        if (db) db.close();
    }
});

app.post('/insert_sleep', async (req, res) => {
    let db = null;
    try {
        const { date, duration, quality, disruptions, notes } = req.body;
        
        // Validate required fields
        if (!date || duration === undefined || quality === undefined) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        db = await getDbConnection();
        const result = await dbRun(db, `
            INSERT INTO sleep_logs (date, duration, quality, disruptions, notes)
            VALUES (?, ?, ?, ?, ?)
        `, [date, duration, quality, disruptions || '', notes || '']);
        
        const response = {
            id: result.id,
            date,
            duration,
            quality,
            disruptions: disruptions || '',
            notes: notes || ''
        };
        
        res.status(201).json(response);
        
    } catch (error) {
        res.status(500).json({ error: 'Failed to insert sleep log' });
    } finally {
        if (db) db.close();
    }
});

// ============================================================================
// DIET ENDPOINTS
// ============================================================================

app.get('/get_all_diet', async (req, res) => {
    let db = null;
    try {
        db = await getDbConnection();
        const rows = await dbQuery(db, "SELECT * FROM diet_logs ORDER BY date DESC");
        
        const dietData = rows.map(row => ({
            id: row.id,
            meal: row.meal,
            date: row.date,
            items: row.items ? row.items.split(',') : [],
            notes: row.notes || ''
        }));
        
        res.json(dietData);
        
    } catch (error) {
        res.json([]);
    } finally {
        if (db) db.close();
    }
});

app.post('/insert_diet', async (req, res) => {
    let db = null;
    try {
        const { meal, date, items, notes } = req.body;
        
        if (!meal || !date || !items) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        db = await getDbConnection();
        const itemsStr = Array.isArray(items) ? items.join(',') : String(items);
        
        const result = await dbRun(db, `
            INSERT INTO diet_logs (meal, date, items, notes)
            VALUES (?, ?, ?, ?)
        `, [meal, date, itemsStr, notes || '']);
        
        const response = {
            id: result.id,
            meal,
            date,
            items: Array.isArray(items) ? items : [items],
            notes: notes || ''
        };
        
        res.status(201).json(response);
        
    } catch (error) {
        res.status(500).json({ error: 'Failed to insert diet log' });
    } finally {
        if (db) db.close();
    }
});

// ============================================================================
// MENSTRUAL ENDPOINTS
// ============================================================================

app.get('/get_all_menstrual', async (req, res) => {
    let db = null;
    try {
        db = await getDbConnection();
        const rows = await dbQuery(db, "SELECT * FROM menstrual_logs ORDER BY date DESC");
        
        const menstrualData = rows.map(row => ({
            id: row.id,
            period_event: row.period_event,
            date: row.date,
            flow_level: row.flow_level || '',
            notes: row.notes || ''
        }));
        
        res.json(menstrualData);
        
    } catch (error) {
        res.json([]);
    } finally {
        if (db) db.close();
    }
});

app.post('/insert_menstrual', async (req, res) => {
    let db = null;
    try {
        const { period_event, date, flow_level, notes } = req.body;
        
        if (!period_event || !date) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        db = await getDbConnection();
        const result = await dbRun(db, `
            INSERT INTO menstrual_logs (period_event, date, flow_level, notes)
            VALUES (?, ?, ?, ?)
        `, [period_event, date, flow_level || '', notes || '']);
        
        const response = {
            id: result.id,
            period_event,
            date,
            flow_level: flow_level || '',
            notes: notes || ''
        };
        
        res.status(201).json(response);
        
    } catch (error) {
        res.status(500).json({ error: 'Failed to insert menstrual log' });
    } finally {
        if (db) db.close();
    }
});

// ============================================================================
// SYMPTOMS ENDPOINTS
// ============================================================================

app.get('/get_all_symptoms', async (req, res) => {
    let db = null;
    try {
        db = await getDbConnection();
        const rows = await dbQuery(db, "SELECT * FROM symptoms_logs ORDER BY date DESC");
        
        const symptomsData = rows.map(row => ({
            id: row.id,
            date: row.date,
            nausea: row.nausea,
            fatigue: row.fatigue,
            pain: row.pain,
            notes: row.notes || ''
        }));
        
        res.json(symptomsData);
        
    } catch (error) {
        res.json([]);
    } finally {
        if (db) db.close();
    }
});

app.post('/insert_symptoms', async (req, res) => {
    let db = null;
    try {
        const { date, nausea, fatigue, pain, notes } = req.body;
        
        if (!date || nausea === undefined || fatigue === undefined || pain === undefined) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        db = await getDbConnection();
        const result = await dbRun(db, `
            INSERT INTO symptoms_logs (date, nausea, fatigue, pain, notes)
            VALUES (?, ?, ?, ?, ?)
        `, [date, nausea, fatigue, pain, notes || '']);
        
        const response = {
            id: result.id,
            date,
            nausea,
            fatigue,
            pain,
            notes: notes || ''
        };
        
        res.status(201).json(response);
        
    } catch (error) {
        res.status(500).json({ error: 'Failed to insert symptoms log' });
    } finally {
        if (db) db.close();
    }
});

// ============================================================================
// START SERVER
// ============================================================================

async function startServer() {
    try {
        // Initialize database
        await initDatabase();
        
        // Start server
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`EndoCare Backend running on http://localhost:${PORT}`);
        });
        
    } catch (error) {
        console.error('Failed to start server:', error.message);
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('Server shutting down...');
    process.exit(0);
});

// Start the server
startServer();