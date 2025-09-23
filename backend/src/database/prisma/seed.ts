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
    const existingRP = await prisma.integration.findFirst({
        where: { name: 'RP' }
    });

    if (!existingRP) {
        await prisma.integration.create({
            data: {
                name: 'RP Webservice',
                active: true,
                base_url: 'https://rp-api.example.com.br',
            }
        });
    }

    // Crescevendas base integration
    const existingCrescevendas = await prisma.integration.findFirst({
        where: { name: 'Crescevendas' }
    });

    if (!existingCrescevendas) {
        await prisma.integration.create({
            data: {
                name: 'Crescevendas',
                active: false,
                base_url: 'https://api.crescevendas.com.br',
            }
        });
    }

    console.log('[SEED] Database seeding completed')
}

main()
    .catch((e) => {
        console.error('[SEED] Error during database seeding')
        console.error(e);

        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
