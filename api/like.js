const { ObjectId } = require('mongodb');
const clientPromise = require('../lib/mongodb');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end('Method Not Allowed');
  }

  try {
    const { id, like } = req.body || {};
    if (!id || !ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Thiếu hoặc sai id' });
    }

    const client = await clientPromise;
    const db = client.db('love_website');
    const col = db.collection('photos');

    const inc = like ? 1 : -1;
    const result = await col.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $inc: { likes: inc } },
      { returnDocument: 'after' }
    );

    if (!result || !result.value) {
      return res.status(404).json({ error: 'Không tìm thấy ảnh' });
    }

    const likes = Math.max(0, result.value.likes || 0);
    // đảm bảo không bao giờ âm trong DB nếu có double-click race condition
    if (result.value.likes < 0) {
      await col.updateOne({ _id: new ObjectId(id) }, { $set: { likes: 0 } });
    }

    return res.status(200).json({ id, likes });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Lỗi máy chủ' });
  }
};
