"use client";
import { useState, useEffect } from "react";
import { useState } from "react";

const loadingLines = [
  "Mapping your application...",
  "Comparing against job requirements...",
  "Analyzing narrative strength...",
  "Identifying critical gaps...",
  "Generating intelligence report...",
];

function genReportId() {
  return `${Math.floor(100 + Math.random() * 900)}-${String.fromCharCode(65 + Math.floor(Math.random() * 26))}X`;
}

function todayDate() {
  const d = new Date();
  return `${d.getDate()}.${d.toLocaleString("en", { month: "short" }).toUpperCase()}.${d.getFullYear()}`;
}

function ScoreColor(score) {
  if (score >= 70) return "#22C55E";
  if (score >= 50) return "#F59E0B";
  return "#EF4444";
}

function CircleScore({ score }) {
  const r = 80;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = ScoreColor(score);
  return (
    <div className="score-circle-wrap">
      <svg width="180" height="180" viewBox="0 0 180 180">
        <circle cx="90" cy="90" r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="8" />
        <circle cx="90" cy="90" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={`${dash.toFixed(1)} ${circ.toFixed(1)}`}
          strokeLinecap="round" transform="rotate(-90 90 90)" />
      </svg>
      <div className="score-inner">
        <div className="score-number" style={{ color }}>{score}%</div>
        <div className="score-label">Match Score</div>
      </div>
    </div>
  );
}

export default function Home() {
  const [stage, setStage] = useState("No Response");
  const [jobDescription, setJobDescription] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [company, setCompany] = useState("");
  const [resume, setResume] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState(loadingLines[0]);
  const [result, setResult] = useState(null);
  const [reportId, setReportId] = useState("");
  const [reportDate, setReportDate] = useState("");
  useEffect(() => { setReportId(genReportId()); setReportDate(todayDate()); }, []);
  const [btnText, setBtnText] = useState("Decode My Rejection");

  const stages = [
    { label: "No Response", icon: "✉" },
    { label: "After Screening", icon: "▼" },
    { label: "After Interview", icon: "◻" },
  ];

  async function runDecode() {
    if (!jobDescription.trim() || !resume.trim()) {
      alert("Please add the job description and your resume.");
      return;
    }
    setLoading(true);
    setResult(null);
    setBtnText("Analyzing...");

    let li = 0;
    const interval = setInterval(() => {
      li = (li + 1) % loadingLines.length;
      setLoadingText(loadingLines[li]);
    }, 2200);

    try {
      const res = await fetch("/api/decode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescription, resume, coverLetter, portfolioUrl, rejectionStage: stage, roleTitle, company }),
      });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      console.error(e);
    }

    clearInterval(interval);
    setLoading(false);
    setBtnText("Decode Again →");
  }

  function copyReport() {
    if (!result) return;
    const text = `DECODED ANALYSIS REPORT\nMatch Score: ${result.match_score}%\nVerdict: ${result.verdict}\n\n${result.verdict_detail}`;
    navigator.clipboard.writeText(text).then(() => alert("Report copied!"));
  }

  function shareReport() {
    const text = `Just decoded my job rejection with Decoded AI — got a ${result?.match_score}% match score.\n\nFind out why YOU didn't get the job 👇\n${window.location.href}`;
    if (navigator.share) {
      navigator.share({ title: "Decoded — AI Rejection Analysis", text });
    } else {
      navigator.clipboard.writeText(text).then(() => alert("Copied!"));
    }
  }

  const subScoreColor = (v) => v >= 70 ? "#22C55E" : v >= 50 ? "#F59E0B" : "#EF4444";

  return (
    <div className="app">
      <div className="sidebar">
        <div>
          <div className="wordmark">decoded<span className="wordmark-dot">.</span></div>
          <div className="tagline">The Intelligence Briefing</div>
        </div>

        <div className="hero-text">Find out why you didn't get the job.</div>

        <div>
          <div className="field-label">Rejection Stage</div>
          <div className="stage-list">
            {stages.map(s => (
              <button key={s.label} className={`stage-btn${stage === s.label ? " active" : ""}`} onClick={() => setStage(s.label)}>
                <span className="stage-icon">{s.icon}</span>
                {s.label.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="field-label">The Role</div>
          <div className="row-inputs" style={{ marginBottom: 8 }}>
            <input className="input-field" placeholder="Job title" value={roleTitle} onChange={e => setRoleTitle(e.target.value)} />
            <input className="input-field" placeholder="Company" value={company} onChange={e => setCompany(e.target.value)} />
          </div>
          <textarea className="input-field" rows={5} placeholder="Paste the full job description here..." value={jobDescription} onChange={e => setJobDescription(e.target.value)} />
        </div>

        <div>
          <div className="field-label">Your Resume</div>
          <textarea className="input-field" rows={5} placeholder="Paste your resume text here..." value={resume} onChange={e => setResume(e.target.value)} />
        </div>

        <div>
          <div className="field-label">Cover Letter <span style={{ color: "var(--text3)", fontWeight: 400 }}>(optional)</span></div>
          <textarea className="input-field" rows={3} placeholder="Paste your cover letter..." value={coverLetter} onChange={e => setCoverLetter(e.target.value)} />
        </div>

        <div>
          <div className="field-label">Portfolio URL <span style={{ color: "var(--text3)", fontWeight: 400 }}>(optional)</span></div>
          <input className="input-field" placeholder="https://yourportfolio.com" value={portfolioUrl} onChange={e => setPortfolioUrl(e.target.value)} />
        </div>

        <button className="decode-btn" disabled={loading} onClick={runDecode}>
          <span>{btnText.toUpperCase()}</span>
          <span>→</span>
        </button>

        <div className="privacy-note">
          <span>🔒</span> Your data is never stored.
        </div>

        <div className="sidebar-footer">
          <a href="#" className="footer-link">⬜ Logs</a>
          <a href="#" className="footer-link">🔒 Security</a>
        </div>
      </div>

      <div className="main-panel">
        <div className="report-topbar">
          <div className="report-topbar-left">
            <div className="report-dot" />
            Analysis Report
          </div>
          <div className="report-topbar-right">
            <div>ID: <span>{reportId}</span></div>
            <div>Date: <span>{reportDate}</span></div>
          </div>
        </div>

        {!loading && !result && (
          <div className="empty-state">
            <div className="empty-title">Awaiting Input Signal.</div>
            <div className="empty-desc">Paste your job description and resume to trigger the analysis. The engine will map your application against employer rejection patterns.</div>
            <div className="status-chips">
              <div className="status-chip"><div className="chip-dot blue" />Neural Engine Standby</div>
              <div className="status-chip"><div className="chip-dot gray" />Encryption Active</div>
            </div>
          </div>
        )}

        {loading && (
          <div className="loading-state">
            <div className="loading-text">{loadingText}</div>
            <div className="loading-bar"><div className="loading-fill" /></div>
          </div>
        )}

        {result && !loading && (
          <>
            <div className="report-body">
              <div className="verdict-section">
                <CircleScore score={result.match_score} />
                <div className="verdict-right">
                  <div className="intelligence-label">Intelligence_Verdict</div>
                  <div className="verdict-headline">{result.verdict}</div>
                  <div className="verdict-detail">{result.verdict_detail}</div>
                  {result.rejection_stage_insight && (
                    <div className="stage-insight">{result.rejection_stage_insight}</div>
                  )}
                </div>
              </div>

              <div className="sub-scores">
                {result.sub_scores && Object.entries(result.sub_scores).map(([key, val]) => (
                  <div className="sub-score-card" key={key}>
                    <div className="sub-score-label">{key.replace(/_/g, " ")}</div>
                    <div className="sub-score-value" style={{ color: subScoreColor(val) }}>{val}%</div>
                    <div className="sub-score-bar">
                      <div className="sub-score-fill" style={{ width: `${val}%`, background: subScoreColor(val) }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="two-col">
                <div>
                  <div className="section-header">Why You Didn't Make It <div className="section-header-line" /></div>
                  {(result.why_rejected || []).map((r, i) => (
                    <div className="rejection-item" key={i}>
                      <div className="rejection-title">
                        <span className="rejection-dot" />
                        {r.title}
                      </div>
                      <div className="rejection-body">{r.body}</div>
                    </div>
                  ))}
                </div>
                <div>
                  <div className="section-header">What Was Missing <div className="section-header-line" /></div>
                  {(result.gaps || []).map((g, i) => (
                    <div className="gap-card" key={i}>
                      <div className="gap-id">[{g.id}]</div>
                      <div className="gap-title">{g.title}</div>
                      <div className="gap-body">{g.body}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rewrite-section">
                <div className="section-header">Stronger Version <div className="section-header-line" /></div>
                {result.rewrite && (
                  <div className="rewrite-grid">
                    <div className="rewrite-box original">
                      <div className="rewrite-box-label">Your Version</div>
                      <div className="rewrite-text">"{result.rewrite.original}"</div>
                    </div>
                    <div className="rewrite-box improved">
                      <div className="rewrite-box-label">Decoded Version</div>
                      <div className="rewrite-text">"{result.rewrite.improved}"</div>
                    </div>
                  </div>
                )}
              </div>

              <div className="actions-section">
                <div className="section-header">Before Your Next Application <div className="section-header-line" /></div>
                {(result.next_actions || []).map((a, i) => (
                  <div className="action-item" key={i}>
                    <div className="action-checkbox" />
                    <div>
                      <div className="action-id">{a.id}</div>
                      <div className="action-label">{a.label}</div>
                      <div className="action-body">{a.body}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bottom-bar">
              <div className="bottom-left">Decoded — AI Rejection Analysis</div>
              <div className="bottom-btns">
                <button className="btn-outline" onClick={copyReport}>Copy Report</button>
                <button className="btn-solid" onClick={shareReport}>Share Briefing</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
