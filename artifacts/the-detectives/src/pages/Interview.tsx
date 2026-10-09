import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { Link, useLocation } from "wouter";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronLeft,
  CircleHelp,
  ClipboardList,
  Save,
  ShieldAlert,
  X,
} from "lucide-react";
import { SiteHeader } from "@/components/Brand";
import { answersToRecord, friendlyError, interviewApi, recordToAnswers, type InterviewRecord, type RespondentType } from "@/lib/api";
import {
  isVisible,
  questionnaire,
  respondentPaths,
  type Question,
} from "@/lib/questionnaire";

const pathName = (value: string) =>
  value === "CBHI member (community)" ? "Community / CBHI" : value;
const apiTypeFor = (value: string): RespondentType | null =>
  value === "CBHI member (community)"
    ? "cbhi"
    : value === "MINALOC"
      ? "minaloc"
      : value === "RSSB"
        ? "rssb"
        : null;
function Field({
  question,
  value,
  onChange,
}: {
  question: Question;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  const inputId = `answer-${question.n}`;
  if (question.kind === "radio")
    return (
      <fieldset className="choice-fields">
        <legend className="sr-only">{question.prompt}</legend>
        {question.options?.map((option, index) => (
          <label
            className={`answer-option ${value === option ? "selected" : ""}`}
            key={option}
            htmlFor={`${inputId}-${index}`}
          >
            <input
              id={`${inputId}-${index}`}
              type="radio"
              name={`q-${question.n}`}
              value={option}
              checked={value === option}
              onChange={() => onChange(option)}
              data-testid={`input-answer-${question.n}-${index}`}
            />
            <span className="custom-radio" />
            <span>{option}</span>
          </label>
        ))}
      </fieldset>
    );
  if (question.kind === "checkbox") {
    const chosen = Array.isArray(value) ? (value as string[]) : [];
    return (
      <fieldset className="choice-fields">
        <legend className="sr-only">{question.prompt}</legend>
        {question.options?.map((option, index) => (
          <label
            className={`answer-option answer-check ${chosen.includes(option) ? "selected" : ""}`}
            key={option}
            htmlFor={`${inputId}-${index}`}
          >
            <input
              id={`${inputId}-${index}`}
              type="checkbox"
              checked={chosen.includes(option)}
              onChange={(event) =>
                onChange(
                  event.target.checked
                    ? [...chosen, option]
                    : chosen.filter((item) => item !== option),
                )
              }
              data-testid={`input-answer-${question.n}-${index}`}
            />
            <span className="custom-check">
              {chosen.includes(option) && <Check size={12} />}
            </span>
            <span>{option}</span>
          </label>
        ))}
      </fieldset>
    );
  }
  if (question.kind === "rating")
    return (
      <div
        className="rating-options"
        role="radiogroup"
        aria-label={question.prompt}
      >
        {[1, 2, 3, 4, 5].map((number) => (
          <label
            className={`rating-choice ${value === String(number) ? "selected" : ""}`}
            key={number}
          >
            <input
              type="radio"
              name={`q-${question.n}`}
              value={number}
              checked={value === String(number)}
              onChange={() => onChange(String(number))}
              data-testid={`input-rating-${question.n}-${number}`}
            />
            <span>{number}</span>
          </label>
        ))}
        <div className="rating-ends">
          <span>{question.options?.[0]}</span>
          <span>{question.options?.[1]}</span>
        </div>
      </div>
    );
  if (question.kind === "matrix")
    return (
      <div className="matrix-fields">
        {question.options?.map((row, index) => (
          <div className="matrix-row" key={row}>
            <span>{row}</span>
            <div className="matrix-scale" role="radiogroup" aria-label={row}>
              {[1, 2, 3, 4, 5].map((number) => (
                <label
                  key={number}
                  className={
                    value &&
                    (value as Record<string, string>)[row] === String(number)
                      ? "selected"
                      : ""
                  }
                >
                  <input
                    type="radio"
                    name={`matrix-${question.n}-${index}`}
                    checked={
                      !!value &&
                      (value as Record<string, string>)[row] === String(number)
                    }
                    onChange={() =>
                      onChange({
                        ...((value as Record<string, string>) || {}),
                        [row]: String(number),
                      })
                    }
                    data-testid={`input-matrix-${question.n}-${index}-${number}`}
                  />
                  <span>{number}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
        <div className="matrix-head">
          <span>1 = very poor</span>
          <span>5 = very good</span>
        </div>
      </div>
    );
  if (question.kind === "select")
    return (
      <select
        id={inputId}
        aria-label={question.prompt}
        value={String(value ?? "")}
        onChange={(event) => onChange(event.target.value)}
        className="answer-input"
        data-testid={`input-answer-${question.n}`}
      >
        <option value="">Choose an option</option>
        {question.options?.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    );
  const common = {
    id: inputId,
    "aria-label": question.prompt,
    value: String(value ?? ""),
    onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange(event.target.value),
    "data-testid": `input-answer-${question.n}`,
  };
  if (question.kind === "textarea")
    return (
      <textarea
        {...common}
        rows={5}
        placeholder="Record the participant’s answer in their own words."
        className="answer-textarea"
      />
    );
  if (question.kind === "date")
    return <input {...common} type="date" className="answer-input" />;
  if (question.kind === "number")
    return (
      <input
        {...common}
        type="number"
        min={question.min}
        max={question.max}
        step="1"
        className="answer-input"
        inputMode="numeric"
      />
    );
  return (
    <input
      {...common}
      type={question.kind === "url" ? "url" : "text"}
      pattern={question.n === 1 ? "^[UMR]-\\d{3}$" : undefined}
      placeholder={question.n === 1 ? "U-001" : "Enter response"}
      className="answer-input"
    />
  );
}
export default function Interview() {
  const [, setLocation] = useLocation();
  const queryType =
    new URLSearchParams(window.location.search).get("type") || "";
  const draftFromQuery =
    new URLSearchParams(window.location.search).get("draft") || "";
  const [answers, setAnswers] = useState<Record<number, unknown>>(() => {
    const match = Object.keys(respondentPaths).find(
      (type) => type === queryType,
    );
    return match ? { 5: match } : {};
  });
  const [activeNumber, setActiveNumber] = useState(1);
  const [error, setError] = useState("");
  const [stopped, setStopped] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [skipped, setSkipped] = useState<number[]>([]);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [draftType, setDraftType] = useState<RespondentType | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");
  const [loadingDraft, setLoadingDraft] = useState(Boolean(draftFromQuery));
  const selectedType = String(answers[5] || "");
  const respondentType = apiTypeFor(selectedType);
  useEffect(() => {
    const draftType = apiTypeFor(queryType);
    if (!draftFromQuery || !draftType) {
      setLoadingDraft(false);
      return;
    }
    let active = true;
    interviewApi
      .get(draftType, draftFromQuery)
      .then((record) => {
        if (!active) return;
        if (record.status !== "draft") {
          setError("This interview has already been submitted and cannot be resumed.");
          return;
        }
        setAnswers(recordToAnswers(record.answers));
        setSkipped(record.skippedQuestions);
        setActiveNumber(record.activeQuestion ?? 1);
        setDraftId(record.id);
        setDraftType(record.respondentType);
        setSaveStatus("DRAFT RESUMED");
      })
      .catch((requestError: unknown) => {
        if (active) setError(friendlyError(requestError));
      })
      .finally(() => {
        if (active) setLoadingDraft(false);
      });
    return () => {
      active = false;
    };
  }, [draftFromQuery, queryType]);
  const relevantNumbers = selectedType
    ? respondentPaths[selectedType]
    : respondentPaths["CBHI member (community)"].slice(0, 5);
  const visibleQuestions = useMemo(
    () =>
      questionnaire.filter(
        (question) =>
          relevantNumbers.includes(question.n) && isVisible(question, answers),
      ),
    [answers, relevantNumbers],
  );
  const activeIndex = Math.max(
    0,
    visibleQuestions.findIndex((question) => question.n === activeNumber),
  );
  const question = visibleQuestions[activeIndex] ?? visibleQuestions[0];
  const routeKey =
    selectedType === "MINALOC" ? "M" : selectedType === "RSSB" ? "R" : "U";
  const routePresentation =
    selectedType === "MINALOC"
      ? {
          eyebrow: "MINALOC · INSTITUTIONAL INTERVIEW",
          title: "Classification and household transitions",
          summary: "Focus: Ubudehe criteria, appeals, changing household circumstances, and coordination with RSSB.",
        }
      : selectedType === "RSSB"
        ? {
            eyebrow: "RSSB · INSTITUTIONAL INTERVIEW",
            title: "Funding, services, and member concerns",
            summary: "Focus: CBHI financing, facility payments, services received, and complaints from members.",
          }
        : {
            eyebrow: "CBHI · COMMUNITY INTERVIEW",
            title: "Everyday experience with Mutuelle",
            summary: "Focus: household classification, health-centre visits, extra costs, and financial protection.",
          };
  const progress = question
    ? Math.round((activeIndex / Math.max(visibleQuestions.length - 1, 1)) * 100)
    : 100;
  const actionsDisabled =
    saving || loadingDraft || Boolean(draftFromQuery && !draftId);
  const updateAnswer = (number: number, value: unknown) => {
    setAnswers((current) => ({ ...current, [number]: value }));
    setSkipped((current) => current.filter((item) => item !== number));
    setError("");
  };
  const saveDraft = async (
    activeQuestion: number,
    answerValues = answers,
    skippedValues = skipped,
  ) => {
    const type = apiTypeFor(String(answerValues[5] ?? ""));
    if (!type) throw new Error("Choose an interview type before saving.");
    const expectedPrefix = type === "cbhi" ? "U" : type === "minaloc" ? "M" : "R";
    if (!new RegExp(`^${expectedPrefix}-\\d{3}$`).test(String(answerValues[1] ?? ""))) {
      throw new Error(`Use a ${expectedPrefix}-001 interview ID for this respondent type.`);
    }
    const payload = {
      answers: answersToRecord(answerValues),
      skippedQuestions: skippedValues,
      activeQuestion,
    };
    let record: InterviewRecord;
    if (draftId && draftType === type) {
      record = await interviewApi.update(type, draftId, payload);
    } else {
      const previousDraft = draftId && draftType ? { id: draftId, type: draftType } : null;
      record = await interviewApi.create({ respondentType: type, ...payload });
      if (previousDraft) {
        try {
          await interviewApi.delete(previousDraft.type, previousDraft.id);
        } catch {
          setError("A previous draft for the other respondent type could not be removed.");
        }
      }
    }
    setDraftId(record.id);
    setDraftType(type);
    setSaveStatus(record.status === "submitted" ? "SUBMITTED" : "DRAFT SAVED");
    return record;
  };
  const stopAndDiscard = async (message: string) => {
    setSaving(true);
    try {
      if (draftId && respondentType) await interviewApi.delete(respondentType, draftId);
      setDraftId(null);
      setDraftType(null);
      setStopped(message);
    } catch (requestError) {
      setError(`The interview has stopped, but the saved draft could not be removed: ${friendlyError(requestError)}`);
      setStopped(message);
    } finally {
      setSaving(false);
    }
  };
  const submitDraft = async (
    answerValues = answers,
    skippedValues = skipped,
    activeQuestion = question?.n ?? 1,
  ) => {
    if (!respondentType || !draftId) throw new Error("The interview draft has not been saved yet.");
    const record = await saveDraft(activeQuestion, answerValues, skippedValues);
    await interviewApi.submit(respondentType, record.id);
    setSaveStatus("SUBMITTED");
    setSubmitted(true);
  };
  const validate = (q: Question) => {
    const answer = answers[q.n];
    if (
      q.required &&
      (answer === undefined ||
        answer === "" ||
        (Array.isArray(answer) && answer.length === 0))
    )
      return [1, 2, 3, 4, 5].includes(q.n)
        ? "This interviewer field is required to continue."
        : "Please record an answer, or choose “Skip question” if the participant does not wish to answer.";
    if (q.n === 1 && answer && !/^[UMR]-\d{3}$/.test(String(answer)))
      return "Use U-001, M-001, or R-001.";
    if (q.kind === "number" && answer !== undefined && answer !== "") {
      const numeric = Number(answer);
      if (
        !Number.isFinite(numeric) ||
        (q.min !== undefined && numeric < q.min) ||
        (q.max !== undefined && numeric > q.max)
      )
        return `Enter a number${q.min !== undefined ? ` from ${q.min}` : ""}${q.max !== undefined ? ` to ${q.max}` : ""}.`;
    }
    if (
      q.kind === "matrix" &&
      q.required &&
      Object.keys((answer || {}) as object).length !== q.options?.length
    )
      return "Please rate each part of the service.";
    return "";
  };
  const next = async () => {
    if (!question || saving || loadingDraft || (draftFromQuery && !draftId)) return;
    const invalid = validate(question);
    if (invalid) {
      setError(invalid);
      return;
    }
    const response = answers[question.n];
    if (question.n === 6 && response === "No") {
      await stopAndDiscard(
        "The participant is under 18. The interview has ended, as required by the consent protocol.",
      );
      return;
    }
    if (
      (question.n === 7 || question.n === 46 || question.n === 76) &&
      response === "No"
    ) {
      await stopAndDiscard(
        "The participant declined to take part. The interview has ended without proceeding to any further questions.",
      );
      return;
    }
    if (question.n === 5) {
      const chosen = String(response);
      setAnswers((current) => ({ ...current, 5: chosen }));
      const nextPath = respondentPaths[chosen];
      if (nextPath) {
        setSaving(true);
        try {
          await saveDraft(nextPath[5]);
          setActiveNumber(nextPath[5]);
          setLocation(`/interview?type=${encodeURIComponent(chosen)}`);
        } catch (requestError) {
          setError(friendlyError(requestError));
        } finally {
          setSaving(false);
        }
        return;
      }
    }
    const nextQuestion = visibleQuestions[activeIndex + 1];
    if (nextQuestion) {
      if (draftId && respondentType) {
        setSaving(true);
        try {
          await saveDraft(nextQuestion.n);
        } catch (requestError) {
          setError(friendlyError(requestError));
          setSaving(false);
          return;
        }
        setSaving(false);
      }
      setActiveNumber(nextQuestion.n);
      setError("");
    } else {
      setSaving(true);
      try {
        await submitDraft(answers, skipped, question.n);
      } catch (requestError) {
        setError(friendlyError(requestError));
      } finally {
        setSaving(false);
      }
    }
  };
  const skipQuestion = async () => {
    if (!question || saving || loadingDraft || (draftFromQuery && !draftId)) return;
    if ([6, 7, 46, 76].includes(question.n)) {
      await stopAndDiscard(
        question.n === 6
          ? "The participant’s age could not be confirmed. The interview has ended to protect the participant."
          : "Consent could not be confirmed. The interview has ended without proceeding to any further questions.",
      );
      return;
    }
    const nextSkipped = skipped.includes(question.n)
      ? skipped
      : [...skipped, question.n];
    setSkipped(nextSkipped);
    const nextQuestion = visibleQuestions[activeIndex + 1];
    setSaving(true);
    try {
      if (draftId && respondentType) {
        await saveDraft(nextQuestion?.n ?? question.n, answers, nextSkipped);
      }
      if (nextQuestion) {
        setActiveNumber(nextQuestion.n);
        setError("");
      } else {
        await submitDraft(answers, nextSkipped, question.n);
      }
    } catch (requestError) {
      setError(friendlyError(requestError));
    } finally {
      setSaving(false);
    }
  };
  const back = () => {
    if (submitted || stopped) {
      setSubmitted(false);
      setStopped("");
      return;
    }
    const previous = visibleQuestions[activeIndex - 1];
    if (previous) {
      setActiveNumber(previous.n);
      setError("");
    } else {
      setLocation("/");
    }
  };
  const restart = () => {
    setAnswers({});
    setSkipped([]);
    setActiveNumber(1);
    setError("");
    setStopped("");
    setSubmitted(false);
    setDraftId(null);
    setDraftType(null);
    setSaveStatus("");
    setLocation("/interview");
  };
  const sectionChanged =
    activeIndex === 0 ||
    visibleQuestions[activeIndex - 1]?.section !== question?.section;
  return (
    <div className="site">
      <SiteHeader />
      <main className="interview-page">
        <div className="interview-shell">
          <div className="interview-topline">
            <Link href="/" className="back-home" data-testid="link-back-home">
              <ArrowLeft size={15} /> Research home
            </Link>
            <span>
              <ClipboardList size={13} /> OPEN FIELDWORK
            </span>
          </div>
          <div className="interview-heading-block">
            <div>
              <p className="eyebrow">
                <span className="eyebrow-line" />
                {question?.n === 1 ? routePresentation.eyebrow : `INTERVIEWER-LED · ${pathName(selectedType).toUpperCase()}`}
              </p>
              <h1>
                {submitted
                  ? "Interview complete."
                  : stopped
                    ? "Interview ended."
                    : question?.n === 1
                      ? routePresentation.title
                      : "Listen first."}
              </h1>
              <p>
                {submitted
                  ? "Thank you. The submitted interview is saved in the research database."
                  : stopped
                    ? "The participant’s choice has been respected."
                    : question?.n === 1
                      ? routePresentation.summary
                      : "Ask each question aloud and record the participant’s answer. They do not complete this form themselves."}
              </p>
            </div>
            <div className="session-code">
              <ClipboardList size={18} />
              <span>
                INTERVIEWER
                <br />
                <strong>
                  {answers[1] ? String(answers[1]) : "NOT RECORDED"}
                </strong>
              </span>
            </div>
          </div>
          {submitted ? (
            <div
              className="completion-panel"
              data-testid="status-interview-complete"
            >
              <div className="completion-icon">
                <Check size={22} />
              </div>
              <p className="eyebrow">END OF INTERVIEW</p>
              <h2>Interview submitted.</h2>
              <p>The Detectives, Isomo Academy.</p>
              <p>
                The answers are saved in the research database and available
                from the research dashboard.
              </p>
              <div className="completion-actions">
                <button
                  className="button button-primary"
                  onClick={restart}
                  data-testid="button-new-interview"
                >
                  Start another interview <ArrowRight size={16} />
                </button>
                <Link
                  href="/"
                  className="button button-quiet"
                  data-testid="link-research-home"
                >
                  Return to research home
                </Link>
              </div>
            </div>
          ) : stopped ? (
            <div className="stop-panel" data-testid="status-interview-stopped">
              <ShieldAlert size={28} />
              <div>
                <p className="eyebrow">CONSENT PROTOCOL</p>
                <h2>Stop here.</h2>
                <p>{stopped}</p>
                <p className="stop-note">
                  No further questions were asked. Do not record additional
                  participant answers.
                </p>
                {error && (
                  <p className="field-error" role="alert">
                    {error}
                  </p>
                )}
              </div>
              <button
                className="button button-quiet"
                onClick={restart}
                data-testid="button-close-interview"
              >
                Close interview
              </button>
            </div>
          ) : (
            <>
              <div className="progress-row">
                <span>
                  QUESTION {question?.n}{" "}
                  <span className="progress-muted">
                    · STEP {activeIndex + 1} / {visibleQuestions.length}
                  </span>
                </span>
                <span>{saving ? "SAVING…" : saveStatus || `${progress}% COMPLETE`}</span>
              </div>
              <div
                className="progress-track"
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Interview progress"
              >
                <span style={{ width: `${Math.max(progress, 3)}%` }} />
              </div>
              <section
                className="question-panel"
                key={question?.n}
                data-testid={`question-panel-${question?.n}`}
              >
                {question && (
                  <>
                    <div className="question-section-label">
                      <span>{question.section}</span>
                      <span>{question.sectionTitle}</span>
                    </div>
                    {sectionChanged && question.section === "U1" && (
                      <div className="read-aloud">
                        <CircleHelp size={16} />
                        <p>
                          <strong>Read aloud before continuing</strong>
                          <br />
                          “We are students from Isomo Academy studying how
                          Mutuelle de Santé works for families, so we can
                          suggest improvements. We are not from the government.
                          There are no right or wrong answers. We will not write
                          your name. You may skip any question or stop at any
                          time. Your words may be used as an anonymous quote.”
                        </p>
                      </div>
                    )}
                    <div className="question-title-row">
                      <span className="question-number">
                        {String(question.n).padStart(2, "0")}
                      </span>
                      <div>
                        <h2>
                          {question.prompt}
                          {question.required && (
                            <span className="required-mark"> *</span>
                          )}
                        </h2>
                        {question.help && (
                          <p className="question-help">{question.help}</p>
                        )}
                        {question.n === 51 || question.n === 85 ? (
                          <span className="key-tag">KEY QUESTION</span>
                        ) : null}
                        {skipped.includes(question.n) && (
                          <p
                            className="question-help"
                            data-testid={`status-skipped-${question.n}`}
                          >
                            Skipped at the participant’s request. You can still
                            record an answer.
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="question-field">
                      <Field
                        question={question}
                        value={answers[question.n]}
                        onChange={(value) => updateAnswer(question.n, value)}
                      />
                    </div>
                    {error && (
                      <p
                        className="field-error"
                        role="alert"
                        data-testid="status-validation-error"
                      >
                        {error}
                      </p>
                    )}
                  </>
                )}
              </section>
              <div className="interview-actions">
                <button
                  className="button button-quiet"
                  onClick={back}
                  disabled={actionsDisabled}
                  data-testid="button-back"
                >
                  <ChevronLeft size={17} /> Back
                </button>
                <div
                  className={`interview-action-right ${[1, 2, 3, 4, 5].includes(question?.n ?? -1) ? "single-action" : ""}`}
                >
                  {![1, 2, 3, 4, 5].includes(question?.n ?? -1) && (
                    <button
                      className="button button-quiet"
                      onClick={skipQuestion}
                      disabled={actionsDisabled}
                      data-testid="button-skip"
                    >
                      Skip question
                    </button>
                  )}
                  <button
                    className="button button-primary"
                    onClick={next}
                    disabled={actionsDisabled}
                    data-testid="button-continue"
                  >
                    {question?.n === 41 ||
                    question?.n === 71 ||
                    question?.n === 102
                      ? "Submit interview"
                      : "Continue"}{" "}
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
              <div className="interview-disclaimer">
                <ShieldAlert size={15} />
                <span>
                  Drafts save securely when you continue and are submitted only
                  at the end. Do not enter participant names, phone numbers or
                  email addresses.
                </span>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
