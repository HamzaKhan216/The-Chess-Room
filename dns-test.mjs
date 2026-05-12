import dns from 'dns';

const hostname = 'chess-puzzles-hamzakhan216.aws-ap-south-1.turso.io';

dns.lookup(hostname, (err, address, family) => {
  if (err) {
    console.error('❌ DNS Lookup failed:', err);
  } else {
    console.log('✅ DNS Lookup success:', address, '(Family:', family, ')');
  }
});
