import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import { Database } from '../types/database.js';
import { EnvFactory } from './environment.factory.js';

// Fábrica de conexão com o banco de dados usando Kysely e PostgreSQL
class DatabaseFactory {
    private static instance: Kysely<Database> | null = null;

    private constructor() { }

    public static getInstance(): Kysely<Database> {
        if (!DatabaseFactory.instance) {
            DatabaseFactory.instance = DatabaseFactory.createConnection();
        }
        return DatabaseFactory.instance;
    }

    private static createConnection(): Kysely<Database> {
        const connectionString = EnvFactory.get('DATABASE_URL');

        // Log de diagnóstico para debug de problemas de conexão
        console.log('[DB] Diagnóstico de conexão:');
        console.log('[DB] DATABASE_URL definida:', !!connectionString);
        console.log('[DB] DATABASE_URL tipo:', typeof connectionString);

        if (typeof connectionString === 'string' && connectionString.length > 0) {
            // Mascarar a senha na exibição
            const preview = connectionString.replace(/:([^:@]+)@/, ':*****@');
            console.log('[DB] DATABASE_URL preview:', preview);
        } else {
            console.log('[DB] DATABASE_URL valor:', connectionString);
        }

        if (!connectionString) {
            throw new Error('DATABASE_URL não está definida nas variáveis de ambiente');
        }

        const pool = new Pool({
            connectionString: connectionString,
            max: 20, // máximo de conexões no pool
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
        });

        const dialect = new PostgresDialect({
            pool,
        });

        return new Kysely<Database>({
            dialect,
            log: (event) => {
                // Log apenas em desenvolvimento
                if (EnvFactory.isDevelopment()) {
                    if (event.level === 'query') {
                        console.log('🔍 Query:', event.query.sql);
                        console.log('📄 Parameters:', event.query.parameters);
                    }
                    if (event.level === 'error') {
                        console.error('❌ Database Error:', event.error);
                    }
                }
            },
        });
    }

    public static async closeConnection(): Promise<void> {
        if (DatabaseFactory.instance) {
            await DatabaseFactory.instance.destroy();
            DatabaseFactory.instance = null;
        }
    }
}

// Export da instância do banco de dados
export const db = DatabaseFactory.getInstance();
