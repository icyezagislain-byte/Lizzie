import { useEffect, useState } from "react";
import { Link } from "wouter";
import {
  ArrowLeft,
  ArrowUpRight,
  Download,
  FileSpreadsheet,
  Search,
  ShieldAlert,
  Users,
  X,
} from "lucide-react";
import { SiteHeader } from "@/components/Brand";
import {
  friendlyError,
  interviewApi,
  type InterviewRecord,
  type RespondentType,
} from "@/lib/api";
import { questionnaire, respondentPaths } from "@/lib/questionnaire";
const tabs = ["CBHI", "MINALOC", "RSSB"];
const demo = [
  {
    id: "U-014",
    group: "CBHI",
    date: "Oct 18, 2026",
    interviewer: "Mame Gideon",
    note: "Community · demonstration record",
    summary:
      "Described a recent change in household income and the experience of using Mutuelle at a health centre.",
  },
  {
    id: "U-009",
    group: "CBHI",
    date: "Oct 16, 2026",
    interviewer: "Denyse Mukeshimana",
    note: "Community · demonstration record",
    summary:
      "Discussed household classification, out-of-pocket costs, and the distance to care.",
  },
  {
    id: "M-003",
    group: "MINALOC",
    date: "Oct 21, 2026",
    interviewer: "Gislain Icyeza",
    note: "Institutional · demonstration record",
    summary:
      "Demonstration summary for classification criteria and household transition processes.",
  },
  {
    id: "R-002",
    group: "RSSB",
    date: "Oct 23, 2026",
    interviewer: "Lizzie Ange Iteriteka",
    note: "Institutional · demonstration record",
    summary:
      "Demonstration summary on CBHI financing, claims and member complaints.",
  },
];
function DemoDashboard() {
  const [tab, setTab] = useState("CBHI");
  const [selected, setSelected] = useState<(typeof demo)[number] | null>(null);
  const [search, setSearch] = useState("");
  const rows = demo.filter(
    (item) =>
      item.group === tab &&
      `${item.id} ${item.interviewer}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  return (
    <div className="site">
      <SiteHeader />
      <main className="dashboard-page">
        <div className="dashboard-wrap">
          <div className="dashboard-navline">
            <Link
              href="/admin"
              className="back-home"
              data-testid="link-dashboard-back"
            >
              <ArrowLeft size={15} /> Admin access
            </Link>
            <span className="dashboard-demo-label">
              <ShieldAlert size={15} /> DEMONSTRATION DATA ONLY
            </span>
          </div>
          <div className="dashboard-title-row">
            <div>
              <p className="eyebrow">
                <span className="eyebrow-line" />
                RESEARCH TEAM · PREVIEW ONLY
              </p>
              <h1>Response overview</h1>
              <p>
                Visual preview of how the research dashboard could be organized.
              </p>
            </div>
            <button
              className="button button-outline"
              disabled
              title="Excel download will be available when secure data storage is configured"
              data-testid="button-download-disabled"
            >
              <Download size={16} /> Download research data{" "}
              <span className="coming-soon">FUTURE</span>
            </button>
          </div>
          <div className="demo-warning">
            <ShieldAlert size={18} />
            <p>
              <strong>DEMONSTRATION ONLY — not research data.</strong> These
              invented sample records are included only to show the interface.
              No participant responses are available here.
            </p>
          </div>
          <section className="overview-strip">
            <div>
              <span>INTERVIEWS IN THIS DEMO</span>
              <strong>04</strong>
              <small>sample records only</small>
            </div>
            <div>
              <span>CBHI SAMPLE</span>
              <strong>02</strong>
              <small>demonstration records</small>
            </div>
            <div>
              <span>INSTITUTIONAL SAMPLES</span>
              <strong>02</strong>
              <small>MINALOC + RSSB</small>
            </div>
            <div className="overview-secure">
              <Users size={19} />
              <span>No live data connected</span>
            </div>
          </section>
          <div
            className="dashboard-tabs"
            role="tablist"
            aria-label="Response groups"
          >
            {tabs.map((group) => (
              <button
                key={group}
                onClick={() => {
                  setTab(group);
                  setSelected(null);
                }}
                className={tab === group ? "active" : ""}
                role="tab"
                aria-selected={tab === group}
                data-testid={`tab-${group.toLowerCase()}`}
              >
                {group} Responses <span>{group === "CBHI" ? "02" : "01"}</span>
              </button>
            ))}
          </div>
          <section className="response-panel">
            <div className="response-panel-head">
              <div>
                <span className="panel-overline">{tab} · RESPONSE LOG</span>
                <h2>Interview records</h2>
              </div>
              <label className="table-search">
                <Search size={15} />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Find an ID or interviewer"
                  aria-label="Search demonstration responses"
                  data-testid="input-search-responses"
                />
              </label>
            </div>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>INTERVIEW ID</th>
                    <th>DATE</th>
                    <th>INTERVIEWER</th>
                    <th>RECORD TYPE</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr
                      key={row.id}
                      onClick={() => setSelected(row)}
                      className={selected?.id === row.id ? "row-selected" : ""}
                      data-testid={`row-demo-${row.id}`}
                    >
                      <td>
                        <strong>{row.id}</strong>
                        <span className="table-demo-tag">DEMO</span>
                      </td>
                      <td>{row.date}</td>
                      <td>{row.interviewer}</td>
                      <td>
                        <span className="record-type">{row.note}</span>
                      </td>
                      <td>
                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            setSelected(row);
                          }}
                          aria-label={`View demonstration record ${row.id}`}
                          className="row-open"
                          data-testid={`button-view-${row.id}`}
                        >
                          <ArrowUpRight size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {rows.length === 0 && (
                    <tr>
                      <td colSpan={5} className="no-results">
                        No demonstration records match “{search}”.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="panel-footer">
              <span>Showing demonstration records for {tab}</span>
              <span>Sample data · never research data</span>
            </div>
          </section>
          {selected && (
            <section
              className="detail-panel"
              data-testid={`detail-${selected.id}`}
            >
              <div className="detail-head">
                <div>
                  <span className="panel-overline">
                    DEMONSTRATION RECORD · {selected.id}
                  </span>
                  <h2>Interview detail</h2>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="close-detail"
                  aria-label="Close record detail"
                  data-testid="button-close-detail"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="detail-grid">
                <div>
                  <span>INTERVIEWER</span>
                  <strong>{selected.interviewer}</strong>
                </div>
                <div>
                  <span>DATE</span>
                  <strong>{selected.date}</strong>
                </div>
                <div>
                  <span>PARTICIPANT PATH</span>
                  <strong>
                    {selected.group === "CBHI"
                      ? "Community / CBHI"
                      : `${selected.group} official`}
                  </strong>
                </div>
              </div>
              <div className="detail-summary">
                <span>DEMONSTRATION SUMMARY</span>
                <p>{selected.summary}</p>
              </div>
            </section>
          )}
          <div className="dashboard-bottom-note">
            <FileSpreadsheet size={18} />
            <p>
              <strong>Excel export is a future feature.</strong> When
              implemented, it is intended to provide three separate
              worksheets—CBHI, MINALOC and RSSB. No workbook is generated in
              this preview.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

const liveTabs: { type: RespondentType; label: string; path: string }[] = [
  { type: "cbhi", label: "CBHI", path: "CBHI member (community)" },
  { type: "minaloc", label: "MINALOC", path: "MINALOC" },
  { type: "rssb", label: "RSSB", path: "RSSB" },
];

function answerText(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (Array.isArray(value)) return value.map(String).join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function displayDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
}

export default function Dashboard() {
  const [tab, setTab] = useState<RespondentType>("cbhi");
  const [records, setRecords] = useState<InterviewRecord[]>([]);
  const [selected, setSelected] = useState<InterviewRecord | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    let active = true;
    interviewApi
      .list()
      .then((response) => {
        if (!active) return;
        setRecords(response.records);
      })
      .catch((requestError: unknown) => {
        if (!active) return;
        setError(friendlyError(requestError));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const rows = records.filter((record) => {
    const query = search.trim().toLowerCase();
    return (
      record.respondentType === tab &&
      `${record.answers["1"] ?? ""} ${record.answers["2"] ?? ""} ${record.status}`
        .toLowerCase()
        .includes(query)
    );
  });
  const countFor = (type: RespondentType) =>
    records.filter((record) => record.respondentType === type).length;
  const drafts = records.filter((record) => record.status === "draft").length;
  const submitted = records.filter(
    (record) => record.status === "submitted",
  ).length;
  const selectedTab = liveTabs.find((item) => item.type === tab)!;

  const downloadWorkbook = async () => {
    setExporting(true);
    try {
      const XLSX = await import("xlsx");
      const workbook = XLSX.utils.book_new();
      for (const item of liveTabs) {
        const questions = questionnaire.filter((question) =>
          respondentPaths[item.path].includes(question.n),
        );
        const columns = [
          "Interview ID",
          "Status",
          "Interviewer",
          "Interview date",
          "Created at",
          "Updated at",
          ...questions.map((question) => `${question.n}. ${question.prompt}`),
        ];
        const rowsForSheet = records
          .filter((record) => record.respondentType === item.type)
          .map((record) => [
            answerText(record.answers["1"]),
            record.status,
            answerText(record.answers["2"]),
            answerText(record.answers["3"]),
            record.createdAt,
            record.updatedAt,
            ...questions.map((question) =>
              answerText(record.answers[String(question.n)]),
            ),
          ]);
        XLSX.utils.book_append_sheet(
          workbook,
          XLSX.utils.aoa_to_sheet([columns, ...rowsForSheet]),
          item.label,
        );
      }
      XLSX.writeFile(
        workbook,
        `the-detectives-research-${new Date().toISOString().slice(0, 10)}.xlsx`,
      );
    } catch (exportError: unknown) {
      setError(friendlyError(exportError));
    } finally {
      setExporting(false);
    }
  };

  const selectedPath = selected
    ? liveTabs.find((item) => item.type === selected.respondentType)?.path
    : undefined;
  const detailQuestions = selectedPath
    ? questionnaire.filter(
        (question) =>
          respondentPaths[selectedPath].includes(question.n) &&
          selected?.answers[String(question.n)] !== undefined &&
          selected.answers[String(question.n)] !== "",
      )
    : [];

  return (
    <div className="site">
      <SiteHeader />
      <main className="dashboard-page">
        <div className="dashboard-wrap">
          <div className="dashboard-navline">
            <Link
              href="/"
              className="back-home"
              data-testid="link-dashboard-back"
            >
              <ArrowLeft size={15} /> Research home
            </Link>
            <div className="dashboard-tools">
              <span className="dashboard-live-label">
                <ShieldAlert size={15} /> RESEARCH RESPONSE DATA
              </span>
            </div>
          </div>
          <div className="dashboard-title-row">
            <div>
              <p className="eyebrow">
                <span className="eyebrow-line" />
                RESEARCH TEAM · LIVE DATA
              </p>
              <h1>Response overview</h1>
              <p>Submitted interviews and drafts in the research database.</p>
            </div>
            <button
              className="button button-outline"
              onClick={downloadWorkbook}
              disabled={loading || exporting}
              data-testid="button-download-workbook"
            >
              <Download size={16} />{" "}
              {exporting ? "Preparing workbook…" : "Download research data"}{" "}
              <span className="coming-soon">XLSX</span>
            </button>
          </div>
          {error && (
            <div className="demo-warning" role="alert">
              <ShieldAlert size={18} />
              <p>{error}</p>
            </div>
          )}
          <section className="overview-strip">
            <div>
              <span>TOTAL INTERVIEWS</span>
              <strong>{records.length}</strong>
              <small>all respondent groups</small>
            </div>
            <div>
              <span>DRAFTS</span>
              <strong>{drafts}</strong>
              <small>not yet submitted</small>
            </div>
            <div>
              <span>SUBMITTED</span>
              <strong>{submitted}</strong>
              <small>completed interviews</small>
            </div>
            <div className="overview-secure">
              <Users size={19} />
              <span>Public response access</span>
            </div>
          </section>
          <div
            className="dashboard-tabs"
            role="tablist"
            aria-label="Response groups"
          >
            {liveTabs.map((item) => (
              <button
                key={item.type}
                onClick={() => {
                  setTab(item.type);
                  setSelected(null);
                }}
                className={tab === item.type ? "active" : ""}
                role="tab"
                aria-selected={tab === item.type}
                data-testid={`tab-${item.label.toLowerCase()}`}
              >
                {item.label} Responses <span>{countFor(item.type)}</span>
              </button>
            ))}
          </div>
          <section className="response-panel">
            <div className="response-panel-head">
              <div>
                <span className="panel-overline">
                  {selectedTab.label} · RESPONSE LOG
                </span>
                <h2>Interview records</h2>
              </div>
              <label className="table-search">
                <Search size={15} />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Find an ID, interviewer or status"
                  aria-label="Search responses"
                  data-testid="input-search-responses"
                />
              </label>
            </div>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>INTERVIEW ID</th>
                    <th>UPDATED</th>
                    <th>INTERVIEWER</th>
                    <th>STATUS</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((record) => {
                    const code = answerText(record.answers["1"]);
                    return (
                      <tr
                        key={record.id}
                        onClick={() => setSelected(record)}
                        className={
                          selected?.id === record.id ? "row-selected" : ""
                        }
                        data-testid={`row-response-${record.id}`}
                      >
                        <td>
                          <strong>{code}</strong>
                        </td>
                        <td>{displayDate(record.updatedAt)}</td>
                        <td>{answerText(record.answers["2"])}</td>
                        <td>
                          <span
                            className={`response-status status-${record.status}`}
                          >
                            {record.status}
                          </span>
                        </td>
                        <td>
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              setSelected(record);
                            }}
                            aria-label={`View response ${code}`}
                            className="row-open"
                            data-testid={`button-view-${record.id}`}
                          >
                            <ArrowUpRight size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {!loading && rows.length === 0 && (
                    <tr>
                      <td colSpan={5} className="no-results">
                        {error
                          ? "Responses could not be loaded."
                          : `No ${selectedTab.label} responses match “${search}”.`}
                      </td>
                    </tr>
                  )}
                  {loading && (
                    <tr>
                      <td colSpan={5} className="no-results">
                        Loading research responses…
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="panel-footer">
              <span>
                Showing {rows.length} {selectedTab.label} records
              </span>
              <span>Draft and submitted status shown separately</span>
            </div>
          </section>
          {selected && (
            <section
              className="detail-panel"
              data-testid={`detail-${selected.id}`}
            >
              <div className="detail-head">
                <div>
                  <span className="panel-overline">
                    {selected.status.toUpperCase()} ·{" "}
                    {answerText(selected.answers["1"])}
                  </span>
                  <h2>Interview detail</h2>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="close-detail"
                  aria-label="Close record detail"
                  data-testid="button-close-detail"
                >
                  <X size={18} />
                </button>
              </div>
              {selected.status === "draft" && selectedPath && (
                <Link
                  href={`/interview?type=${encodeURIComponent(selectedPath)}&draft=${encodeURIComponent(selected.id)}`}
                  className="button button-primary"
                  data-testid="link-resume-draft"
                >
                  Continue draft <ArrowUpRight size={16} />
                </Link>
              )}
              <div className="detail-grid">
                <div>
                  <span>INTERVIEWER</span>
                  <strong>{answerText(selected.answers["2"])}</strong>
                </div>
                <div>
                  <span>INTERVIEW DATE</span>
                  <strong>{answerText(selected.answers["3"])}</strong>
                </div>
                <div>
                  <span>RESPONDENT PATH</span>
                  <strong>{selectedTab.label}</strong>
                </div>
                <div>
                  <span>STATUS</span>
                  <strong>{selected.status}</strong>
                </div>
                <div>
                  <span>LAST UPDATED</span>
                  <strong>{displayDate(selected.updatedAt)}</strong>
                </div>
                <div>
                  <span>SUBMITTED</span>
                  <strong>
                    {selected.submittedAt
                      ? displayDate(selected.submittedAt)
                      : "Not submitted"}
                  </strong>
                </div>
              </div>
              <div className="detail-answers">
                {detailQuestions.map((question) => (
                  <div className="detail-answer" key={question.n}>
                    <span>
                      {question.n}. {question.prompt}
                    </span>
                    <p>{answerText(selected.answers[String(question.n)])}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
          <div className="dashboard-bottom-note">
            <FileSpreadsheet size={18} />
            <p>
              <strong>Workbook contains three worksheets.</strong> The export
              includes separate CBHI, MINALOC and RSSB sheets and preserves
              draft/submitted status.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
