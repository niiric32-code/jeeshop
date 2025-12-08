import('ws').then(wsmod => {
  const ws = wsmod.default ?? wsmod;
  return Promise.all([
    import('@prisma/adapter-neon'),
    import('@neondatabase/serverless'),
    import('@prisma/client')
  ]).then(([adapterMod, neonMod, prismaMod]) => {
    const { PrismaNeon } = adapterMod;
    const { neonConfig } = neonMod;
    neonConfig.webSocketConstructor = ws;
    const conn = process.env.DATABASE_URL || '';
    console.log('connection string present?', !!conn);
    const adapter = new PrismaNeon({ connectionString: conn, directUrl: process.env.DIRECT_URL });
    console.log('adapter created:', typeof adapter);
    const { PrismaClient } = prismaMod;
    try {
      const client = new PrismaClient({ adapter });
      console.log('Prisma client constructed with adapter');
    } catch (e) {
      console.error('construction error:', e && e.message || e);
      process.exit(1);
    }
  });
}).catch(e=>{console.error('import ws failed:', e && e.message || e); process.exit(1);});
