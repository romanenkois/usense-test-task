import http2 from 'node:http2';

const FSQ_ORIGIN = 'https://places-api.foursquare.com';
const PREFIX = '/fsq-api';

let session = null;

function getSession() {
  if (session && !session.closed && !session.destroyed) return session;
  session = http2.connect(FSQ_ORIGIN);
  session.on('error', () => {
    session = null;
  });
  session.on('close', () => {
    session = null;
  });
  return session;
}

const FORWARDED_HEADERS = ['authorization', 'x-places-api-version', 'accept', 'accept-language'];

function forwardToFsq(req, res) {
  return new Promise((resolve) => {
    const path = req.url.startsWith(PREFIX) ? req.url.slice(PREFIX.length) || '/' : req.url;

    const reqHeaders = {
      ':method': req.method,
      ':path': path,
      ':authority': new URL(FSQ_ORIGIN).host,
    };
    for (const name of FORWARDED_HEADERS) {
      const value = req.headers[name];
      if (typeof value === 'string') reqHeaders[name] = value;
    }

    let stream;
    try {
      stream = getSession().request(reqHeaders);
    } catch (err) {
      if (!res.headersSent) res.writeHead(502, { 'content-type': 'text/plain' });
      res.end(`fsq proxy error: ${err.message}`);
      resolve();
      return;
    }

    stream.on('response', (headers) => {
      const status = Number(headers[':status']) || 502;
      const responseHeaders = {};
      for (const [key, value] of Object.entries(headers)) {
        if (key.startsWith(':')) continue;
        responseHeaders[key] = value;
      }
      res.writeHead(status, responseHeaders);
    });
    stream.on('data', (chunk) => res.write(chunk));
    stream.on('end', () => {
      res.end();
      resolve();
    });
    stream.on('error', (err) => {
      if (!res.headersSent) res.writeHead(502, { 'content-type': 'text/plain' });
      res.end(`fsq proxy stream error: ${err.message}`);
      resolve();
    });

    if (req.method === 'GET' || req.method === 'HEAD') {
      stream.end();
    } else {
      req.pipe(stream);
    }
  });
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
