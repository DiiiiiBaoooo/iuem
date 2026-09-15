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
  const client = new MongoClient(uri, {
    // ép dùng IPv4 — nguyên nhân phổ biến nhất gây lỗi
    // "tlsv1 alert internal error" khi Vercel kết nối MongoDB Atlas
    family: 4,
    // serverless nên giữ pool nhỏ, tránh mở quá nhiều connection khi scale
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 8000,
  });
  global._mongoClientPromise = client.connect();
}
clientPromise = global._mongoClientPromise;

module.exports = clientPromise;
