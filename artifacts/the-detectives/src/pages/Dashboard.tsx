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
import { useLanguage } from "@/lib/i18n";
import {
  friendlyError,
  interviewApi,
  type InterviewRecord,
  type RespondentType,
} from "@/lib/api";
import { questionnaire, respondentPaths } from "@/lib/questionnaire";
const tabs = ["CBHI", "MINALOC", "RSSB"];
const chartColors = ["#2f6792", "#56a2bf", "#7aa88d", "#d9a85b", "#9d83b6", "#d07869"];
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
  const { t } = useLanguage();
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
              <ArrowLeft size={15} /> {t("Admin access")}
            </Link>
            <span className="dashboard-demo-label">
              <ShieldAlert size={15} /> {t("DEMONSTRATION DATA ONLY")}
            </span>
          </div>
          <div className="dashboard-title-row">
            <div>
              <p className="eyebrow">
                <span className="eyebrow-line" />
                {t("RESEARCH TEAM · PREVIEW ONLY")}
              </p>
              <h1>{t("Response overview")}</h1>
              <p>
                {t("Visual preview of how the research dashboard could be organized.")}
              </p>
            </div>
            <button
              className="button button-outline"
              disabled
              title={t("Excel download will be available when secure data storage is configured")}
              data-testid="button-download-disabled"
            >
              <Download size={16} /> {t("Download research data")}{" "}
              <span className="coming-soon">{t("FUTURE")}</span>
            </button>
          </div>
          <div className="demo-warning">
            <ShieldAlert size={18} />
            <p>
              <strong>{t("DEMONSTRATION ONLY — not research data.")}</strong>{" "}
              {t("These invented sample records are included only to show the interface. No participant responses are available here.")}
            </p>
          </div>
          <section className="overview-strip">
            <div>
              <span>{t("INTERVIEWS IN THIS DEMO")}</span>
              <strong>04</strong>
              <small>{t("sample records only")}</small>
            </div>
            <div>
              <span>{t("CBHI SAMPLE")}</span>
              <strong>02</strong>
              <small>{t("demonstration records")}</small>
            </div>
            <div>
              <span>{t("INSTITUTIONAL SAMPLES")}</span>
              <strong>02</strong>
              <small>MINALOC + RSSB</small>
            </div>
            <div className="overview-secure">
              <Users size={19} />
              <span>{t("No live data connected")}</span>
            </div>
          </section>
          <div
            className="dashboard-tabs"
            role="tablist"
            aria-label={t("Response groups")}
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
                {group} {t("Responses")} <span>{group === "CBHI" ? "02" : "01"}</span>
              </button>
            ))}
          </div>
          <section className="response-panel">
            <div className="response-panel-head">
              <div>
                <span className="panel-overline">{tab} · {t("RESPONSE LOG")}</span>
                <h2>{t("Interview records")}</h2>
              </div>
              <label className="table-search">
                <Search size={15} />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={t("Find an ID or interviewer")}
                  aria-label={t("Search demonstration responses")}
                  data-testid="input-search-responses"
                />
              </label>
            </div>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>{t("INTERVIEW ID")}</th>
                    <th>{t("DATE")}</th>
                    <th>{t("INTERVIEWER")}</th>
                    <th>{t("RECORD TYPE")}</th>
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
                        <span className="table-demo-tag">{t("DEMO")}</span>
                      </td>
                      <td>{row.date}</td>
                      <td>{row.interviewer}</td>
                      <td>
                        <span className="record-type">{t(row.note)}</span>
                      </td>
                      <td>
                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            setSelected(row);
                          }}
                          aria-label={`${t("View demonstration record")} ${row.id}`}
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
                        {t("No demonstration records match")} “{search}”.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="panel-footer">
              <span>{t("Showing demonstration records for")} {tab}</span>
              <span>{t("Sample data · never research data")}</span>
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
                    {t("DEMONSTRATION RECORD")} · {selected.id}
                  </span>
                  <h2>{t("Interview detail")}</h2>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="close-detail"
                  aria-label={t("Close record detail")}
                  data-testid="button-close-detail"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="detail-grid">
                <div>
                  <span>{t("INTERVIEWER")}</span>
                  <strong>{selected.interviewer}</strong>
                </div>
                <div>
                  <span>{t("DATE")}</span>
                  <strong>{selected.date}</strong>
                </div>
                <div>
                  <span>{t("PARTICIPANT PATH")}</span>
                  <strong>
                    {selected.group === "CBHI"
                      ? t("Community / CBHI")
                      : `${selected.group} ${t("official")}`}
                  </strong>
                </div>
              </div>
              <div className="detail-summary">
                <span>{t("DEMONSTRATION SUMMARY")}</span>
                <p>{t(selected.summary)}</p>
              </div>
            </section>
          )}
          <div className="dashboard-bottom-note">
            <FileSpreadsheet size={18} />
            <p>
              <strong>{t("Excel export is a future feature.")}</strong>{" "}
              {t("When implemented, it is intended to provide three separate worksheets—CBHI, MINALOC and RSSB. No workbook is generated in this preview.")}
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

function answerText(
  value: unknown,
  translate: (text: string) => string = (text) => text,
): string {
  if (value === null || value === undefined || value === "") return "—";
  if (Array.isArray(value))
    return value.map((item) => translate(String(item))).join(", ");
  if (typeof value === "object")
    return Object.entries(value)
      .map(([key, item]) => `${translate(key)}: ${translate(String(item))}`)
      .join(", ");
  return translate(String(value));
}

function displayDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
}

function hasAnswer(value: unknown): boolean {
  if (Array.isArray(value)) return value.length > 0;
  if (value && typeof value === "object") return Object.keys(value).length > 0;
  return value !== null && value !== undefined && String(value).trim() !== "";
}

function percentage(value: number, total: number): number {
  return total ? Math.round((value / total) * 100) : 0;
}

function AnalyticsPieCard({
  title,
  data,
  emptyText,
  responsesText,
}: {
  title: string;
  data: { name: string; value: number; fill: string }[];
  emptyText: string;
  responsesText: string;
}) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let accumulated = 0;
  const gradient = data
    .map((item) => {
      const start = (accumulated / total) * 100;
      accumulated += item.value;
      const end = (accumulated / total) * 100;
      return `${item.fill} ${start}% ${end}%`;
    })
    .join(", ");

  return (
    <article className="analytics-pie-card">
      <h3>{title}</h3>
      {total ? (
        <div className="analytics-pie-content">
          <div className="analytics-pie-chart">
            <div
              className="analytics-pie-donut"
              role="img"
              aria-label={`${title}: ${data.map((item) => `${item.name}, ${item.value} ${responsesText}, ${percentage(item.value, total)}%`).join("; ")}`}
              style={{ background: `conic-gradient(${gradient})` }}
            >
              <strong className="analytics-pie-total">{total}</strong>
            </div>
          </div>
          <ul className="analytics-legend">
            {data.map((item) => (
              <li key={item.name}>
                <span className="analytics-legend-name">
                  <i style={{ backgroundColor: item.fill }} />
                  {item.name}
                </span>
                <span>
                  {item.value} <small>{percentage(item.value, total)}%</small>
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="analytics-empty">{emptyText}</p>
      )}
    </article>
  );
}

export default function Dashboard() {
  const { t, questionText } = useLanguage();
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
  const tabRecords = records.filter((record) => record.respondentType === tab);
  const statusChart = [
    { name: t("Submitted"), value: submitted, fill: chartColors[0] },
    { name: t("Draft"), value: drafts, fill: chartColors[3] },
  ].filter((item) => item.value > 0);
  const groupChart = liveTabs
    .map((item, index) => ({
      name: item.label,
      value: countFor(item.type),
      fill: chartColors[index],
    }))
    .filter((item) => item.value > 0);
  const analysisQuestions = questionnaire
    .filter(
      (question) =>
        respondentPaths[selectedTab.path].includes(question.n) &&
        ["radio", "select", "checkbox", "rating"].includes(question.kind),
    )
    .map((question) => {
      const counts = new Map<string, number>();
      const answeredRecords = tabRecords.filter((record) =>
        hasAnswer(record.answers[String(question.n)]),
      );
      for (const record of answeredRecords) {
        const answer = record.answers[String(question.n)];
        const selectedAnswers = Array.isArray(answer) ? answer : [answer];
        for (const selectedAnswer of selectedAnswers) {
          const value = String(selectedAnswer);
          counts.set(value, (counts.get(value) ?? 0) + 1);
        }
      }
      const options =
        question.kind === "rating"
          ? ["1", "2", "3", "4", "5"]
          : question.options ?? [];
      const optionValues = [...options, ...counts.keys()].filter(
        (value, index, values) => values.indexOf(value) === index,
      );
      return {
        question,
        total: answeredRecords.length,
        entries: optionValues.map((value, index) => ({
          label: t(value),
          count: counts.get(value) ?? 0,
          percentage: percentage(counts.get(value) ?? 0, answeredRecords.length),
          color: chartColors[index % chartColors.length],
        })),
      };
    });
  const numericInsights = questionnaire
    .filter(
      (question) =>
        question.kind === "number" &&
        respondentPaths[selectedTab.path].includes(question.n),
    )
    .map((question) => {
      const values = tabRecords
        .map((record) => {
          const answer = record.answers[String(question.n)];
          if (!hasAnswer(answer)) return null;
          const value = Number(answer);
          return Number.isFinite(value) ? value : null;
        })
        .filter((value): value is number => value !== null)
        .sort((left, right) => left - right);
      const middle = Math.floor(values.length / 2);
      const median = values.length
        ? values.length % 2
          ? values[middle]
          : (values[middle - 1] + values[middle]) / 2
        : null;
      return {
        question,
        count: values.length,
        mean: values.length
          ? values.reduce((sum, value) => sum + value, 0) / values.length
          : null,
        median,
        min: values[0],
        max: values[values.length - 1],
      };
    })
    .filter((insight) => insight.count > 0);
  const matrixInsights = questionnaire
    .filter(
      (question) =>
        question.kind === "matrix" &&
        respondentPaths[selectedTab.path].includes(question.n),
    )
    .flatMap((question) =>
      (question.options ?? []).map((row) => {
        const values = tabRecords
          .map((record) => {
            const answer = record.answers[String(question.n)];
            if (!answer || typeof answer !== "object" || Array.isArray(answer))
              return null;
            const value = Number((answer as Record<string, unknown>)[row]);
            return Number.isFinite(value) && value > 0 ? value : null;
          })
          .filter((value): value is number => value !== null);
        return {
          question,
          row,
          count: values.length,
          mean: values.length
            ? values.reduce((sum, value) => sum + value, 0) / values.length
            : null,
        };
      }),
    )
    .filter((insight) => insight.count > 0);

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
              <ArrowLeft size={15} /> {t("Research home")}
            </Link>
            <div className="dashboard-tools">
              <span className="dashboard-live-label">
                <ShieldAlert size={15} /> {t("RESEARCH RESPONSE DATA")}
              </span>
            </div>
          </div>
          <div className="dashboard-title-row">
            <div>
              <p className="eyebrow">
                <span className="eyebrow-line" />
                {t("RESEARCH TEAM · LIVE DATA")}
              </p>
              <h1>{t("Response overview")}</h1>
              <p>{t("Submitted interviews and drafts in the research database.")}</p>
            </div>
            <button
              className="button button-outline"
              onClick={downloadWorkbook}
              disabled={loading || exporting}
              data-testid="button-download-workbook"
            >
              <Download size={16} />{" "}
              {exporting ? t("Preparing workbook…") : t("Download research data")}{" "}
              <span className="coming-soon">XLSX</span>
            </button>
          </div>
          {error && (
            <div className="demo-warning" role="alert">
              <ShieldAlert size={18} />
              <p>{t(error)}</p>
            </div>
          )}
          <section className="overview-strip">
            <div>
              <span>{t("TOTAL INTERVIEWS")}</span>
              <strong>{records.length}</strong>
              <small>{t("all respondent groups")}</small>
            </div>
            <div>
              <span>{t("DRAFTS")}</span>
              <strong>{drafts}</strong>
              <small>{t("not yet submitted")}</small>
            </div>
            <div>
              <span>{t("SUBMITTED")}</span>
              <strong>{submitted}</strong>
              <small>{t("completed interviews")}</small>
            </div>
            <div className="overview-secure">
              <Users size={19} />
              <span>{t("Public response access")}</span>
            </div>
          </section>
          <div
            className="dashboard-tabs"
            role="tablist"
            aria-label={t("Response groups")}
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
                {item.label} {t("Responses")} <span>{countFor(item.type)}</span>
              </button>
            ))}
          </div>
          <section className="analytics-section" aria-labelledby="analytics-title">
            <div className="analytics-heading">
              <div>
                <span className="panel-overline">
                  <Users size={13} /> {t("LIVE RESPONSE ANALYSIS")}
                </span>
                <h2 id="analytics-title">{t("Response analysis")}</h2>
                <p>
                  {t("Charts include saved answers from drafts and submitted interviews.")}
                </p>
              </div>
              <span className="analytics-scope">
                {t("all respondent groups")} · {records.length} {t("interviews")}
              </span>
            </div>
            {loading ? (
              <p className="analytics-empty">{t("Loading research responses…")}</p>
            ) : error ? (
              <p className="analytics-empty" role="status">
                {t("Analysis is unavailable until response data loads successfully.")}
              </p>
            ) : (
              <>
                <div className="analytics-overview">
                  <AnalyticsPieCard
                    title={t("Submission status")}
                    data={statusChart}
                    emptyText={t("No interviews available yet.")}
                    responsesText={t("responses")}
                  />
                  <AnalyticsPieCard
                    title={t("Respondent groups")}
                    data={groupChart}
                    emptyText={t("No interviews available yet.")}
                    responsesText={t("responses")}
                  />
                  <article className="analytics-rate-card">
                    <span>{t("SUBMISSION RATE")}</span>
                    <strong>
                      {records.length
                        ? `${percentage(submitted, records.length)}%`
                        : "—"}
                    </strong>
                    <small>
                      {submitted} {t("submitted out of")} {records.length}{" "}
                      {t("interviews")}
                    </small>
                  </article>
                </div>
                <div className="analytics-results-heading">
                  <div>
                    <h3>{t("Answer breakdowns")}</h3>
                    <p>
                      {t("Percentages use the number of people who answered each question.")}
                    </p>
                  </div>
                  <span>
                    {selectedTab.label} · {analysisQuestions.length} {t("questions")}
                  </span>
                </div>
                {analysisQuestions.length ? (
                  <div className="analytics-question-grid">
                    {analysisQuestions.map(({ question, total, entries }) => (
                      <article
                        className="analytics-question-card"
                        key={question.n}
                      >
                        <div className="analytics-question-heading">
                          <span>Q{question.n}</span>
                          <small>
                            {total} {t("answered")}
                          </small>
                        </div>
                        <h4>{questionText(question.n, question.prompt)}</h4>
                        {total ? (
                          <ul className="analytics-bars">
                            {entries.map((entry) => (
                              <li key={entry.label}>
                                <div className="analytics-bar-heading">
                                  <span>{entry.label}</span>
                                  <small>
                                    {entry.count} · {entry.percentage}%
                                  </small>
                                </div>
                                <div
                                  className="analytics-bar-track"
                                  role="img"
                                  aria-label={`${entry.label}: ${entry.count} ${t("responses")}, ${entry.percentage}%`}
                                >
                                  <span
                                    style={{
                                      width: `${entry.percentage}%`,
                                      backgroundColor: entry.color,
                                    }}
                                  />
                                </div>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="analytics-empty">
                            {t("No answers recorded for this question yet.")}
                          </p>
                        )}
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="analytics-empty">
                    {t("No categorical questions are available for this group.")}
                  </p>
                )}
                {(numericInsights.length > 0 || matrixInsights.length > 0) && (
                  <div className="analytics-statistics">
                    {numericInsights.map((insight) => (
                      <article className="analytics-stat-card" key={insight.question.n}>
                        <span>Q{insight.question.n} · {t("NUMERIC SUMMARY")}</span>
                        <h4>{questionText(insight.question.n, insight.question.prompt)}</h4>
                        <div className="analytics-stat-values">
                          <p>
                            <strong>{insight.mean?.toFixed(1)}</strong>
                            <small>{t("mean")}</small>
                          </p>
                          <p>
                            <strong>{insight.median?.toFixed(1)}</strong>
                            <small>{t("median")}</small>
                          </p>
                          <p>
                            <strong>{insight.min}–{insight.max}</strong>
                            <small>{t("range")}</small>
                          </p>
                          <p>
                            <strong>{insight.count}</strong>
                            <small>{t("answers")}</small>
                          </p>
                        </div>
                      </article>
                    ))}
                    {matrixInsights.map((insight) => (
                      <article
                        className="analytics-stat-card"
                        key={`${insight.question.n}-${insight.row}`}
                      >
                        <span>Q{insight.question.n} · {t("AVERAGE RATING")}</span>
                        <h4>{questionText(insight.question.n, insight.question.prompt)}</h4>
                        <div className="analytics-matrix-result">
                          <span>{t(insight.row)}</span>
                          <strong>{insight.mean?.toFixed(1)} / 5</strong>
                          <small>{insight.count} {t("ratings")}</small>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </>
            )}
          </section>
          <section className="response-panel">
            <div className="response-panel-head">
              <div>
                <span className="panel-overline">
                  {selectedTab.label} · {t("RESPONSE LOG")}
                </span>
                <h2>{t("Interview records")}</h2>
              </div>
              <label className="table-search">
                <Search size={15} />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={t("Find an ID, interviewer or status")}
                  aria-label={t("Search responses")}
                  data-testid="input-search-responses"
                />
              </label>
            </div>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>{t("INTERVIEW ID")}</th>
                    <th>{t("UPDATED")}</th>
                    <th>{t("INTERVIEWER")}</th>
                    <th>{t("STATUS")}</th>
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
                            {t(record.status)}
                          </span>
                        </td>
                        <td>
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              setSelected(record);
                            }}
                            aria-label={`${t("View response")} ${code}`}
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
                          ? t("Responses could not be loaded.")
                          : `${t("No")} ${selectedTab.label} ${t("responses match")} “${search}”.`}
                      </td>
                    </tr>
                  )}
                  {loading && (
                    <tr>
                      <td colSpan={5} className="no-results">
                        {t("Loading research responses…")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="panel-footer">
              <span>
                {t("Showing")} {rows.length} {selectedTab.label} {t("records")}
              </span>
              <span>{t("Draft and submitted status shown separately")}</span>
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
                    {t(selected.status.toUpperCase())} ·{" "}
                    {answerText(selected.answers["1"])}
                  </span>
                  <h2>{t("Interview detail")}</h2>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="close-detail"
                  aria-label={t("Close record detail")}
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
                  {t("Continue draft")} <ArrowUpRight size={16} />
                </Link>
              )}
              <div className="detail-grid">
                <div>
                  <span>{t("INTERVIEWER")}</span>
                  <strong>{answerText(selected.answers["2"], t)}</strong>
                </div>
                <div>
                  <span>{t("INTERVIEW DATE")}</span>
                  <strong>{answerText(selected.answers["3"], t)}</strong>
                </div>
                <div>
                  <span>{t("RESPONDENT PATH")}</span>
                  <strong>{selectedTab.label}</strong>
                </div>
                <div>
                  <span>{t("STATUS")}</span>
                  <strong>{t(selected.status)}</strong>
                </div>
                <div>
                  <span>{t("LAST UPDATED")}</span>
                  <strong>{displayDate(selected.updatedAt)}</strong>
                </div>
                <div>
                  <span>{t("SUBMITTED")}</span>
                  <strong>
                    {selected.submittedAt
                      ? displayDate(selected.submittedAt)
                      : t("Not submitted")}
                  </strong>
                </div>
              </div>
              <div className="detail-answers">
                {detailQuestions.map((question) => (
                  <div className="detail-answer" key={question.n}>
                    <span>
                      {question.n}. {questionText(question.n, question.prompt)}
                    </span>
                    <p>{answerText(selected.answers[String(question.n)], t)}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
          <div className="dashboard-bottom-note">
            <FileSpreadsheet size={18} />
            <p>
              <strong>{t("Workbook contains three worksheets.")}</strong>{" "}
              {t("The export includes separate CBHI, MINALOC and RSSB sheets and preserves draft/submitted status.")}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
