import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    try {
        console.log('Connecting to database...')
        const count = await prisma.attendee.count()
        console.log(`Successfully connected. Found ${count} attendees.`)

        console.log('Testing upsert...')
        const testEmail = 'test@example.com'
        const user = await prisma.attendee.upsert({
            where: { email: testEmail },
            update: { name: 'Test User' },
            create: { name: 'Test User', email: testEmail },
        })
        console.log('Upsert successful:', user)

        await prisma.attendee.delete({ where: { email: testEmail } })
        console.log('Cleanup successful')

    } catch (e) {
        console.error('Database error:', e)
        process.exit(1)
    } finally {
        await prisma.$disconnect()
    }
}

main()
