import Anthropic from "@anthropic-ai/sdk";

export async function POST(req) {
  const { jobDescription, resume, coverLetter, portfolioUrl, rejectionStage, roleTitle, company } = await req.json();

  if (!jobDescription || !resume) {
    return Response.json({ error: "Job description and resume are required" }, { status: 400 });
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const prompt = `You are the world's most honest hiring manager and talent intelligence analyst. You have reviewed thousands of applications and know exactly why candidates get rejected. You are brutally honest but constructive.

Analyze this job application and return ONLY a raw JSON object with no markdown, no backticks, no extra text whatsoever. Start your response with { and end with }.

The JSON must have exactly this structure:

{
  "match_score": 67,
  "verdict": "Strong candidate, wrong story.",
  "verdict_detail": "2-3 sentences specific to their application. Present tense.",
  "sub_scores": {
    "keyword_match": 72,
    "experience_fit": 61,
    "narrative_strength": 58,
    "portfolio_relevance": 65
  },
  "why_rejected": [
    {"title": "Short memorable title", "body": "2 sentences specific to their actual resume content."},
    {"title": "Short memorable title", "body": "2 sentences specific."},
    {"title": "Short memorable title", "body": "2 sentences specific."}
  ],
  "gaps": [
    {"id": "GAP_01", "title": "WHAT WAS MISSING", "body": "What the JD asked for that the application didn't show. 2 sentences."},
    {"id": "GAP_02", "title": "WHAT WAS MISSING", "body": "2 sentences."}
  ],
  "rewrite": {
    "original": "Copy the single weakest sentence from their resume verbatim here.",
    "improved": "Your rewrite — specific, impact-driven, metric-backed."
  },
  "next_actions": [
    {"id": "01", "label": "ACTION LABEL", "body": "One specific thing to do. Start with a verb."},
    {"id": "02", "label": "ACTION LABEL", "body": "One specific thing to do."},
    {"id": "03", "label": "ACTION LABEL", "body": "One specific thing to do."}
  ],
  "rejection_stage_insight": "1-2 sentences about what the ${rejectionStage} rejection stage tells us about where this application broke down."
}

All scores must be integers, never multiples of 5 or 10.
Be specific — reference actual content from their resume and JD.

Rejection stage: ${rejectionStage}
Role: ${roleTitle || "Not specified"}
Company: ${company || "Not specified"}

Job Description:
${jobDescription}

Resume:
${resume}

${coverLetter ? `Cover Letter:\n${coverLetter}` : "No cover letter provided."}
${portfolioUrl ? `Portfolio URL: ${portfolioUrl}` : "No portfolio URL provided."}`;

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = message.content[0].text.trim();
    const jsonStart = raw.indexOf("{");
    const jsonEnd = raw.lastIndexOf("}") + 1;
    const jsonStr = raw.slice(jsonStart, jsonEnd);
    const result = JSON.parse(jsonStr);
    return Response.json(result);
  } catch (error) {
    console.error("API error:", error);
    return Response.json({ error: "Analysis failed: " + error.message }, { status: 500 });
  }
}
