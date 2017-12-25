const MogoClient = require('mongodb').MongoClient;

module.exports = async function(req, res, next) {
  if (req.db) return next();
  try {
    let client = await MogoClient.connect('mongodb://localhost');
    req.db = await client.db('admindb');
  } catch (err) {
    return next(err);
  }
  return next();
}