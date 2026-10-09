import { useMemo, useState, type ChangeEvent } from 'react';
import { Link, useLocation } from 'wouter';
import { ArrowLeft, ArrowRight, Check, ChevronLeft, CircleHelp, ClipboardList, LockKeyhole, Save, ShieldAlert, X } from 'lucide-react';
import { SiteHeader } from '@/components/Brand';
import { isVisible, questionnaire, respondentPaths, type Question } from '@/lib/questionnaire';

const pathName = (value: string) => value === 'CBHI member (community)' ? 'Community / CBHI' : value;
function Field({ question, value, onChange }: { question: Question; value: unknown; onChange: (value: unknown) => void }) {
  const inputId = `answer-${question.n}`;
  if (question.kind === 'radio') return <fieldset className="choice-fields"><legend className="sr-only">{question.prompt}</legend>{question.options?.map((option, index) => <label className={`answer-option ${value === option ? 'selected' : ''}`} key={option} htmlFor={`${inputId}-${index}`}><input id={`${inputId}-${index}`} type="radio" name={`q-${question.n}`} value={option} checked={value === option} onChange={() => onChange(option)} data-testid={`input-answer-${question.n}-${index}`}/><span className="custom-radio"/><span>{option}</span></label>)}</fieldset>;
  if (question.kind === 'checkbox') {
    const chosen = Array.isArray(value) ? value as string[] : [];
    return <fieldset className="choice-fields"><legend className="sr-only">{question.prompt}</legend>{question.options?.map((option, index) => <label className={`answer-option answer-check ${chosen.includes(option) ? 'selected' : ''}`} key={option} htmlFor={`${inputId}-${index}`}><input id={`${inputId}-${index}`} type="checkbox" checked={chosen.includes(option)} onChange={(event) => onChange(event.target.checked ? [...chosen, option] : chosen.filter(item => item !== option))} data-testid={`input-answer-${question.n}-${index}`}/><span className="custom-check">{chosen.includes(option) && <Check size={12}/>}</span><span>{option}</span></label>)}</fieldset>;
  }
  if (question.kind === 'rating') return <div className="rating-options" role="radiogroup" aria-label={question.prompt}>{[1, 2, 3, 4, 5].map(number => <label className={`rating-choice ${value === String(number) ? 'selected' : ''}`} key={number}><input type="radio" name={`q-${question.n}`} value={number} checked={value === String(number)} onChange={() => onChange(String(number))} data-testid={`input-rating-${question.n}-${number}`}/><span>{number}</span></label>)}<div className="rating-ends"><span>{question.options?.[0]}</span><span>{question.options?.[1]}</span></div></div>;
  if (question.kind === 'matrix') return <div className="matrix-fields">{question.options?.map((row, index) => <div className="matrix-row" key={row}><span>{row}</span><div className="matrix-scale" role="radiogroup" aria-label={row}>{[1, 2, 3, 4, 5].map(number => <label key={number} className={value && (value as Record<string, string>)[row] === String(number) ? 'selected' : ''}><input type="radio" name={`matrix-${question.n}-${index}`} checked={!!value && (value as Record<string, string>)[row] === String(number)} onChange={() => onChange({ ...(value as Record<string, string> || {}), [row]: String(number) })} data-testid={`input-matrix-${question.n}-${index}-${number}`}/><span>{number}</span></label>)}</div></div>)}<div className="matrix-head"><span>1 = very poor</span><span>5 = very good</span></div></div>;
  if (question.kind === 'select') return <select id={inputId} aria-label={question.prompt} value={String(value ?? '')} onChange={event => onChange(event.target.value)} className="answer-input" data-testid={`input-answer-${question.n}`}><option value="">Choose an option</option>{question.options?.map(option => <option key={option} value={option}>{option}</option>)}</select>;
  const common = { id: inputId, 'aria-label': question.prompt, value: String(value ?? ''), onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(event.target.value), 'data-testid': `input-answer-${question.n}` };
  if (question.kind === 'textarea') return <textarea {...common} rows={5} placeholder="Record the participant’s answer in their own words." className="answer-textarea"/>;
  if (question.kind === 'date') return <input {...common} type="date" className="answer-input"/>;
  if (question.kind === 'number') return <input {...common} type="number" min={question.min} max={question.max} step="1" className="answer-input" inputMode="numeric"/>;
  return <input {...common} type={question.kind === 'url' ? 'url' : 'text'} pattern={question.n === 1 ? '^[UMR]-\\d{3}$' : undefined} placeholder={question.n === 1 ? 'U-001' : 'Enter response'} className="answer-input"/>;
}
export default function Interview() {
  const [, setLocation] = useLocation();
  const queryType = new URLSearchParams(window.location.search).get('type') || '';
  const [answers, setAnswers] = useState<Record<number, unknown>>(() => {
    const match = Object.keys(respondentPaths).find(type => type === queryType);
    return match ? { 5: match } : {};
  });
  const [activeNumber, setActiveNumber] = useState(1);
  const [error, setError] = useState('');
  const [stopped, setStopped] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [skipped, setSkipped] = useState<number[]>([]);
  const selectedType = String(answers[5] || '');
  const relevantNumbers = selectedType ? respondentPaths[selectedType] : respondentPaths['CBHI member (community)'].slice(0, 5);
  const visibleQuestions = useMemo(() => questionnaire.filter(question => relevantNumbers.includes(question.n) && isVisible(question, answers)), [answers, relevantNumbers]);
  const activeIndex = Math.max(0, visibleQuestions.findIndex(question => question.n === activeNumber));
  const question = visibleQuestions[activeIndex] ?? visibleQuestions[0];
  const routeKey = selectedType === 'MINALOC' ? 'M' : selectedType === 'RSSB' ? 'R' : 'U';
  const progress = question ? Math.round((activeIndex / visibleQuestions.length) * 100) : 100;
  const updateAnswer = (number: number, value: unknown) => { setAnswers(current => ({ ...current, [number]: value })); setSkipped(current => current.filter(item => item !== number)); setError(''); };
  const validate = (q: Question) => {
    const answer = answers[q.n];
    if (q.required && (answer === undefined || answer === '' || (Array.isArray(answer) && answer.length === 0))) return [1, 2, 3, 4, 5].includes(q.n) ? 'This interviewer field is required to continue.' : 'Please record an answer, or choose “Skip question” if the participant does not wish to answer.';
    if (q.n === 1 && answer && !/^[UMR]-\d{3}$/.test(String(answer))) return 'Use U-001, M-001, or R-001.';
    if (q.kind === 'number' && answer !== undefined && answer !== '') {
      const numeric = Number(answer);
      if (!Number.isFinite(numeric) || (q.min !== undefined && numeric < q.min) || (q.max !== undefined && numeric > q.max)) return `Enter a number${q.min !== undefined ? ` from ${q.min}` : ''}${q.max !== undefined ? ` to ${q.max}` : ''}.`;
    }
    if (q.kind === 'matrix' && q.required && Object.keys((answer || {}) as object).length !== q.options?.length) return 'Please rate each part of the service.';
    return '';
  };
  const next = () => {
    if (!question) return;
    const invalid = validate(question);
    if (invalid) { setError(invalid); return; }
    const response = answers[question.n];
    if (question.n === 6 && response === 'No') { setStopped('The participant is under 18. The interview has ended, as required by the consent protocol.'); return; }
    if ((question.n === 7 || question.n === 46 || question.n === 76) && response === 'No') { setStopped('The participant declined to take part. The interview has ended without proceeding to any further questions.'); return; }
    if (question.n === 5) {
      const chosen = String(response);
      setAnswers(current => ({ ...current, 5: chosen }));
      const nextPath = respondentPaths[chosen];
      if (nextPath) { setActiveNumber(nextPath[5]); setLocation(`/interview?type=${encodeURIComponent(chosen)}`); return; }
    }
    if (question.n === 41 || question.n === 71 || question.n === 102) { setSubmitted(true); return; }
    const nextQuestion = visibleQuestions[activeIndex + 1];
    if (nextQuestion) { setActiveNumber(nextQuestion.n); setError(''); }
    else setSubmitted(true);
  };
  const skipQuestion = () => {
    if (!question) return;
    if ([6, 7, 46, 76].includes(question.n)) {
      setStopped(question.n === 6
        ? 'The participant’s age could not be confirmed. The interview has ended to protect the participant.'
        : 'Consent could not be confirmed. The interview has ended without proceeding to any further questions.');
      return;
    }
    setSkipped(current => current.includes(question.n) ? current : [...current, question.n]);
    const nextQuestion = visibleQuestions[activeIndex + 1];
    if (nextQuestion) { setActiveNumber(nextQuestion.n); setError(''); }
    else setSubmitted(true);
  };
  const back = () => {
    if (submitted || stopped) { setSubmitted(false); setStopped(''); return; }
    const previous = visibleQuestions[activeIndex - 1];
    if (previous) { setActiveNumber(previous.n); setError(''); }
    else { setLocation('/'); }
  };
  const restart = () => { setAnswers({}); setSkipped([]); setActiveNumber(1); setError(''); setStopped(''); setSubmitted(false); setLocation('/interview'); };
  const sectionChanged = activeIndex === 0 || visibleQuestions[activeIndex - 1]?.section !== question?.section;
  return <div className="site"><SiteHeader/><main className="interview-page"><div className="interview-shell">
    <div className="interview-topline"><Link href="/" className="back-home" data-testid="link-back-home"><ArrowLeft size={15}/> Research home</Link><span><LockKeyhole size={13}/> PRIVATE FIELD SESSION</span></div>
    <div className="interview-heading-block"><div><p className="eyebrow"><span className="eyebrow-line"/>INTERVIEWER-LED · {selectedType ? pathName(selectedType).toUpperCase() : 'NEW SESSION'}</p><h1>{submitted ? 'Interview complete.' : stopped ? 'Interview ended.' : 'Listen first.'}</h1><p>{submitted ? 'Thank you. This preview has not saved answers permanently.' : stopped ? 'The participant’s choice has been respected.' : 'Ask each question aloud and record the participant’s answer. They do not complete this form themselves.'}</p></div><div className="session-code"><ClipboardList size={18}/><span>SESSION<br/><strong>{answers[1] ? String(answers[1]) : 'NOT RECORDED'}</strong></span></div></div>
     {submitted ? <div className="completion-panel" data-testid="status-interview-complete"><div className="completion-icon"><Check size={22}/></div><p className="eyebrow">END OF INTERVIEW</p><h2>Thank you. This interview has been recorded.</h2><p>The Detectives, Isomo Academy.</p><p>In this preview, answers exist only temporarily in this component's memory. They are not stored permanently or securely and will disappear when you leave or reload this page.</p><div className="completion-actions"><button className="button button-primary" onClick={restart} data-testid="button-new-interview">Start another interview <ArrowRight size={16}/></button><Link href="/" className="button button-quiet" data-testid="link-research-home">Return to research home</Link></div></div> : stopped ? <div className="stop-panel" data-testid="status-interview-stopped"><ShieldAlert size={28}/><div><p className="eyebrow">CONSENT PROTOCOL</p><h2>Stop here.</h2><p>{stopped}</p><p className="stop-note">No further questions were asked. Do not record additional participant answers.</p></div><button className="button button-quiet" onClick={restart} data-testid="button-close-session">Close session</button></div> : <><div className="progress-row"><span>QUESTION {question?.n} <span className="progress-muted">/ {routeKey === 'U' ? '41' : routeKey === 'M' ? '71' : '102'}</span></span><span>{progress}% COMPLETE</span></div><div className="progress-track" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label="Interview progress"><span style={{ width: `${Math.max(progress, 3)}%` }}/></div><section className="question-panel" key={question?.n} data-testid={`question-panel-${question?.n}`}>{question && <><div className="question-section-label"><span>{question.section}</span><span>{question.sectionTitle}</span></div>{sectionChanged && question.section === 'U1' && <div className="read-aloud"><CircleHelp size={16}/><p><strong>Read aloud before continuing</strong><br/>“We are students from Isomo Academy studying how Mutuelle de Santé works for families, so we can suggest improvements. We are not from the government. There are no right or wrong answers. We will not write your name. You may skip any question or stop at any time. Your words may be used as an anonymous quote.”</p></div>}<div className="question-title-row"><span className="question-number">{String(question.n).padStart(2, '0')}</span><div><h2>{question.prompt}{question.required && <span className="required-mark"> *</span>}</h2>{question.help && <p className="question-help">{question.help}</p>}{question.n === 51 || question.n === 85 ? <span className="key-tag">KEY QUESTION</span> : null}{skipped.includes(question.n) && <p className="question-help" data-testid={`status-skipped-${question.n}`}>Skipped at the participant’s request. You can still record an answer.</p>}</div></div><div className="question-field"><Field question={question} value={answers[question.n]} onChange={value => updateAnswer(question.n, value)}/></div>{error && <p className="field-error" role="alert" data-testid="status-validation-error">{error}</p>}</>}</section><div className="interview-actions"><button className="button button-quiet" onClick={back} data-testid="button-back"><ChevronLeft size={17}/> Back</button><div className={`interview-action-right ${[1, 2, 3, 4, 5].includes(question?.n ?? -1) ? 'single-action' : ''}`}>{![1, 2, 3, 4, 5].includes(question?.n ?? -1) && <button className="button button-quiet" onClick={skipQuestion} data-testid="button-skip">Skip question</button>}<button className="button button-primary" onClick={next} data-testid="button-continue">{question?.n === 41 || question?.n === 71 || question?.n === 102 ? 'Submit interview' : 'Continue'} <ArrowRight size={16}/></button></div></div><div className="interview-disclaimer"><ShieldAlert size={15}/><span>Do not enter participant names, phone numbers or email addresses. Answers are not saved beyond this temporary preview session.</span></div></>}
  </div></main></div>;
}
