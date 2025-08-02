# EndoCare Backend Server

Flask API server for the EndoCare endometriosis tracking mobile app.

## Quick Start

1. **Install dependencies:**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Start the server:**
   ```bash
   python app.py
   ```

3. **Test locally:**
   ```bash
   curl http://localhost:5000/health
   curl http://localhost:5000/get_all_sleep
   ```

4. **Start ngrok tunnel:**
   ```bash
   ngrok http 5000
   ```

5. **Update React Native app:**
   - Copy the ngrok URL (e.g., `https://abc123.ngrok-free.app`)
   - Update `API_BASE_URL` in `src/services/api.ts`

## API Endpoints

### Health Check
- `GET /health` - Check server and database status

### Sleep Tracking
- `GET /get_all_sleep` - Get all sleep logs
- `POST /insert_sleep` - Add new sleep log

### Diet Tracking
- `GET /get_all_diet` - Get all diet logs
- `POST /insert_diet` - Add new diet log

### Menstrual Tracking
- `GET /get_all_menstrual` - Get all menstrual logs
- `POST /insert_menstrual` - Add new menstrual log

### Symptoms Tracking
- `GET /get_all_symptoms` - Get all symptoms logs
- `POST /insert_symptoms` - Add new symptoms log

## Database

Uses SQLite database (`endocare.db`) with automatic schema creation.

## Troubleshooting

- Check logs in the terminal where you started the server
- Use `/health` endpoint to verify database connectivity
- Make sure port 5000 is not in use by other applications