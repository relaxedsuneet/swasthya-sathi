const db = require('../config/db');
const llmService = require('../services/llmService');

exports.verifyClaim = async (req, res) => {
  const { claim, conversationId } = req.body;

  if (!claim) {
    return res.status(400).json({ error: 'A medical claim is required.' });
  }

  try {
    let currentConversationId = conversationId;

    // Create a new conversation record if one does not exist
    if (!currentConversationId) {
      const convoResult = await db.query(
        'INSERT INTO conversations DEFAULT VALUES RETURNING id'
      );
      currentConversationId = convoResult.rows[0].id;
    }

    // Call the Gemini API via the service
    const analysis = await llmService.analyzeClaim(claim);

    // Save the interaction to PostgreSQL
    const insertQuery = `
      INSERT INTO fact_checks 
      (conversation_id, user_claim, verdict, confidence, explanation, citations) 
      VALUES ($1, $2, $3, $4, $5, $6) 
      RETURNING *
    `;
    const values = [
      currentConversationId,
      claim,
      analysis.verdict,
      analysis.confidence,
      analysis.explanation,
      JSON.stringify(analysis.citations)
    ];

    const dbResult = await db.query(insertQuery, values);

    // Return the saved record, including the generated conversation ID
    res.json(dbResult.rows[0]);

  } catch (error) {
    console.error('Fact-Check Error:', error);
    res.status(500).json({ error: 'Failed to process the medical claim.' });
  }
};