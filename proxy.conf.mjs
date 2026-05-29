import http2 from 'node:http2';

const FSQ_ORIGIN = 'https://places-api.foursquare.com';
const PREFIX = '/fsq-api';
const FORWARDED_HEADERS = ['authorization', 'x-places-api-version', 'accept', 'accept-language'];

let session = null;

function dropSession() {
  if (session) {
    try {
      session.close();
    } catch {
      // ignore
    }
    session = null;
  }
}

function getSession() {
  if (session && !session.closed && !session.destroyed) return session;
  session = http2.connect(FSQ_ORIGIN);
  session.on('error', dropSession);
  session.on('close', () => {
    session = null;
  });
  session.on('goaway', dropSession);
  return session;
}

function buildHeaders(req) {
  const path = req.url.startsWith(PREFIX) ? req.url.slice(PREFIX.length) || '/' : req.url;
  const headers = {
    ':method': req.method,
    ':path': path,
    ':authority': new URL(FSQ_ORIGIN).host,
  };
  for (const name of FORWARDED_HEADERS) {
    const value = req.headers[name];
    if (typeof value === 'string') headers[name] = value;
  }
  return headers;
}

function sendOnce(req, res) {
  return new Promise((resolve) => {
    let stream;
    try {
      stream = getSession().request(buildHeaders(req));
    } catch (err) {
      resolve({ ok: false, err, beforeHeaders: true });
      return;
    }

    let headersWritten = false;

    stream.on('response', (headers) => {
      const status = Number(headers[':status']) || 502;
      const responseHeaders = {};
      for (const [key, value] of Object.entries(headers)) {
        if (key.startsWith(':')) continue;
        responseHeaders[key] = value;
      }
      res.writeHead(status, responseHeaders);
      headersWritten = true;
    });
    stream.on('data', (chunk) => res.write(chunk));
    stream.on('end', () => {
      res.end();
      resolve({ ok: true });
    });
    stream.on('error', (err) => {
      resolve({ ok: false, err, beforeHeaders: !headersWritten });
    });

    if (req.method === 'GET' || req.method === 'HEAD') {
      stream.end();
    } else {
      req.pipe(stream);
    }
  });
}

const RETRYABLE_CODES = new Set([
  'ERR_HTTP2_STREAM_ERROR',
  'ERR_HTTP2_GOAWAY_SESSION',
  'ERR_HTTP2_INVALID_SESSION',
  'ERR_HTTP2_STREAM_CANCEL',
  'NGHTTP2_REFUSED_STREAM',
]);

function isRetryable(err) {
  if (!err) return false;
  if (RETRYABLE_CODES.has(err.code)) return true;
  return typeof err.message === 'string' && /stream close|goaway/i.test(err.message);
}

async function forwardToFsq(req, res) {
  const first = await sendOnce(req, res);
  if (first.ok) return;

  if (first.beforeHeaders && isRetryable(first.err)) {
    dropSession();
    const second = await sendOnce(req, res);
    if (second.ok) return;
    if (!res.headersSent) res.writeHead(502, { 'content-type': 'text/plain' });
    if (!res.writableEnded) res.end(`fsq proxy stream error: ${second.err?.message ?? 'unknown'}`);
    return;
  }

  if (!res.headersSent) res.writeHead(502, { 'content-type': 'text/plain' });
  if (!res.writableEnded) res.end(`fsq proxy stream error: ${first.err?.message ?? 'unknown'}`);
}

export default {
  [PREFIX]: {
    target: FSQ_ORIGIN,
    changeOrigin: true,
    bypass: async (req, res) => {
      await forwardToFsq(req, res);
      return req.url;
    },
  },
};
