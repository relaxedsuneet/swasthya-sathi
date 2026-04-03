const db = require('../config/db');

exports.getConversations = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM conversations ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Database Error:', error);
    res.status(500).json({ error: 'Failed to fetch conversations.' });
  }
};

exports.getFactChecksByConversation = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      'SELECT * FROM fact_checks WHERE conversation_id = $1 ORDER BY created_at ASC',
      [id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Database Error:', error);
    res.status(500).json({ error: 'Failed to fetch fact checks.' });
  }
};