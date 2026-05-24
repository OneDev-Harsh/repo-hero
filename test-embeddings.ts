import { config } from 'dotenv';
config();

import { generateEmbedding } from './src/lib/gemini';
import { db } from './src/server/db';

(async () => {
  const queryVector = await generateEmbedding('What is this project about?');
  console.log('Query vector length:', queryVector.length);

  const vectorQuery = `[${queryVector.join(",")}]`;

  const { data: result, error } = await db.database.rpc('match_source_code', {
    query_embedding: vectorQuery,
    match_threshold: 0.2, // lowered threshold to ensure matches
    match_count: 10,
    p_project_id: 'cmpjndty400004st482vubjfa'
  });

  if (error) {
    console.error("Vector search error:", error);
  } else {
    console.log("Found matches:", result.length);
  }
})();
