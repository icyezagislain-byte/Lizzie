import type { InterviewRecord } from "@workspace/api-zod";

export type RespondentType = "cbhi" | "minaloc" | "rssb";
export type InterviewStatus = "draft" | "submitted";

export interface InterviewRow {
  id: string;
  owner_user_id: string;
  interview_code: string | null;
  status: InterviewStatus;
  answers: Record<string, unknown>;
  skipped_questions: number[];
  active_question: number | null;
  created_at: string;
  updated_at: string;
  submitted_at: string | null;
}

export class SupabaseRequestError extends Error {
  constructor(readonly status?: number) {
    super("Supabase request failed");
    this.name = "SupabaseRequestError";
  }
}

const tableForType: Record<RespondentType, string> = {
  cbhi: "cbhi_interviews",
  minaloc: "minaloc_interviews",
  rssb: "rssb_interviews",
};

function tableName(type: RespondentType): string {
  return tableForType[type];
}

function getSupabaseConfig(): { baseUrl: string; serviceKey: string } {
  const rawUrl = process.env.SUPABASE_URL?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!rawUrl || !serviceKey) {
    throw new SupabaseRequestError(503);
  }
  const baseUrl = rawUrl.replace(/\/+$/, "").replace(/\/rest\/v1$/i, "");
  return { baseUrl, serviceKey };
}

async function restRequest<T>(
  type: RespondentType,
  search: URLSearchParams,
  method: "GET" | "POST" | "PATCH" | "DELETE",
  body?: Record<string, unknown>,
  prefer?: string,
): Promise<T> {
  const { baseUrl, serviceKey } = getSupabaseConfig();
  const url = `${baseUrl}/rest/v1/${tableName(type)}?${search.toString()}`;
  const response = await fetch(url, {
    method,
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      Accept: "application/json",
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(prefer ? { Prefer: prefer } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  if (!response.ok) throw new SupabaseRequestError(response.status);
  if (response.status === 204 || method === "DELETE") return undefined as T;
  const contentLength = response.headers.get("content-length");
  if (contentLength === "0") return undefined as T;
  return (await response.json()) as T;
}

export function toInterviewRecord(
  type: RespondentType,
  row: InterviewRow,
): InterviewRecord {
  return {
    id: row.id,
    respondentType: type,
    answers: row.answers ?? {},
    skippedQuestions: row.skipped_questions ?? [],
    activeQuestion: row.active_question,
    status: row.status,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    submittedAt: row.submitted_at ? new Date(row.submitted_at) : null,
  };
}

export async function listInterviewRows(
  type: RespondentType,
  ownerUserId?: string,
): Promise<InterviewRow[]> {
  const search = new URLSearchParams({ select: "*" });
  if (ownerUserId) search.set("owner_user_id", `eq.${ownerUserId}`);
  search.set("order", "updated_at.desc");
  search.set("limit", "1000");
  return restRequest<InterviewRow[]>(type, search, "GET");
}

export async function findInterviewRow(
  type: RespondentType,
  id: string,
): Promise<InterviewRow | null> {
  const search = new URLSearchParams({ select: "*", id: `eq.${id}`, limit: "1" });
  const rows = await restRequest<InterviewRow[]>(type, search, "GET");
  return rows[0] ?? null;
}

export async function insertInterviewRow(
  type: RespondentType,
  values: Pick<
    InterviewRow,
    | "owner_user_id"
    | "interview_code"
    | "answers"
    | "skipped_questions"
    | "active_question"
  >,
): Promise<InterviewRow> {
  const search = new URLSearchParams({ select: "*" });
  const rows = await restRequest<InterviewRow[]>(
    type,
    search,
    "POST",
    { ...values, status: "draft" },
    "return=representation",
  );
  if (!rows[0]) throw new SupabaseRequestError(502);
  return rows[0];
}

export async function updateInterviewRow(
  type: RespondentType,
  id: string,
  ownerUserId: string,
  values: Partial<
    Pick<
      InterviewRow,
      "answers" | "skipped_questions" | "active_question" | "status" | "submitted_at"
    >
  >,
): Promise<InterviewRow | null> {
  const search = new URLSearchParams({
    select: "*",
    id: `eq.${id}`,
    owner_user_id: `eq.${ownerUserId}`,
    status: "eq.draft",
  });
  const rows = await restRequest<InterviewRow[]>(
    type,
    search,
    "PATCH",
    { ...values, updated_at: new Date().toISOString() },
    "return=representation",
  );
  return rows[0] ?? null;
}

export async function deleteInterviewRow(
  type: RespondentType,
  id: string,
  ownerUserId: string,
): Promise<void> {
  const search = new URLSearchParams({
    id: `eq.${id}`,
    owner_user_id: `eq.${ownerUserId}`,
    status: "eq.draft",
  });
  await restRequest<void>(type, search, "DELETE");
}
