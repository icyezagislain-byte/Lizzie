import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowLeft, ArrowRight, Eye, EyeOff, FileText } from "lucide-react";
import { SiteHeader } from "@/components/Brand";

export default function Admin() {
  const [, setLocation] = useLocation();
  const [word, setWord] = useState("");
  const [message, setMessage] = useState("");
  const [checking, setChecking] = useState(false);
  const [show, setShow] = useState(false);
  const enter = async () => {
    const secret = word.trim().toLowerCase();
    setMessage("");
    if (!secret) {
      setMessage("Please type the secret word.");
      return;
    }
    setChecking(true);
    try {
      const response = await fetch("/api/interviews", {
        headers: { Authorization: `Bearer ${secret}` },
      });
      if (response.status === 403 || response.status === 401) {
        setMessage("Not allowed. That is not the right secret word.");
      } else if (!response.ok && response.status !== 503) {
        setMessage("Cannot reach the server right now. Please make sure the server is running and try again.");
      } else {
        try {
          localStorage.setItem("detectives_word", secret);
        } catch {
          // ignore: the word just will not be remembered
        }
        setLocation("/admin/dashboard");
      }
    } catch {
      setMessage("Could not check the word right now. Please try again.");
    }
    setChecking(false);
  };

  return (
    <div className="site">
      <SiteHeader />
      <main className="admin-page">
        <div className="admin-card">
          <Link href="/" className="back-home" data-testid="link-admin-back">
            <ArrowLeft size={15} /> Back to research
          </Link>
          <div className="admin-emblem"><FileText size={23} /></div>
          <p className="eyebrow">
            <span className="eyebrow-line" />
            RESEARCH RESPONSES
          </p>
          <h1>Research dashboard</h1>
          <p className="admin-intro">
            Enter the secret word to browse CBHI, MINALOC, and RSSB interviews and download the workbook.
          </p>
                    <div style={{ position: "relative", margin: "12px 0" }}>
            <input
              type={show ? "text" : "password"}
              value={word}
              onChange={(e) => setWord(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") enter(); }}
              placeholder="Secret word"
              autoComplete="off"
              style={{ width: "100%", padding: "12px 46px 12px 12px", borderRadius: 8, border: "1px solid #bbb", fontSize: 16 }}
              data-testid="input-secret-word"
            />
            <button
              type="button"
              onClick={() => setShow(!show)}
              aria-label={show ? "Hide secret word" : "Show secret word"}
              title={show ? "Hide" : "Show"}
              style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 6, display: "flex", color: "#666" }}
              data-testid="button-toggle-word"
            >
              {show ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {message && (
            <p role="alert" style={{ color: "#c62828", fontWeight: 600, margin: "0 0 12px" }} data-testid="text-not-allowed">
              {message}
            </p>
          )}
          <button className="button button-primary admin-submit" onClick={enter} disabled={checking} data-testid="button-open-dashboard">
            {checking ? "Checking..." : "Open research dashboard"} <ArrowRight size={16} />
          </button>
        </div>
      </main>
      <footer className="minimal-footer">
        THE DETECTIVES <span>·</span> ISOMO ACADEMY · RWANDA
      </footer>
    </div>
  );
}