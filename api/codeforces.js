export default async function handler(req, res) {
  const { handle, type } = req.query;

  if (!handle) {
    return res.status(400).json({ error: "Missing Codeforces handle" });
  }

  const url = type === "rating"
    ? `https://codeforces.com/api/user.rating?handle=${handle}`
    : `https://codeforces.com/api/user.info?handles=${handle}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch Codeforces data" });
  }
}
