const clientPromise = require('../lib/mongodb');

module.exports = async (req, res) => {
  try {
    const client = await clientPromise;
    const db = client.db('love_website');
    const col = db.collection('letters');

    if (req.method === 'GET') {
      const docs = await col.find({}).sort({ timestamp: 1 }).toArray();
      const letters = docs.map((l) => ({
        id: l._id.toString(),
        title: l.title || '',
        body: l.body,
        from: l.from || 'ẩn danh',
        timestamp: l.timestamp,
      }));
      return res.status(200).json(letters);
    }

    if (req.method === 'POST') {
      const { title, body, from } = req.body || {};
      if (!body || !body.trim()) {
        return res.status(400).json({ error: 'Thiếu nội dung thư' });
      }

      const doc = {
        title: (title || '').slice(0, 150),
        body: body.slice(0, 8000),
        from: (from || 'ẩn danh').slice(0, 60),
        timestamp: Date.now(),
      };
      const result = await col.insertOne(doc);
      return res.status(201).json({ id: result.insertedId.toString(), ...doc });
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end('Method Not Allowed');
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Lỗi máy chủ' });
  }
};
