require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production') {
  // Connect to Database and start server locally
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
  }).catch((error) => {
    console.error('Failed to connect to database:', error);
    process.exit(1);
  });
}

// Export for Vercel Serverless
module.exports = async (req, res) => {
  await connectDB();
  return app(req, res);
};
