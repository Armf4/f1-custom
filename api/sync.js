import { put, list, del } from '@vercel/blob';

// ใช้เก็บไฟล์ของเว็บ (logo/ และ livery/) ใน Vercel Blob — ป้องกันด้วยรหัส SYNC_KEY
export default async function handler(req, res) {
  if (!process.env.SYNC_KEY || req.headers['x-key'] !== process.env.SYNC_KEY) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  const { op, path, prefix, url, ct } = req.query;
  try {
    if (op === 'list') {
      const r = await list({ prefix: prefix || '', limit: 1000 });
      return res.json(r.blobs.map(b => ({ path: b.pathname, url: b.url, size: b.size })));
    }
    if (op === 'put' && path) {
      const body = Buffer.isBuffer(req.body) ? req.body : Buffer.from(req.body || '');
      const r = await put(path, body, {
        access: 'public', addRandomSuffix: false, allowOverwrite: true,
        contentType: ct || 'image/png', cacheControlMaxAge: 60,
      });
      return res.json({ url: r.url });
    }
    if (op === 'del' && url) {
      await del(url);
      return res.json({ ok: true });
    }
    return res.status(400).json({ error: 'bad request' });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
