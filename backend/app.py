#!/usr/bin/env python3
"""
EndoCare Backend API
Flask server for endometriosis tracking app with SQLite database
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3
import logging
import traceback
from datetime import datetime
import os

# Set up Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for React Native

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Database file path
DB_PATH = 'endocare.db'

def init_database():
    """Initialize SQLite database with required tables"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Sleep logs table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS sleep_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT NOT NULL,
            duration REAL NOT NULL,
            quality INTEGER NOT NULL,
            disruptions TEXT,
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Diet logs table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS diet_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            meal TEXT NOT NULL,
            date TEXT NOT NULL,
            items TEXT NOT NULL,
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Menstrual logs table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS menstrual_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            period_event TEXT NOT NULL,
            date TEXT NOT NULL,
            flow_level TEXT,
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Symptoms logs table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS symptoms_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT NOT NULL,
            nausea INTEGER NOT NULL,
            fatigue INTEGER NOT NULL,
            pain INTEGER NOT NULL,
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()
    conn.close()
    logger.info("Database initialized successfully")

def get_db_connection():
    """Get database connection with proper error handling"""
    try:
        conn = sqlite3.connect(DB_PATH, timeout=20)
        conn.row_factory = sqlite3.Row  # For dict-like access
        return conn
    except Exception as e:
        logger.error(f"Database connection failed: {e}")
        raise

# ============================================================================
# HEALTH CHECK ENDPOINT
# ============================================================================

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint to test connectivity"""
    try:
        # Test database connection
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT 1")
        conn.close()
        
        return jsonify({
            'status': 'healthy',
            'database': 'connected',
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return jsonify({
            'status': 'unhealthy',
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

# ============================================================================
# SLEEP ENDPOINTS
# ============================================================================

@app.route('/get_all_sleep', methods=['GET'])
def get_all_sleep():
    """Get all sleep logs"""
    conn = None
    try:
        logger.info("GET /get_all_sleep - Starting request")
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM sleep_logs ORDER BY date DESC")
        rows = cursor.fetchall()
        
        sleep_data = []
        for row in rows:
            sleep_data.append({
                'id': row['id'],
                'date': row['date'],
                'duration': row['duration'],
                'quality': row['quality'],
                'disruptions': row['disruptions'] if row['disruptions'] else '',
                'notes': row['notes'] if row['notes'] else ''
            })
        
        logger.info(f"GET /get_all_sleep - Success: {len(sleep_data)} records")
        return jsonify(sleep_data)
        
    except Exception as e:
        logger.error(f"Error in get_all_sleep: {e}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        return jsonify([])  # Return empty array instead of error
        
    finally:
        if conn:
            conn.close()

@app.route('/insert_sleep', methods=['POST'])
def insert_sleep():
    """Insert new sleep log"""
    conn = None
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['date', 'duration', 'quality', 'disruptions', 'notes']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing field: {field}'}), 400
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO sleep_logs (date, duration, quality, disruptions, notes)
            VALUES (?, ?, ?, ?, ?)
        ''', (data['date'], data['duration'], data['quality'], 
              data['disruptions'], data['notes']))
        
        conn.commit()
        
        # Return the inserted record
        new_id = cursor.lastrowid
        cursor.execute("SELECT * FROM sleep_logs WHERE id = ?", (new_id,))
        row = cursor.fetchone()
        
        result = {
            'id': row['id'],
            'date': row['date'],
            'duration': row['duration'],
            'quality': row['quality'],
            'disruptions': row['disruptions'],
            'notes': row['notes']
        }
        
        logger.info(f"POST /insert_sleep - Success: inserted ID {new_id}")
        return jsonify(result), 201
        
    except Exception as e:
        logger.error(f"Error in insert_sleep: {e}")
        return jsonify({'error': 'Failed to insert sleep log'}), 500
    finally:
        if conn:
            conn.close()

# ============================================================================
# DIET ENDPOINTS
# ============================================================================

@app.route('/get_all_diet', methods=['GET'])
def get_all_diet():
    """Get all diet logs"""
    conn = None
    try:
        logger.info("GET /get_all_diet - Starting request")
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM diet_logs ORDER BY date DESC")
        rows = cursor.fetchall()
        
        diet_data = []
        for row in rows:
            # Parse items back to array (stored as JSON string)
            items = row['items'].split(',') if row['items'] else []
            diet_data.append({
                'id': row['id'],
                'meal': row['meal'],
                'date': row['date'],
                'items': items,
                'notes': row['notes'] if row['notes'] else ''
            })
        
        logger.info(f"GET /get_all_diet - Success: {len(diet_data)} records")
        return jsonify(diet_data)
        
    except Exception as e:
        logger.error(f"Error in get_all_diet: {e}")
        return jsonify([])
        
    finally:
        if conn:
            conn.close()

@app.route('/insert_diet', methods=['POST'])
def insert_diet():
    """Insert new diet log"""
    conn = None
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['meal', 'date', 'items', 'notes']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing field: {field}'}), 400
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Convert items array to comma-separated string
        items_str = ','.join(data['items']) if isinstance(data['items'], list) else str(data['items'])
        
        cursor.execute('''
            INSERT INTO diet_logs (meal, date, items, notes)
            VALUES (?, ?, ?, ?)
        ''', (data['meal'], data['date'], items_str, data['notes']))
        
        conn.commit()
        
        # Return the inserted record
        new_id = cursor.lastrowid
        result = {
            'id': new_id,
            'meal': data['meal'],
            'date': data['date'],
            'items': data['items'],
            'notes': data['notes']
        }
        
        logger.info(f"POST /insert_diet - Success: inserted ID {new_id}")
        return jsonify(result), 201
        
    except Exception as e:
        logger.error(f"Error in insert_diet: {e}")
        return jsonify({'error': 'Failed to insert diet log'}), 500
    finally:
        if conn:
            conn.close()

# ============================================================================
# MENSTRUAL ENDPOINTS
# ============================================================================

@app.route('/get_all_menstrual', methods=['GET'])
def get_all_menstrual():
    """Get all menstrual logs"""
    conn = None
    try:
        logger.info("GET /get_all_menstrual - Starting request")
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM menstrual_logs ORDER BY date DESC")
        rows = cursor.fetchall()
        
        menstrual_data = []
        for row in rows:
            menstrual_data.append({
                'id': row['id'],
                'period_event': row['period_event'],
                'date': row['date'],
                'flow_level': row['flow_level'] if row['flow_level'] else '',
                'notes': row['notes'] if row['notes'] else ''
            })
        
        logger.info(f"GET /get_all_menstrual - Success: {len(menstrual_data)} records")
        return jsonify(menstrual_data)
        
    except Exception as e:
        logger.error(f"Error in get_all_menstrual: {e}")
        return jsonify([])
        
    finally:
        if conn:
            conn.close()

@app.route('/insert_menstrual', methods=['POST'])
def insert_menstrual():
    """Insert new menstrual log"""
    conn = None
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['period_event', 'date', 'flow_level', 'notes']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing field: {field}'}), 400
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO menstrual_logs (period_event, date, flow_level, notes)
            VALUES (?, ?, ?, ?)
        ''', (data['period_event'], data['date'], data['flow_level'], data['notes']))
        
        conn.commit()
        
        # Return the inserted record
        new_id = cursor.lastrowid
        result = {
            'id': new_id,
            'period_event': data['period_event'],
            'date': data['date'],
            'flow_level': data['flow_level'],
            'notes': data['notes']
        }
        
        logger.info(f"POST /insert_menstrual - Success: inserted ID {new_id}")
        return jsonify(result), 201
        
    except Exception as e:
        logger.error(f"Error in insert_menstrual: {e}")
        return jsonify({'error': 'Failed to insert menstrual log'}), 500
    finally:
        if conn:
            conn.close()

# ============================================================================
# SYMPTOMS ENDPOINTS
# ============================================================================

@app.route('/get_all_symptoms', methods=['GET'])
def get_all_symptoms():
    """Get all symptoms logs"""
    conn = None
    try:
        logger.info("GET /get_all_symptoms - Starting request")
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM symptoms_logs ORDER BY date DESC")
        rows = cursor.fetchall()
        
        symptoms_data = []
        for row in rows:
            symptoms_data.append({
                'id': row['id'],
                'date': row['date'],
                'nausea': row['nausea'],
                'fatigue': row['fatigue'],
                'pain': row['pain'],
                'notes': row['notes'] if row['notes'] else ''
            })
        
        logger.info(f"GET /get_all_symptoms - Success: {len(symptoms_data)} records")
        return jsonify(symptoms_data)
        
    except Exception as e:
        logger.error(f"Error in get_all_symptoms: {e}")
        return jsonify([])
        
    finally:
        if conn:
            conn.close()

@app.route('/insert_symptoms', methods=['POST'])
def insert_symptoms():
    """Insert new symptoms log"""
    conn = None
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['date', 'nausea', 'fatigue', 'pain', 'notes']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing field: {field}'}), 400
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO symptoms_logs (date, nausea, fatigue, pain, notes)
            VALUES (?, ?, ?, ?, ?)
        ''', (data['date'], data['nausea'], data['fatigue'], 
              data['pain'], data['notes']))
        
        conn.commit()
        
        # Return the inserted record
        new_id = cursor.lastrowid
        result = {
            'id': new_id,
            'date': data['date'],
            'nausea': data['nausea'],
            'fatigue': data['fatigue'],
            'pain': data['pain'],
            'notes': data['notes']
        }
        
        logger.info(f"POST /insert_symptoms - Success: inserted ID {new_id}")
        return jsonify(result), 201
        
    except Exception as e:
        logger.error(f"Error in insert_symptoms: {e}")
        return jsonify({'error': 'Failed to insert symptoms log'}), 500
    finally:
        if conn:
            conn.close()

# ============================================================================
# MAIN APPLICATION
# ============================================================================

if __name__ == '__main__':
    # Initialize database on startup
    init_database()
    
    # Start the Flask server
    logger.info("Starting EndoCare Backend Server...")
    logger.info("Available endpoints:")
    logger.info("  GET  /health")
    logger.info("  GET  /get_all_sleep")
    logger.info("  POST /insert_sleep")
    logger.info("  GET  /get_all_diet")
    logger.info("  POST /insert_diet")
    logger.info("  GET  /get_all_menstrual")
    logger.info("  POST /insert_menstrual")
    logger.info("  GET  /get_all_symptoms")
    logger.info("  POST /insert_symptoms")
    
    app.run(debug=True, host='0.0.0.0', port=5000)