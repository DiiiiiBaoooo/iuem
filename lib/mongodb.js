const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error(
    'Thiếu biến môi trường MONGODB_URI. Vào Vercel Dashboard → Project → Settings → Environment Variables để thêm.'
  );
}

// Tái sử dụng 1 connection giữa các lần gọi serverless function (tránh mở quá nhiều kết nối)
let clientPromise;

if (!global._mongoClientPromise) {
  const client = new MongoClient(uri);
  global._mongoClientPromise = client.connect();
}
clientPromise = global._mongoClientPromise;

module.exports = clientPromise;
