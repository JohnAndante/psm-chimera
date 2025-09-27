import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { EnvFactory } from './factory/environment.factory';
import routes from './routes';

const app = express();
const PORT = EnvFactory.getPort();

// Security middleware
app.use(helmet());
app.use(cors({
    origin: EnvFactory.get('FRONTEND_URL') || 'http://localhost:3001',
    credentials: true
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

app.listen(PORT, () => {
    console.log(`🚀 PSM Chimera Backend rodando na porta ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🔗 API Base: http://localhost:${PORT}/api/v1`);
});

export default app;
