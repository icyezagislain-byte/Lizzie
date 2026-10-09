export type QuestionKind = 'text' | 'textarea' | 'radio' | 'checkbox' | 'date' | 'number' | 'rating' | 'matrix' | 'url' | 'select';
export type Branch = { question: number; equals: string | string[] };
export type Question = {
  n: number;
  section: string;
  sectionTitle: string;
  prompt: string;
  kind: QuestionKind;
  required?: boolean;
  options?: string[];
  min?: number;
  max?: number;
  help?: string;
  branches?: Branch[];
};

const start: Question[] = [
  { n: 1, section: 'S1', sectionTitle: 'Start · everyone', prompt: 'Interview ID', kind: 'text', required: true, help: 'Use U-001 (community), M-001 (MINALOC), R-001 (RSSB).' },
  { n: 2, section: 'S1', sectionTitle: 'Start · everyone', prompt: 'Interviewer', kind: 'select', required: true, options: ['Gislain Icyeza', 'Lizzie Ange Iteriteka', 'Emerton Abudul Lazak', 'Mame Gideon', 'Denyse Mukeshimana'] },
  { n: 3, section: 'S1', sectionTitle: 'Start · everyone', prompt: 'Date of interview', kind: 'date', required: true, help: 'Example: January 7, 2026' },
  { n: 4, section: 'S1', sectionTitle: 'Start · everyone', prompt: 'Language of interview', kind: 'radio', required: true, options: ['Kinyarwanda', 'English', 'French'] },
  { n: 5, section: 'S1', sectionTitle: 'Start · everyone', prompt: 'Who is being interviewed?', kind: 'radio', required: true, options: ['CBHI member (community)', 'MINALOC', 'RSSB'] },
];
const u: Question[] = [
  { n: 6, section: 'U1', sectionTitle: 'Consent · CBHI members', prompt: 'Is the participant 18 years or older?', kind: 'radio', required: true, options: ['Yes', 'No'] },
  { n: 7, section: 'U1', sectionTitle: 'Consent · CBHI members', prompt: 'Did the participant agree to take part after hearing the explanation?', kind: 'radio', required: true, options: ['Yes', 'No'] },
  { n: 8, section: 'U1', sectionTitle: 'Consent · CBHI members', prompt: 'May we use their words as an anonymous quote?', kind: 'radio', options: ['Yes', 'No'] },
  { n: 9, section: 'U2', sectionTitle: 'Background', prompt: 'District', kind: 'select', required: true, options: ['[District 1]', '[District 2]', '[District 3]', 'Other'] },
  { n: 10, section: 'U2', sectionTitle: 'Background', prompt: 'Sector', kind: 'text', required: true },
  { n: 11, section: 'U2', sectionTitle: 'Background', prompt: 'Area type', kind: 'radio', required: true, options: ['Rural', 'Semi-urban', 'Urban'] },
  { n: 12, section: 'U2', sectionTitle: 'Background', prompt: 'Age group', kind: 'radio', required: true, options: ['18-25', '26-40', '41-60', '60+'] },
  { n: 13, section: 'U2', sectionTitle: 'Background', prompt: 'Gender', kind: 'radio', required: true, options: ['Female', 'Male', 'Prefer not to say'] },
  { n: 14, section: 'U2', sectionTitle: 'Background', prompt: 'Number of people in the household', kind: 'number', required: true, min: 1, max: 30, help: 'Number only · between 1 and 30.' },
  { n: 15, section: 'U2', sectionTitle: 'Background', prompt: 'Main source of income', kind: 'radio', required: true, options: ['Farming', 'Casual work', 'Small business', 'Salaried work', 'No regular income', 'Other'] },
  { n: 16, section: 'U2', sectionTitle: 'Background', prompt: 'Time to walk to the nearest health center', kind: 'radio', required: true, options: ['Under 30 minutes', '30-60 minutes', '1-2 hours', 'Over 2 hours'] },
  { n: 17, section: 'U2', sectionTitle: 'Background', prompt: 'How long has the family been in Mutuelle?', kind: 'radio', required: true, options: ['Under 1 year', '1-3 years', 'Over 3 years', 'Not currently covered'] },
  { n: 18, section: 'U3', sectionTitle: 'Ubudehe classification', prompt: 'Which Ubudehe category is the family in?', kind: 'radio', required: true, options: ['Category 1', 'Category 2', 'Category 3', 'Category 4', "Doesn't know", 'Prefers not to say'] },
  { n: 19, section: 'U3', sectionTitle: 'Ubudehe classification', prompt: 'How was the family placed in this category? (Tell it as a story: who came, what they asked or looked at)', kind: 'textarea' },
  { n: 20, section: 'U3', sectionTitle: 'Ubudehe classification', prompt: 'Does the participant understand how the category was decided?', kind: 'rating', required: true, options: ['Not at all', 'Fully'] },
  { n: 21, section: 'U3', sectionTitle: 'Ubudehe classification', prompt: "Does the category match the family's real life?", kind: 'radio', required: true, options: ['Yes', 'Somewhat', 'No'] },
  { n: 22, section: 'U3', sectionTitle: 'Ubudehe classification', prompt: "Has the family's life changed in the last 3 years (new job, harvest, business, death)?", kind: 'radio', required: true, options: ['Yes', 'No'] },
  { n: 23, section: 'U3', sectionTitle: 'Ubudehe classification', prompt: 'In what way did life change?', kind: 'checkbox', options: ['Better income', 'Lower income', 'Job loss', 'Illness', 'Death in the family', 'New business', 'Other'], branches: [{ question: 22, equals: 'Yes' }] },
  { n: 24, section: 'U3', sectionTitle: 'Ubudehe classification', prompt: 'Did the category change after that?', kind: 'radio', required: true, options: ['Yes', 'No', 'Not applicable'], branches: [{ question: 22, equals: 'Yes' }] },
  { n: 25, section: 'U3', sectionTitle: 'Ubudehe classification', prompt: 'Did the family try to correct the category?', kind: 'radio', required: true, options: ['Yes', 'No', "Didn't know it was possible", 'Tried, but the system made it impossible'] },
  { n: 26, section: 'U3a', sectionTitle: 'Correction attempt · only if they tried', prompt: 'What happened when they tried to correct the category?', kind: 'textarea', required: true, branches: [{ question: 25, equals: ['Yes', 'Tried, but the system made it impossible'] }] },
  { n: 27, section: 'U4', sectionTitle: 'Using Mutuelle services', prompt: 'Tell about the last visit to the health center with the card. What was it like?', kind: 'textarea', required: true },
  { n: 28, section: 'U4', sectionTitle: 'Using Mutuelle services', prompt: 'Overall, how satisfied is the participant with the services?', kind: 'rating', required: true, options: ['Very unhappy', 'Very happy'] },
  { n: 29, section: 'U4', sectionTitle: 'Using Mutuelle services', prompt: 'Rate each part of the service (1 = very poor, 5 = very good)', kind: 'matrix', required: true, options: ['Waiting time', 'Medicine available', 'Respect from staff', 'Clear explanation of costs', 'Distance and transport'] },
  { n: 30, section: 'U4', sectionTitle: 'Using Mutuelle services', prompt: 'Did the participant pay anything extra at that visit?', kind: 'radio', required: true, options: ['Yes', 'No'] },
  { n: 31, section: 'U4a', sectionTitle: 'Extra costs · only if Yes', prompt: 'What kind of extra cost?', kind: 'checkbox', required: true, options: ['Medicine', 'Tests', 'Transport', 'Lost income from the day', 'Other'], branches: [{ question: 30, equals: 'Yes' }] },
  { n: 32, section: 'U4a', sectionTitle: 'Extra costs · only if Yes', prompt: 'About how much was paid extra (RWF)?', kind: 'number', required: true, min: 0, help: 'Number only · 0 or more.', branches: [{ question: 30, equals: 'Yes' }] },
  { n: 33, section: 'U4b', sectionTitle: 'Financial protection', prompt: 'How easy is the yearly contribution to pay?', kind: 'rating', required: true, options: ['Very hard', 'Very easy'] },
  { n: 34, section: 'U4b', sectionTitle: 'Financial protection', prompt: 'Has the family ever borrowed money or sold something to pay for health care?', kind: 'radio', required: true, options: ['Yes', 'No', 'Prefers not to say'] },
  { n: 35, section: 'U4b', sectionTitle: 'Financial protection', prompt: 'Has the family ever delayed or skipped care because of cost or distance?', kind: 'radio', required: true, options: ['Yes', 'No'] },
  { n: 36, section: 'U4c', sectionTitle: 'Delayed or skipped care · only if Yes', prompt: 'What was the main reason?', kind: 'checkbox', required: true, options: ['Cost of treatment', 'Transport cost', 'Distance', 'Medicine unavailable', 'Lost income', 'Other'], branches: [{ question: 35, equals: 'Yes' }] },
  { n: 37, section: 'U4c', sectionTitle: 'Delayed or skipped care · only if Yes', prompt: 'What did the family do instead?', kind: 'textarea', required: true, branches: [{ question: 35, equals: 'Yes' }] },
  { n: 38, section: 'U5', sectionTitle: 'Closing', prompt: 'What advice would the participant give to the people who run Mutuelle?', kind: 'textarea', required: true },
  { n: 39, section: 'U5', sectionTitle: 'Closing', prompt: 'Best quote (exact words, in Kinyarwanda and English)', kind: 'textarea', branches: [{ question: 8, equals: 'Yes' }] },
  { n: 40, section: 'U5', sectionTitle: 'Closing', prompt: "Interviewer's notes (setting, mood, anything unusual)", kind: 'textarea' },
  { n: 41, section: 'U5', sectionTitle: 'Closing', prompt: 'How comfortable did the participant seem during the interview?', kind: 'rating', required: true, options: ['Uncomfortable', 'Very comfortable'] },
];
const m: Question[] = [
  { n: 42, section: 'M1', sectionTitle: 'Consent · MINALOC', prompt: 'Interview mode', kind: 'radio', required: true, options: ['In person', 'Phone', 'Online'] },
  { n: 43, section: 'M1', sectionTitle: 'Consent · MINALOC', prompt: "Officer's role or department (name optional)", kind: 'text', required: true },
  { n: 44, section: 'M1', sectionTitle: 'Consent · MINALOC', prompt: 'Position level', kind: 'radio', required: true, options: ['Policy / leadership', 'Technical / expert', 'Local / field'] },
  { n: 45, section: 'M1', sectionTitle: 'Consent · MINALOC', prompt: 'Permission to record?', kind: 'radio', required: true, options: ['Yes', 'No, notes only'] },
  { n: 46, section: 'M1', sectionTitle: 'Consent · MINALOC', prompt: 'Consent given to take part?', kind: 'radio', required: true, options: ['Yes', 'No'] },
  { n: 47, section: 'M1', sectionTitle: 'Consent · MINALOC', prompt: 'How may we cite this interview?', kind: 'radio', required: true, options: ['By title and institution', 'Anonymously', 'Not for quotation'] },
  { n: 48, section: 'M2', sectionTitle: 'Criteria and process', prompt: 'What criteria and indicators are used to place a household in an Ubudehe category?', kind: 'textarea', required: true },
  { n: 49, section: 'M2', sectionTitle: 'Criteria and process', prompt: 'Who collects the information, and how is it verified at community level?', kind: 'textarea', required: true },
  { n: 50, section: 'M2', sectionTitle: 'Criteria and process', prompt: 'How often is the classification updated?', kind: 'textarea', required: true },
  { n: 51, section: 'M3', sectionTitle: 'Transitions between economic levels · key section', prompt: 'What does MINALOC do when households move from one economic level to another, whether improving or declining?', kind: 'textarea', required: true, help: 'Key question · required.' },
  { n: 52, section: 'M3', sectionTitle: 'Transitions between economic levels · key section', prompt: "How does the system learn that a household's situation has changed?", kind: 'textarea', required: true },
  { n: 53, section: 'M3', sectionTitle: 'Transitions between economic levels · key section', prompt: 'When a household moves to a higher category, what happens to its support? Is there gradual support so families do not fall back into poverty?', kind: 'textarea', required: true },
  { n: 54, section: 'M3', sectionTitle: 'Transitions between economic levels · key section', prompt: 'How are households with unstable income handled (seasonal farmers, casual workers)?', kind: 'textarea', required: true },
  { n: 55, section: 'M3', sectionTitle: 'Transitions between economic levels · key section', prompt: "What happens to a household's health insurance support if its category changes in the middle of the year?", kind: 'textarea', required: true },
  { n: 56, section: 'M3', sectionTitle: 'Transitions between economic levels · key section', prompt: 'Does a mechanism for handling transitions exist? (interviewer’s judgment)', kind: 'radio', required: true, options: ['Yes', 'Partly', 'No'] },
  { n: 57, section: 'M4', sectionTitle: 'Appeals, reforms and links', prompt: 'How can a household appeal a category, and how long does it usually take?', kind: 'textarea', required: true },
  { n: 58, section: 'M4', sectionTitle: 'Appeals, reforms and links', prompt: 'What are the most common errors or challenges in classification?', kind: 'textarea', required: true },
  { n: 59, section: 'M4', sectionTitle: 'Appeals, reforms and links', prompt: 'How do the recent reforms change how households are classified?', kind: 'textarea', required: true },
  { n: 60, section: 'M4', sectionTitle: 'Appeals, reforms and links', prompt: 'How does MINALOC work with RSSB so classification matches premiums and subsidies?', kind: 'textarea', required: true },
  { n: 61, section: 'M4', sectionTitle: 'Appeals, reforms and links', prompt: 'What would make classification fairer and more accurate?', kind: 'textarea', required: true },
  { n: 62, section: 'M5', sectionTitle: 'Data, documents and follow-up · MINALOC', prompt: 'Key figures mentioned (numbers, percentages, RWF amounts, dates)', kind: 'textarea' },
  { n: 63, section: 'M5', sectionTitle: 'Data, documents and follow-up · MINALOC', prompt: 'Evidence strength of those figures', kind: 'radio', required: true, options: ['Document provided', 'Verbal only', 'Estimate'] },
  { n: 64, section: 'M5', sectionTitle: 'Data, documents and follow-up · MINALOC', prompt: 'Source type for the numbers', kind: 'radio', required: true, options: ['Annual report', 'Internal data', 'Estimate', 'Not stated'] },
  { n: 65, section: 'M5', sectionTitle: 'Data, documents and follow-up · MINALOC', prompt: 'Did anything the official said contradict what community members told us?', kind: 'textarea' },
  { n: 66, section: 'M5', sectionTitle: 'Data, documents and follow-up · MINALOC', prompt: 'Documents requested', kind: 'checkbox', options: ['Classification guidelines', 'Reform document', 'Statistics on category changes', 'Other'] },
  { n: 67, section: 'M5', sectionTitle: 'Data, documents and follow-up · MINALOC', prompt: 'Received?', kind: 'radio', required: true, options: ['Yes', 'No', 'Pending'] },
  { n: 68, section: 'M5', sectionTitle: 'Data, documents and follow-up · MINALOC', prompt: 'Link to the document (Drive link)', kind: 'url' },
  { n: 69, section: 'M5', sectionTitle: 'Data, documents and follow-up · MINALOC', prompt: 'Follow-up needed?', kind: 'radio', required: true, options: ['Yes', 'No'] },
  { n: 70, section: 'M5', sectionTitle: 'Data, documents and follow-up · MINALOC', prompt: 'Follow-up date', kind: 'date', help: 'Example: January 7, 2026' },
  { n: 71, section: 'M5', sectionTitle: 'Data, documents and follow-up · MINALOC', prompt: 'Best quote', kind: 'textarea' },
];
const r: Question[] = [
  { n: 72, section: 'R1', sectionTitle: 'Consent · RSSB', prompt: 'Interview mode', kind: 'radio', required: true, options: ['In person', 'Phone', 'Online'] },
  { n: 73, section: 'R1', sectionTitle: 'Consent · RSSB', prompt: "Officer's role or department (name optional)", kind: 'text', required: true },
  { n: 74, section: 'R1', sectionTitle: 'Consent · RSSB', prompt: 'Position level', kind: 'radio', required: true, options: ['Policy / leadership', 'Technical / expert', 'Local / field'] },
  { n: 75, section: 'R1', sectionTitle: 'Consent · RSSB', prompt: 'Permission to record?', kind: 'radio', required: true, options: ['Yes', 'No, notes only'] },
  { n: 76, section: 'R1', sectionTitle: 'Consent · RSSB', prompt: 'Consent given to take part?', kind: 'radio', required: true, options: ['Yes', 'No'] },
  { n: 77, section: 'R1', sectionTitle: 'Consent · RSSB', prompt: 'How may we cite this interview?', kind: 'radio', required: true, options: ['By title and institution', 'Anonymously', 'Not for quotation'] },
  { n: 78, section: 'R2', sectionTitle: 'Money and allocation', prompt: 'How is the CBHI budget made up? What share comes from premiums, government, and partners?', kind: 'textarea', required: true },
  { n: 79, section: 'R2', sectionTitle: 'Money and allocation', prompt: 'How is the money divided between paying health facilities, administration, and other needs?', kind: 'textarea', required: true },
  { n: 80, section: 'R2', sectionTitle: 'Money and allocation', prompt: 'How are premiums and subsidies linked to each Ubudehe category?', kind: 'textarea', required: true },
  { n: 81, section: 'R2', sectionTitle: 'Money and allocation', prompt: 'When funds run short, how does RSSB respond?', kind: 'textarea', required: true },
  { n: 82, section: 'R3', sectionTitle: 'Services and payments', prompt: 'How long does it usually take to pay health facility claims?', kind: 'radio', required: true, options: ['Under 30 days', '30-60 days', '60-90 days', 'Over 90 days', 'Not stated'] },
  { n: 83, section: 'R3', sectionTitle: 'Services and payments', prompt: 'What delays happen, and why?', kind: 'textarea', required: true },
  { n: 84, section: 'R3', sectionTitle: 'Services and payments', prompt: 'How does the money allocated to CBHI affect the services members receive (medicine, tests, referrals)?', kind: 'textarea', required: true },
  { n: 85, section: 'R4', sectionTitle: 'Complaints · key section', prompt: 'What is the most common problem in the complaints RSSB receives from CBHI members?', kind: 'textarea', required: true, help: 'Key question · required.' },
  { n: 86, section: 'R4', sectionTitle: 'Complaints · key section', prompt: "Top complaint type (interviewer's choice)", kind: 'radio', required: true, options: ['Co-payments', 'Medicine shortage', 'Category error', 'Claims', 'Staff treatment', 'Other'] },
  { n: 87, section: 'R4', sectionTitle: 'Complaints · key section', prompt: 'Numbers on complaints received (per year, by type)', kind: 'textarea' },
  { n: 88, section: 'R4', sectionTitle: 'Complaints · key section', prompt: 'What percentage of complaints are resolved, and in how long?', kind: 'textarea', required: true },
  { n: 89, section: 'R4', sectionTitle: 'Complaints · key section', prompt: 'How are complaints received, handled and resolved? What has changed because of them?', kind: 'textarea', required: true },
  { n: 90, section: 'R5', sectionTitle: 'Transitions and sustainability', prompt: "What happens in the insurance system when a member's Ubudehe category changes during the year?", kind: 'textarea', required: true },
  { n: 91, section: 'R5', sectionTitle: 'Transitions and sustainability', prompt: 'What are the biggest financial pressures on CBHI over the next five years?', kind: 'textarea', required: true },
  { n: 92, section: 'R5', sectionTitle: 'Transitions and sustainability', prompt: 'What one change would most improve financial protection for members?', kind: 'textarea', required: true },
  { n: 93, section: 'R6', sectionTitle: 'Data, documents and follow-up · RSSB', prompt: 'Key figures mentioned (numbers, percentages, RWF amounts, dates)', kind: 'textarea' },
  { n: 94, section: 'R6', sectionTitle: 'Data, documents and follow-up · RSSB', prompt: 'Evidence strength of those figures', kind: 'radio', required: true, options: ['Document provided', 'Verbal only', 'Estimate'] },
  { n: 95, section: 'R6', sectionTitle: 'Data, documents and follow-up · RSSB', prompt: 'Source type for the numbers', kind: 'radio', required: true, options: ['Annual report', 'Internal data', 'Estimate', 'Not stated'] },
  { n: 96, section: 'R6', sectionTitle: 'Data, documents and follow-up · RSSB', prompt: 'Did anything the official said contradict what community members told us?', kind: 'textarea' },
  { n: 97, section: 'R6', sectionTitle: 'Data, documents and follow-up · RSSB', prompt: 'Data requested', kind: 'checkbox', options: ['Revenue and expenditure', 'Enrolment by category', 'Complaints data', 'Claims paid vs submitted', 'Other'] },
  { n: 98, section: 'R6', sectionTitle: 'Data, documents and follow-up · RSSB', prompt: 'Received?', kind: 'radio', required: true, options: ['Yes', 'No', 'Pending'] },
  { n: 99, section: 'R6', sectionTitle: 'Data, documents and follow-up · RSSB', prompt: 'Link to the document (Drive link)', kind: 'url' },
  { n: 100, section: 'R6', sectionTitle: 'Data, documents and follow-up · RSSB', prompt: 'Follow-up needed?', kind: 'radio', required: true, options: ['Yes', 'No'] },
  { n: 101, section: 'R6', sectionTitle: 'Data, documents and follow-up · RSSB', prompt: 'Follow-up date', kind: 'date', help: 'Example: January 7, 2026' },
  { n: 102, section: 'R6', sectionTitle: 'Data, documents and follow-up · RSSB', prompt: 'Best quote', kind: 'textarea' },
];

export const questionnaire: Question[] = [...start, ...u, ...m, ...r];
export const respondentPaths: Record<string, number[]> = {
  'CBHI member (community)': [...start.map(q => q.n), ...u.map(q => q.n)],
  MINALOC: [...start.map(q => q.n), ...m.map(q => q.n)],
  RSSB: [...start.map(q => q.n), ...r.map(q => q.n)],
};
export function isVisible(question: Question, answers: Record<number, unknown>) {
  return !question.branches || question.branches.every(({ question: n, equals }) => {
    const actual = answers[n];
    return Array.isArray(equals) ? equals.includes(String(actual)) : actual === equals;
  });
}
