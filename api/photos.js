const clientPromise = require('../lib/mongodb');

module.exports = async (req, res) => {
  try {
    const client = await clientPromise;
    const db = client.db('love_website');
    const col = db.collection('photos');

    if (req.method === 'GET') {
      const docs = await col.find({}).sort({ timestamp: 1 }).toArray();
      const photos = docs.map((p) => ({
        id: p._id.toString(),
        url: p.url,
        caption: p.caption || '',
        uploader: p.uploader || '',
        likes: p.likes || 0,
        timestamp: p.timestamp,
      }));
      return res.status(200).json(photos);
    }

    if (req.method === 'POST') {
      const { url, caption, uploader } = req.body || {};
      if (!url) return res.status(400).json({ error: 'Thiếu url ảnh' });

      const doc = {
        url,
        caption: (caption || '').slice(0, 300),
        uploader: (uploader || 'ẩn danh').slice(0, 60),
        likes: 0,
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
