export default function validateUrl(req, res, next) {
  const { target_url } = req.body;

  try {
    new URL(target_url);
    next();
  } catch {
    return res.status(400).json({ error: "Invalid URL" });
  }
}
