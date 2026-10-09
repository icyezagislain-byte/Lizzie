import { getAuth } from "@clerk/express";
import type { RequestHandler } from "express";

export const requireSignedIn: RequestHandler = (req, res, next) => {
  const { userId } = getAuth(req);
  if (!userId) {
    res.status(401).json({ error: "Sign in to access interview records." });
    return;
  }

  res.locals.userId = userId;
  next();
};

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
