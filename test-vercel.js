require('dotenv').config();

async function test() {
  const token = process.env.VERCEL_TOKEN;
  const projectId = process.env.VERCEL_PROJECT_ID;
  
  if (!token || !projectId) {
    console.log("Missing tokens");
    return;
  }
  
  const from = new Date();
  from.setDate(from.getDate() - 30);
  const fromIso = from.toISOString();
  
  // Try counting page views
  const url1 = `https://api.vercel.com/v1/query/web-analytics/visits/count?projectId=${projectId}&environment=production&since=${fromIso}`;
  
  try {
    const res1 = await fetch(url1, { headers: { Authorization: `Bearer ${token}` } });
    console.log("Count Response:", await res1.text());
  } catch (e) {
    console.log(e);
  }
}

test();
