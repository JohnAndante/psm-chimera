import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { EnvFactory } from './factory/environment.factory';
import routes from './routes';

const app = express();
const SERVER_PORT = EnvFactory.getPort();

// Security middleware
app.use(helmet());

// CORS Configuration - Allow multiple origins for development
const allowedOrigins = [
    'http://localhost:3000',    // Backend (se for servir assets)
    'http://localhost:3001',    // Frontend comum
    'http://localhost:5100',    // Frontend Vite (padrão do projeto)
    'http://localhost:5173',    // Frontend Vite (padrão Vite)
    'http://localhost:4173',    // Frontend Vite Preview
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:5100',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:4173',
    EnvFactory.get('FRONTEND_URL') // URL específica do .env
].filter(Boolean); // Remove valores undefined

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        if (EnvFactory.isDevelopment()) {
            // Em desenvolvimento, permite qualquer localhost/127.0.0.1
            if (origin.startsWith('http://localhost:') ||
                origin.startsWith('http://127.0.0.1:') ||
                allowedOrigins.includes(origin)) {
                return callback(null, true);
            }
        } else {
            // Em produção, apenas origins específicas
            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }
        }

        callback(new Error('Não permitido pelo CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'PSM Chimera Backend',
        version: '2.0.0'
    });
});

// API Routes
app.use('/api/v1', routes);

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error',
        ...(EnvFactory.isDevelopment() && { stack: err.stack })
    });
});

app.listen(SERVER_PORT, () => {
    console.log(`🚀 PSM Chimera Backend rodando na porta ${SERVER_PORT}`);
    console.log(`📊 Health check: http://localhost:${SERVER_PORT}/health`);
    console.log(`🔗 API Base: http://localhost:${SERVER_PORT}/api/v1`);
});

export default app;
