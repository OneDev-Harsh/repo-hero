import { config } from 'dotenv';
config();

import { generateEmbedding } from './src/lib/gemini';
import { db } from './src/server/db';

(async () => {
  const queryVector = await generateEmbedding('How do you handle routing?');
  const vectorQuery = `[${queryVector.join(",")}]`;

  // Raw query to check similarity scores
  const { data, error } = await db.database.rpc('match_source_code', {
    query_embedding: vectorQuery,
    match_threshold: 0.0, // get everything > 0
    match_count: 5,
    p_project_id: 'cmpjndty400004st482vubjfa'
  });

  if (error) {
    console.error("Vector search error:", error);
  } else {
    console.log("Matches:", data);
  }
})();
