import {
  CreateInterviewDraftBody,
  CreateInterviewDraftResponse,
  DeleteInterviewDraftParams,
  GetInterviewParams,
  GetInterviewResponse,
  InterviewListResponse,
  ListInterviewsResponse,
  SubmitInterviewParams,
  SubmitInterviewResponse,
  UpdateInterviewDraftBody,
  UpdateInterviewDraftParams,
  UpdateInterviewDraftResponse,
} from "@workspace/api-zod";
import { Router, type IRouter, type Request, type Response } from "express";
import {
  deleteInterviewRow,
  findInterviewRow,
  insertInterviewRow,
  listInterviewRows,
  SupabaseRequestError,
  toInterviewRecord,
  updateInterviewRow,
  type InterviewRow,
  type RespondentType,
} from "../lib/supabase";
import { requireAdminWord, requireSameOriginWrite } from "../middlewares/auth";

const router: IRouter = Router();
const PUBLIC_OWNER_ID = "public-fieldwork";
const respondentTypeFromAnswer: Record<string, RespondentType> = {
  "CBHI member (community)": "cbhi",
  MINALOC: "minaloc",
  RSSB: "rssb",
};
const requiredQuestions: Record<RespondentType, number[]> = {
  cbhi: [
    1, 2, 3, 4, 5, 6, 7, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 20, 21, 22,
    25, 27, 28, 29, 30, 33, 34, 35, 38, 41,
  ],
  minaloc: [
    1, 2, 3, 4, 5, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56,
    57, 58, 59, 60, 61, 63, 64, 67, 69,
  ],
  rssb: [
    1, 2, 3, 4, 5, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86,
    88, 89, 90, 91, 92, 94, 95, 98, 100,
  ],
};


function isNonemptyAnswer(value: unknown): boolean {
  if (value === undefined || value === null || value === "") return false;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") return Object.keys(value).length > 0;
  return true;
}

function conditionalRequiredQuestions(
  type: RespondentType,
  answers: Record<string, unknown>,
): number[] {
  const extra: number[] = [];
  if (type === "cbhi") {
    if (answers["22"] === "Yes") extra.push(24);
    if (
      answers["25"] === "Yes" ||
      answers["25"] === "Tried, but the system made it impossible"
    ) {
      extra.push(26);
    }
    if (answers["30"] === "Yes") extra.push(31, 32);
    if (answers["35"] === "Yes") extra.push(36, 37);
  }
  return extra;
}

function conditionalQuestionIsVisible(
  type: RespondentType,
  number: number,
  answers: Record<string, unknown>,
): boolean {
  if (type !== "cbhi") return true;
  if ([23, 24].includes(number)) return answers["22"] === "Yes";
  if (number === 26) {
    return (
      answers["25"] === "Yes" ||
      answers["25"] === "Tried, but the system made it impossible"
    );
  }
  if ([31, 32].includes(number)) return answers["30"] === "Yes";
  if ([36, 37].includes(number)) return answers["35"] === "Yes";
  if (number === 39) return answers["8"] === "Yes";
  return true;
}

function validateSubmission(row: InterviewRow, type: RespondentType): string | null {
  const answers = row.answers ?? {};
  const skipped = new Set(row.skipped_questions ?? []);
  const answerType = respondentTypeFromAnswer[String(answers["5"] ?? "")];
  if (answerType !== type) return "The respondent type does not match this record.";

  const required = [
    ...requiredQuestions[type],
    ...conditionalRequiredQuestions(type, answers),
  ];
  for (const number of required) {
    if (!conditionalQuestionIsVisible(type, number, answers)) continue;
    if (!isNonemptyAnswer(answers[String(number)]) && !skipped.has(number)) {
      return `Question ${number} is unanswered.`;
    }
  }

  const code = String(answers["1"] ?? "");
  const expectedPrefix = type === "cbhi" ? "U" : type === "minaloc" ? "M" : "R";
  if (!new RegExp(`^${expectedPrefix}-\\d{3}$`).test(code)) {
    return "The interview ID does not match the respondent type.";
  }

  if (type === "cbhi") {
    if (answers["6"] !== "Yes" || answers["7"] !== "Yes") {
      return "Age eligibility and participation consent are required.";
    }
  } else if (answers[type === "minaloc" ? "46" : "76"] !== "Yes") {
    return "Participation consent is required.";
  }

  return null;
}

function parseAnswers(body: Record<string, unknown>): Record<string, unknown> {
  return body.answers as Record<string, unknown>;
}

function toResponseRecord(type: RespondentType, row: InterviewRow) {
  return {
    ...toInterviewRecord(type, row),
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    submittedAt: row.submitted_at ? new Date(row.submitted_at) : null,
  };
}

function sendStorageError(
  req: Request,
  res: Response,
  error: unknown,
): void {
  const status =
    error instanceof SupabaseRequestError ? error.status ?? 503 : undefined;
  req.log?.error(
    { status, errorKind: error instanceof Error ? error.name : "unknown" },
    "Interview storage request failed",
  );
  res.status(503).json({
    error:
      "Secure interview storage is unavailable. Check the Supabase configuration and migration.",
  });
}

router.get("/interviews", requireAdminWord, async (req, res): Promise<void> => {
  try {
    const types: RespondentType[] = ["cbhi", "minaloc", "rssb"];
    const groups = await Promise.all(
      types.map(async (type) => ({
        type,
        rows: await listInterviewRows(type),
      })),
    );
    const records = groups
      .flatMap(({ type, rows }) =>
        rows.map((row) => toResponseRecord(type, row)),
      )
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    res.json(ListInterviewsResponse.parse({ records }));
  } catch (error) {
    sendStorageError(req, res, error);
  }
});

router.post(
  "/interviews",
  requireSameOriginWrite,
  async (req, res): Promise<void> => {
    const parsed = CreateInterviewDraftBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid interview draft." });
      return;
    }

    const { respondentType, answers, skippedQuestions, activeQuestion } =
      parsed.data;
    const typeFromAnswer = respondentTypeFromAnswer[String(answers["5"] ?? "")];
    const expectedPrefix =
      respondentType === "cbhi"
        ? "U"
        : respondentType === "minaloc"
          ? "M"
          : "R";
    if (
      typeFromAnswer !== respondentType ||
      !new RegExp(`^${expectedPrefix}-\\d{3}$`).test(String(answers["1"] ?? ""))
    ) {
      res.status(400).json({ error: "Interview type or ID is invalid." });
      return;
    }

    try {
      const row = await insertInterviewRow(respondentType, {
        owner_user_id: PUBLIC_OWNER_ID,
        interview_code: String(answers["1"]),
        answers: parseAnswers(parsed.data),
        skipped_questions: skippedQuestions,
        active_question: activeQuestion,
      });
      res
        .status(201)
        .json(
          CreateInterviewDraftResponse.parse(
            toResponseRecord(respondentType, row),
          ),
        );
    } catch (error) {
      sendStorageError(req, res, error);
    }
  },
);

router.get(
  "/interviews/:respondentType/:id",
  async (req, res): Promise<void> => {
    const parsed = GetInterviewParams.safeParse(req.params);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid interview reference." });
      return;
    }
    const { respondentType, id } = parsed.data;
    try {
      const row = await findInterviewRow(respondentType, id);
      if (!row) {
        res.status(404).json({ error: "Interview not found." });
        return;
      }
      res.json(
        GetInterviewResponse.parse(toResponseRecord(respondentType, row)),
      );
    } catch (error) {
      sendStorageError(req, res, error);
    }
  },
);

router.patch(
  "/interviews/:respondentType/:id",
  requireSameOriginWrite,
  async (req, res): Promise<void> => {
    const params = UpdateInterviewDraftParams.safeParse(req.params);
    const body = UpdateInterviewDraftBody.safeParse(req.body);
    if (!params.success || !body.success) {
      res.status(400).json({ error: "Invalid interview update." });
      return;
    }
    const { respondentType, id } = params.data;
    const { answers, skippedQuestions, activeQuestion } = body.data;
    const typeFromAnswer =
      respondentTypeFromAnswer[String(answers["5"] ?? "")];
    if (typeFromAnswer !== respondentType) {
      res.status(400).json({ error: "Respondent type cannot be changed." });
      return;
    }

    try {
      const existing = await findInterviewRow(respondentType, id);
      if (!existing) {
        res.status(404).json({ error: "Interview draft not found." });
        return;
      }
      if (existing.status !== "draft") {
        res.status(409).json({ error: "Submitted interviews are read-only." });
        return;
      }
      const updated = await updateInterviewRow(
        respondentType,
        id,
        existing.owner_user_id,
        {
          answers: parseAnswers(body.data),
          skipped_questions: skippedQuestions,
          active_question: activeQuestion,
        },
      );
      if (!updated) {
        res.status(409).json({ error: "Interview draft can no longer change." });
        return;
      }
      res.json(
        UpdateInterviewDraftResponse.parse(
          toResponseRecord(respondentType, updated),
        ),
      );
    } catch (error) {
      sendStorageError(req, res, error);
    }
  },
);

router.delete(
  "/interviews/:respondentType/:id",
  requireSameOriginWrite,
  async (req, res): Promise<void> => {
    const params = DeleteInterviewDraftParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: "Invalid interview reference." });
      return;
    }
    const { respondentType, id } = params.data;
    try {
      const existing = await findInterviewRow(respondentType, id);
      if (!existing) {
        res.status(404).json({ error: "Interview draft not found." });
        return;
      }
      if (existing.status !== "draft") {
        res.status(409).json({ error: "Submitted interviews cannot be deleted." });
        return;
      }
      await deleteInterviewRow(respondentType, id, existing.owner_user_id);
      res.sendStatus(204);
    } catch (error) {
      sendStorageError(req, res, error);
    }
  },
);

router.post(
  "/interviews/:respondentType/:id/submit",
  requireSameOriginWrite,
  async (req, res): Promise<void> => {
    const params = SubmitInterviewParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: "Invalid interview reference." });
      return;
    }
    const { respondentType, id } = params.data;
    try {
      const existing = await findInterviewRow(respondentType, id);
      if (!existing) {
        res.status(404).json({ error: "Interview draft not found." });
        return;
      }
      if (existing.status !== "draft") {
        res.status(409).json({ error: "Interview has already been submitted." });
        return;
      }
      const validationError = validateSubmission(existing, respondentType);
      if (validationError) {
        res.status(400).json({ error: validationError });
        return;
      }
      const updated = await updateInterviewRow(
        respondentType,
        id,
        existing.owner_user_id,
        { status: "submitted", submitted_at: new Date().toISOString() },
      );
      if (!updated) {
        res.status(409).json({ error: "Interview draft can no longer change." });
        return;
      }
      res.json(
        SubmitInterviewResponse.parse(
          toResponseRecord(respondentType, updated),
        ),
      );
    } catch (error) {
      sendStorageError(req, res, error);
    }
  },
);

export default router;
