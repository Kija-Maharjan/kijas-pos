// api/health.js  —  Health check endpoint

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(200).json({ status: 'ok', message: "Nepal Food Factory POS API is running" });
}
