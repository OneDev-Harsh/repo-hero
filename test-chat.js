const http = require('http');

fetch('http://localhost:3000/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    question: "What is this project about?",
    projectId: "cmjpjgoh100008kt4adekgg8z" // I don't know the real projectId, I'll use a dummy or skip
  })
}).then(async res => {
  console.log("Status:", res.status);
  console.log("Headers:", res.headers);
  const text = await res.text();
  console.log("Body length:", text.length);
  console.log("Body preview:", text.substring(0, 200));
}).catch(console.error);
