import { Logger } from '@nestjs/common';
import { config as loadEnv } from 'dotenv';
import * as dns from 'dns';

/**
 * mongodb+srv URIs need SRV/TXT DNS lookups. Some local resolvers (VPNs, DNS proxies on 127.0.0.1)
 * refuse SRV queries, which makes Node fail with `querySrv ECONNREFUSED`. If the system resolver
 * can't answer, switch Node's c-ares resolver to public DNS (override with DNS_SERVERS=1.1.1.1,8.8.8.8).
 * Hostname (A record) lookups still go through the OS resolver.
 */
export async function ensureSrvDns(): Promise<void> {
  loadEnv();
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri?.startsWith('mongodb+srv://')) return;

  const host = uri.replace(/^mongodb\+srv:\/\/(?:[^@/]*@)?/, '').split(/[/?]/)[0];
  try {
    await dns.promises.resolveSrv(`_mongodb._tcp.${host}`);
  } catch (err) {
    const servers = (process.env.DNS_SERVERS || '8.8.8.8,1.1.1.1').split(',').map((s) => s.trim()).filter(Boolean);
    dns.setServers(servers);
    new Logger('Database').warn(
      `System DNS could not resolve SRV for ${host} (${(err as NodeJS.ErrnoException).code}); using ${servers.join(', ')}`,
    );
  }
}
