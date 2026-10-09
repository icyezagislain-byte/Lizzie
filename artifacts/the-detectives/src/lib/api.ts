import {
  createInterviewDraft,
  deleteInterviewDraft,
  getCurrentSession,
  getInterview,
  listInterviews,
  submitInterview,
  updateInterviewDraft,
  type InterviewRecord,
  type RespondentType,
} from "@workspace/api-client-react";

export type { InterviewRecord, RespondentType };

export const interviewApi = {
  getSession: getCurrentSession,
  list: listInterviews,
  get: getInterview,
  create: createInterviewDraft,
  update: updateInterviewDraft,
  submit: submitInterview,
  delete: deleteInterviewDraft,
};

export type InterviewAnswers = Record<string, unknown>;

export function recordToAnswers(answers: InterviewAnswers): Record<number, unknown> {
  return Object.fromEntries(
    Object.entries(answers).map(([number, value]) => [Number(number), value]),
  );
}

export function answersToRecord(
  answers: Record<number, unknown>,
): InterviewAnswers {
  return Object.fromEntries(
    Object.entries(answers).map(([number, value]) => [String(number), value]),
  );
}

export function friendlyError(error: unknown): string {
  if (error instanceof Error) {
    const body = "data" in error ? (error as { data?: unknown }).data : undefined;
    if (
      body &&
      typeof body === "object" &&
      "error" in body &&
      typeof body.error === "string"
    ) {
      return body.error;
    }
    if (error.message) return error.message;
  }
  return "The request could not be completed. Please try again.";
}

