import('../lib/prisma.js')
  .then(m => {
    console.log('imported prisma');
    console.log('has $connect:', typeof m.default.$connect);
  })
  .catch(e => {
    console.error('import error:', e && e.message || e);
    process.exit(1);
  });
