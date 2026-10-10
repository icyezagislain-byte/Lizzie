import type { RequestHandler } from "express";

export const requireSameOriginWrite: RequestHandler = (req, res, next) => {
  if (req.get("sec-fetch-site") === "cross-site") {
    res.status(403).json({ error: "Cross-site requests are not allowed." });
    return;
  }

  const origin = req.get("origin");
  const forwardedHost = req.get("x-forwarded-host");
  const expectedHost = (forwardedHost || req.get("host") || "")
    .split(",")[0]
    .trim()
    .toLowerCase();
  if (origin) {
    try {
      if (new URL(origin).host.toLowerCase() !== expectedHost) {
        res.status(403).json({ error: "Cross-site requests are not allowed." });
        return;
      }
    } catch {
      res.status(403).json({ error: "Invalid request origin." });
      return;
    }
  }

  next();
};

const ADMIN_WORDS = ["gislain", "lizzie"];

export const requireAdminWord: RequestHandler = (req, res, next) => {
  const header = req.get("authorization") ?? "";
  const word = header.replace(/^Bearer\s+/i, "").trim().toLowerCase();
  if (word && ADMIN_WORDS.includes(word)) {
    next();
    return;
  }
  res.status(403).json({
    error: "Not allowed. Please go back and enter the correct secret word.",
  });
};