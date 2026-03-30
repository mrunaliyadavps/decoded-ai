import Anthropic from "@anthropic-ai/sdk";

export async function POST(req) {
  const { jobDescription, resume, coverLetter, portfolioUrl, rejectionStage, roleTitle, company } = await req.json();

  if (!jobDescription || !resume) {
    return Response.json({ error: "Job description and resume are required" }, { status: 400 });
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const prompt = `You are the world's most honest hiring manager and talent intelligence analyst. You have reviewed thousands of applications and you know exactly why candidates get rejected. You are brutally honest but constructive — your goal is to help people actually get jobs.

Analyze this job application and return a JSON object with EXACTLY this structure — no markdown, no extra text, raw JSON only:

{
  "match_score": <number 0-100, never a multiple of 5 or 10>,
  "verdict": "<a 3-6 word italic-worthy sentence that captures the core diagnosis. Like 'Strong candidate, wrong story.' or 'Skills present, impact invisible.' Make it memorable and specific.>",
  "verdict_detail": "<2-3 sentences expanding on the verdict. Specific to their actual application content. Present tense.>",
  "sub_scores": {
    "keyword_match": <number 0-100>,
    "experience_fit": <number 0-100>,
    "narrative_strength": <number 0-100>,
    "portfolio_relevance": <number 0-100>
  },
  "why_rejected": [
    {"title": "<memorable short title for this rejection reason>", "body": "<2 sentences. Specific, references actual content from their resume/application. No generic advice.>"},
    {"title": "<memorable short title>", "body": "<2 sentences. Specific.>"},
    {"title": "<memorable short title>", "body": "<2 sentences. Specific.>"}
  ],
  "gaps": [
    {"id": "GAP_01", "title": "<what was missing>", "body": "<what the JD asked for that the application didn't demonstrate. 2 sentences.>"},
    {"id": "GAP_02", "title": "<what was missing>", "body": "<2 sentences.>"}
  ],
  "rewrite": {
    "original": "<copy the single weakest sentence from their resume verbatim>",
    "improved": "<rewrite it — specific, impact-driven, metric-backed if possible. Show them what good looks like.>"
  },
  "next_actions": [
    {"id": "01", "label": "<3-4 word action label>", "body": "<one specific thing to do. Start with a verb. Be exact.>"},
    {"id": "02", "label": "<3-4 word action label>", "body": "<one specific thing to do.>"},
    {"id": "03", "label": "<3-4 word action label>", "body": "<one specific thing to do.>"}
  ],
  "rejection_stage_insight": "<1-2 sentences specific to WHY this rejection stage (${rejectionStage}) matters and what it tells us about where the application broke down>"
}

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

    const raw = message.content[0].text.replace(/```json|```/g, "").trim();
    const result = JSON.parse(raw);
    return Response.json(result);
  } catch (error) {
    console.error("API error:", error);
    return Response.json({ error: "Analysis failed" }, { status: 500 });
  }
}
