const { S3Client, ListBucketsCommand } = require('@aws-sdk/client-s3');

const s3Client = new S3Client({
  region: 'us-east-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function testConnection() {
  try {
    const command = new ListBucketsCommand({});
    const response = await s3Client.send(command);
    console.log('✅ Conexão AWS S3 bem-sucedida!');
    console.log(
      '📦 Buckets disponíveis:',
      response.Buckets.map((b) => b.Name),
    );
  } catch (error) {
    console.error('❌ Erro na conexão AWS:', error.message);
  }
}

testConnection();
