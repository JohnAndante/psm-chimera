import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

async function main() {
    console.log('[SEED] Starting database seeding')

    // Create administrator user
    console.log('[SEED] Creating administrator user')
    const masterUser = await prisma.user.upsert({
        where: { email: 'admin@paranasupermercados.com.br' },
        update: {
            name: 'Admin Master',
            role: 'ADMIN',
        },
        create: {
            name: 'Admin Master',
            email: 'admin@paranasupermercados.com.br',
            role: 'ADMIN',
        }
    });

    // Create auth data for administrator user
    console.log('[SEED] Creating auth data for administrator user')
    await prisma.auth.upsert({
        where: { user_id: masterUser.id },
        update: {
            password_hash: '$2a$12$USpJAp9EHI9sZMVa0XKC4ezLH1ru/7nyDYbmsqysK658yKS9Z7F/y' // ZWi1yWcQ'
        },
        create: {
            user_id: masterUser.id,
            email: masterUser.email,
            password_hash: '$2a$12$USpJAp9EHI9sZMVa0XKC4ezLH1ru/7nyDYbmsqysK658yKS9Z7F/y' // ZWi1yWcQ'
        }
    });

    // Create base integration data
    console.log('[SEED] Creating base integration data')

    // RP base integration
    await prisma.integration.upsert({
        where: { name: 'RP Webservice' },
        update: {
            type: 'RP',
            active: true,
            base_url: 'https://rp-api.example.com.br',
            config: {
                timeout: 30000,
                retries: 3
            }
        },
        create: {
            name: 'RP Webservice',
            type: 'RP',
            active: true,
            base_url: 'https://rp-api.example.com.br',
            config: {
                timeout: 30000,
                retries: 3
            }
        }
    });

    // Crescevendas base integration
    await prisma.integration.upsert({
        where: { name: 'Crescevendas' },
        update: {
            type: 'CRESCEVENDAS',
            active: false,
            base_url: 'https://api.crescevendas.com.br',
            config: {
                timeout: 30000,
                retries: 3
            }
        },
        create: {
            name: 'Crescevendas',
            type: 'CRESCEVENDAS',
            active: false,
            base_url: 'https://api.crescevendas.com.br',
            config: {
                timeout: 30000,
                retries: 3
            }
        }
    });

    // Create default notification channels
    console.log('[SEED] Creating default notification channels')

    await prisma.notificationChannel.upsert({
        where: { name: 'Telegram Default' },
        update: {},
        create: {
            name: 'Telegram Default',
            type: 'TELEGRAM',
            config: {
                bot_token: 'CHANGE_ME',
                chat_id: 'CHANGE_ME',
                description: 'Canal padrão do Telegram para notificações'
            },
            active: false // Desativado até configurar as credenciais
        }
    });

    await prisma.notificationChannel.upsert({
        where: { name: 'Email Default' },
        update: {},
        create: {
            name: 'Email Default',
            type: 'EMAIL',
            config: {
                smtp_host: 'smtp.gmail.com',
                smtp_port: 587,
                smtp_user: 'CHANGE_ME',
                smtp_pass: 'CHANGE_ME',
                from_email: 'noreply@paranasupermercados.com.br',
                description: 'Canal padrão de email para notificações'
            },
            active: false // Desativado até configurar as credenciais
        }
    });

    // Create default job configurations
    console.log('[SEED] Creating default job configurations')

    const rpIntegration = await prisma.integration.findFirst({
        where: { name: 'RP Webservice' }
    });

    if (rpIntegration) {
        await prisma.jobConfiguration.upsert({
            where: { name: 'Sync Products Daily' },
            update: {},
            create: {
                name: 'Sync Products Daily',
                description: 'Sincronização diária de produtos com desconto da RP',
                cron_pattern: '0 5 * * *', // Todo dia às 5h
                job_type: 'SYNC_PRODUCTS',
                integration_id: rpIntegration.id,
                config: {
                    batch_size: 100,
                    timeout: 300000, // 5 minutos
                    stores: [], // Será configurado via UI
                    notifications: {
                        on_start: false,
                        on_success: true,
                        on_failure: true
                    }
                },
                active: false // Desativado até configurar as lojas
            }
        });

        await prisma.jobConfiguration.upsert({
            where: { name: 'Compare Data Daily' },
            update: {},
            create: {
                name: 'Compare Data Daily',
                description: 'Comparação diária de dados entre sistemas',
                cron_pattern: '40 5 * * *', // Diariamente às 5h40
                job_type: 'COMPARE_DATA',
                integration_id: rpIntegration.id,
                config: {
                    deep_compare: true,
                    generate_report: true,
                    notifications: {
                        on_start: false,
                        on_success: true,
                        on_failure: true
                    }
                },
                active: false
            }
        });

        await prisma.jobConfiguration.upsert({
            where: { name: 'Cleanup Logs Monthly' },
            update: {},
            create: {
                name: 'Cleanup Logs Monthly',
                description: 'Limpeza mensal de logs antigos',
                cron_pattern: '0 1 1 * *', // Primeiro dia do mês à 1h
                job_type: 'CLEANUP_LOGS',
                config: {
                    retention_days: 90,
                    cleanup_executions: true,
                    cleanup_logs: true,
                    notifications: {
                        on_start: false,
                        on_success: true,
                        on_failure: true
                    }
                },
                active: true
            }
        });
    }

    // Create sample stores (based on server-node-fill data)
    console.log('[SEED] Creating sample stores')
    // TODO: Trocar por dados reais da Paraná Supermercados
    const sampleStores = [
        {
            name: 'Loja Centro',
            registration: '001',
            document: '12.345.678/0001-90',
            active: true
        },
        {
            name: 'Loja Shopping',
            registration: '002',
            document: '12.345.678/0002-71',
            active: true
        },
        {
            name: 'Loja Bairro',
            registration: '003',
            document: '12.345.678/0003-52',
            active: false
        }
    ];

    for (const store of sampleStores) {
        await prisma.store.upsert({
            where: { registration: store.registration },
            update: store,
            create: store
        });
    }

    console.log('[SEED] Database seeding completed')
}

main()
    .catch((e) => {
        console.error('[SEED] Error during database seeding')
        console.error(e);

        // Exit with error code in Node.js environment
        if (typeof window === 'undefined') {
            (globalThis as any).process?.exit(1);
        }
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
