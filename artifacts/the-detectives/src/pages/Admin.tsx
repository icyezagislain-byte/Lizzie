import { Link, useLocation } from "wouter";
import { ArrowLeft, ArrowRight, FileText } from "lucide-react";
import { SiteHeader } from "@/components/Brand";

export default function Admin() {
  const [, setLocation] = useLocation();

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
            Browse CBHI, MINALOC, and RSSB interviews, review answers, and download the workbook.
          </p>
          <button className="button button-primary admin-submit" onClick={() => setLocation("/admin/dashboard")} data-testid="button-open-dashboard">
            Open research dashboard <ArrowRight size={16} />
          </button>
        </div>
      </main>
      <footer className="minimal-footer">
        THE DETECTIVES <span>·</span> ISOMO ACADEMY · RWANDA
      </footer>
    </div>
  );
}
