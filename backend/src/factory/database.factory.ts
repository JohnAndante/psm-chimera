import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import { Database } from '../types/database.js';

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
        const pool = new Pool({
            connectionString: process.env.DATABASE_URL,
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
                if (process.env.NODE_ENV === 'development') {
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
