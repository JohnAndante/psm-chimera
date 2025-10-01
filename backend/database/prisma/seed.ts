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
    const rpIntegration = await prisma.integration.upsert({
        where: { name: 'RP Sistema Principal' },
        update: {
            type: 'RP',
            active: false, // Desativado até configurar credenciais
            base_url: 'http://192.168.1.4:9000',
            config: {
                auth_method: 'LOGIN',
                base_url: 'http://192.168.1.4:9000',
                login_endpoint: '/v1.1/auth',
                username: 'CHANGE_ME', // Será configurado via UI
                password: 'CHANGE_ME', // Será configurado via UI
                token_response_field: 'response.token',
                products_endpoint: '/v2.8/produtounidade/listaprodutos/{lastId}/unidade/{storeReg}/detalhado',
                token_header: 'token',
                pagination: {
                    method: 'CURSOR',
                    param_name: 'lastProductId',
                    additional_params: {
                        somentePreco2: 'true'
                    }
                }
            }
        },
        create: {
            name: 'RP Sistema Principal',
            type: 'RP',
            active: false, // Desativado até configurar credenciais
            base_url: 'http://192.168.1.4:9000',
            config: {
                auth_method: 'LOGIN',
                base_url: 'http://192.168.1.4:9000',
                login_endpoint: '/v1.1/auth',
                username: 'CHANGE_ME', // Será configurado via UI
                password: 'CHANGE_ME', // Será configurado via UI
                token_response_field: 'response.token',
                products_endpoint: '/v2.8/produtounidade/listaprodutos/{lastId}/unidade/{storeReg}/detalhado',
                token_header: 'token',
                pagination: {
                    method: 'CURSOR',
                    param_name: 'lastProductId',
                    additional_params: {
                        somentePreco2: 'true'
                    }
                }
            }
        }
    });

    // CresceVendas base integration
    const cresceVendasIntegration = await prisma.integration.upsert({
        where: { name: 'CresceVendas API' },
        update: {
            type: 'CRESCEVENDAS',
            active: false, // Desativado até configurar credenciais
            base_url: 'https://www.crescevendas.com',
            config: {
                base_url: 'https://www.crescevendas.com',
                auth_headers: {
                    'X-AdminUser-Email': 'CHANGE_ME', // Será configurado via UI
                    'X-AdminUser-Token': 'CHANGE_ME'  // Será configurado via UI
                },
                send_products_endpoint: '/admin/integrations/discount_stores/batch_upload',
                get_products_endpoint: '/admin/integrations/discount_stores',
                campaign_config: {
                    name_template: '{store} Descontos - {date}',
                    start_time: '06:00',
                    end_time: '23:59',
                    override_existing: true
                }
            }
        },
        create: {
            name: 'CresceVendas API',
            type: 'CRESCEVENDAS',
            active: false, // Desativado até configurar credenciais
            base_url: 'https://www.crescevendas.com',
            config: {
                base_url: 'https://www.crescevendas.com',
                auth_headers: {
                    'X-AdminUser-Email': 'CHANGE_ME', // Será configurado via UI
                    'X-AdminUser-Token': 'CHANGE_ME'  // Será configurado via UI
                },
                send_products_endpoint: '/admin/integrations/discount_stores/batch_upload',
                get_products_endpoint: '/admin/integrations/discount_stores',
                campaign_config: {
                    name_template: '{store} Descontos - {date}',
                    start_time: '06:00',
                    end_time: '23:59',
                    override_existing: true
                }
            }
        }
    });

    // Create default notification channels
    console.log('[SEED] Creating default notification channels')

    const telegramChannel = await prisma.notificationChannel.upsert({
        where: { name: 'Telegram Notificações PSM' },
        update: {},
        create: {
            name: 'Telegram Notificações PSM',
            type: 'TELEGRAM',
            config: {
                bot_token: '7077140332:AAGAf2XQBSniUdGRA0gZrlCvmYXcjzpCCOs', // Token do server-node-fill
                chat_id: 'CHANGE_ME', // Será configurado via UI
                parse_mode: 'Markdown',
                description: 'Canal principal do Telegram para notificações de sincronização',
                notification_types: {
                    sync_start: true,
                    sync_success: true,
                    sync_failure: true,
                    comparison_results: true,
                    system_alerts: true
                }
            },
            active: false // Desativado até configurar o chat_id
        }
    });

    await prisma.notificationChannel.upsert({
        where: { name: 'Email Notificações PSM' },
        update: {},
        create: {
            name: 'Email Notificações PSM',
            type: 'EMAIL',
            config: {
                smtp_host: 'smtp.gmail.com',
                smtp_port: 587,
                smtp_secure: false,
                smtp_user: 'CHANGE_ME', // Será configurado via UI
                smtp_pass: 'CHANGE_ME', // Será configurado via UI
                from_email: 'noreply@paranasupermercados.com.br',
                from_name: 'PSM Chimera System',
                description: 'Canal de email para notificações importantes do sistema',
                notification_types: {
                    sync_failure: true,
                    system_alerts: true,
                    daily_reports: false
                }
            },
            active: false // Desativado até configurar as credenciais
        }
    });

    // Create default job configurations
    console.log('[SEED] Creating default job configurations')

    if (rpIntegration) {
        await prisma.jobConfiguration.upsert({
            where: { name: 'Sync Daily 05:10' },
            update: {},
            create: {
                name: 'Sync Daily 05:10',
                description: 'Sincronização diária de produtos RP → CresceVendas (baseado no fazTudo2)',
                cron_pattern: '10 5 * * *', // Todo dia às 5:10 (horário do server-node-fill)
                job_type: 'SYNC_PRODUCTS',
                integration_id: rpIntegration.id,
                config: {
                    batch_size: 100,
                    timeout: 900000, // 15 minutos (tempo médio do fazTudo2)
                    store_ids: [], // Vazio = todas as lojas ativas
                    cleanup_old_data: true,
                    send_notifications: true,
                    parallel_processing: true,
                    max_retries: 3,
                    retry_delay: 30000 // 30 segundos
                },
                active: false // Desativado até configurar as integrações
            }
        });

        await prisma.jobConfiguration.upsert({
            where: { name: 'Compare Daily 06:20' },
            update: {},
            create: {
                name: 'Compare Daily 06:20',
                description: 'Comparação diária de dados RP vs CresceVendas (baseado no comparaTudo)',
                cron_pattern: '20 6 * * *', // Todo dia às 6:20 (horário do server-node-fill)
                job_type: 'COMPARE_DATA',
                integration_id: rpIntegration.id,
                config: {
                    deep_compare: true,
                    generate_detailed_report: true,
                    check_missing_products: true,
                    check_price_differences: true,
                    check_status_differences: true,
                    store_ids: [], // Vazio = todas as lojas ativas
                    notification_threshold: {
                        min_differences: 5, // Só notifica se tiver 5+ diferenças
                        critical_differences: 50 // Marca como crítico se tiver 50+ diferenças
                    }
                },
                active: false // Desativado até configurar as integrações
            }
        });

        await prisma.jobConfiguration.upsert({
            where: { name: 'Cleanup Daily 00:00' },
            update: {},
            create: {
                name: 'Cleanup Daily 00:00',
                description: 'Limpeza diária de logs antigos (baseado no fazTudo3)',
                cron_pattern: '0 0 * * *', // Todo dia à meia-noite
                job_type: 'CLEANUP_LOGS',
                config: {
                    retention_days: 7, // Manter logs por 7 dias (como no server-node-fill)
                    cleanup_executions: true,
                    cleanup_system_logs: true,
                    cleanup_old_products: false, // Produtos são limpos durante o sync
                    compress_old_logs: true,
                    max_log_size: '100MB'
                },
                active: true // Pode ficar ativo desde o início
            }
        });
    }

    // Create default sync configurations (novo sistema focado)
    console.log('[SEED] Creating default sync configurations')

    if (rpIntegration && cresceVendasIntegration && telegramChannel) {
        await prisma.syncConfiguration.upsert({
            where: { name: 'Sync Principal RP → CresceVendas' },
            update: {},
            create: {
                name: 'Sync Principal RP → CresceVendas',
                description: 'Configuração principal de sincronização automática entre RP e CresceVendas',
                source_integration_id: rpIntegration.id,
                target_integration_id: cresceVendasIntegration.id,
                notification_channel_id: telegramChannel.id,
                store_ids: [], // Vazio = todas as lojas ativas
                schedule: {
                    sync_time: '05:10',
                    compare_time: '06:20'
                },
                options: {
                    batch_size: 100,
                    cleanup_old_data: true,
                    send_notifications: true,
                    parallel_processing: true,
                    max_execution_time: 900, // 15 minutos
                    retry_failed_stores: true,
                    generate_comparison_report: true
                },
                active: false // Desativado até configurar as credenciais das integrações
            }
        });
    }

    // Create sample stores (based on server-node-fill data)
    console.log('[SEED] Creating sample stores')

    // Lojas baseadas nos dados encontrados no server-node-fill
    const sampleStores = [
        {
            name: 'Paraná Super - Loja 001',
            registration: '76260017000654', // CNPJ encontrado no fazTudo2.ts
            document: '76260017000654',
            active: true
        },
        {
            name: 'Paraná Super - Loja 002',
            registration: '76260017000735', // CNPJ encontrado no fazTudo2.ts
            document: '76260017000735',
            active: true
        },
        {
            name: 'Paraná Super - Loja Teste',
            registration: '12345678000199',
            document: '12345678000199',
            active: false // Loja de teste, desativada
        }
    ];

    for (const store of sampleStores) {
        await prisma.store.upsert({
            where: { registration: store.registration },
            update: {
                name: store.name,
                document: store.document,
                active: store.active
            },
            create: store
        });
    }

    // Create some sample products for testing
    console.log('[SEED] Creating sample products for testing')

    const firstStore = await prisma.store.findFirst({
        where: { active: true }
    });

    if (firstStore) {
        // Criar alguns produtos de exemplo para testes
        const sampleProducts = [
            {
                code: 12345,
                price: 10.99,
                final_price: 8.99,
                limit: 1000,
                store_id: firstStore.id,
                starts_at: new Date().toISOString().slice(0, 10) + 'T06:00:00.000Z',
                expires_at: new Date().toISOString().slice(0, 10) + 'T23:59:59.000Z'
            },
            {
                code: 67890,
                price: 25.50,
                final_price: 19.90,
                limit: 500,
                store_id: firstStore.id,
                starts_at: new Date().toISOString().slice(0, 10) + 'T06:00:00.000Z',
                expires_at: new Date().toISOString().slice(0, 10) + 'T23:59:59.000Z'
            }
        ];

        for (const product of sampleProducts) {
            await prisma.product.upsert({
                where: {
                    id: `${firstStore.id}-${product.code}` // Usando combinação store_id + code como ID único
                },
                update: product,
                create: {
                    id: `${firstStore.id}-${product.code}`,
                    ...product
                }
            });
        }
    }

    // Create job notification configurations
    console.log('[SEED] Creating job notification configurations')

    const syncJob = await prisma.jobConfiguration.findFirst({
        where: { name: 'Sync Daily 05:10' }
    });

    const compareJob = await prisma.jobConfiguration.findFirst({
        where: { name: 'Compare Daily 06:20' }
    });

    if (syncJob && telegramChannel) {
        await prisma.jobNotification.upsert({
            where: {
                job_config_id_notification_channel_id: {
                    job_config_id: syncJob.id,
                    notification_channel_id: telegramChannel.id
                }
            },
            update: {},
            create: {
                job_config_id: syncJob.id,
                notification_channel_id: telegramChannel.id,
                on_start: false,  // Não notificar no início
                on_success: true, // Notificar sucesso
                on_failure: true  // Notificar falhas
            }
        });
    }

    if (compareJob && telegramChannel) {
        await prisma.jobNotification.upsert({
            where: {
                job_config_id_notification_channel_id: {
                    job_config_id: compareJob.id,
                    notification_channel_id: telegramChannel.id
                }
            },
            update: {},
            create: {
                job_config_id: compareJob.id,
                notification_channel_id: telegramChannel.id,
                on_start: false,  // Não notificar no início
                on_success: true, // Notificar sucesso (com resultados da comparação)
                on_failure: true  // Notificar falhas
            }
        });
    }

    console.log('[SEED] Database seeding completed')
    console.log('[SEED] ⚠️  IMPORTANTE: Configure as credenciais das integrações via UI antes de ativar os jobs!')
    console.log('[SEED] ⚠️  IMPORTANTE: Configure o chat_id do Telegram antes de ativar as notificações!')
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
