const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const { globalLimiter } = require('./middleware/rateLimiter');

// Load environment variables
dotenv.config();

// Connect to the database
connectDB();

const app = express();

// --- Core Middleware ---

// Enable Cross-Origin Resource Sharing
app.use(cors());

// Enable express.json middleware to parse JSON bodies
app.use(express.json());

// Trust the first proxy if you're deploying behind one (e.g., Heroku, Nginx)
// This is important for express-rate-limit to get the correct client IP.
app.set('trust proxy', 1);

// --- Apply Global Rate Limiter to all requests ---
app.use(globalLimiter);

// --- API Routes ---
app.get('/', (req, res) => {
    res.json({ message: 'API is running successfully. Rate limiting is active.' });
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/data', require('./routes/dataRoutes'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));  