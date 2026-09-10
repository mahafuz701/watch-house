import express, { Express } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import { join } from "path";
import { env, isProd } from "./config/env";
import { apiLimiter } from "./middleware/rateLimit";
import { csrfProtect, csrfInject } from "./middleware/csrf";
import { errorHandler, notFoundHandler } from "./middleware/error";
import { apiRouter } from "./modules/routes";

export function createApp(): Express {
  const app = express();
  app.disable("x-powered-by");
  app.set("trust proxy", 1);

  // ── security headers (HSTS in prod, CSP, frameguard, nosniff, referrer) ──
  app.use(
    helmet({
      contentSecurityPolicy: isProd
        ? {
            directives: {
              "default-src": ["'self'"],
              "img-src": ["'self'", "data:", "https:"],
              "style-src": ["'self'", "'unsafe-inline'"],
              "font-src": ["'self'", "data:"],
              "script-src": ["'self'"],
            },
          }
        : false,
      crossOriginEmbedderPolicy: false,
    })
  );

  app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true, limit: "1mb" }));
  app.use(cookieParser());

  // CSRF (skip auth + webhook + health endpoints)
  app.use(csrfInject);
  app.use(csrfProtect);

  // Static uploads (public product images)
  app.use("/uploads", express.static(join(env.UPLOAD_PATH, "..")));

  // API with rate limiting
  app.use("/api", apiLimiter, apiRouter);

  // health check
  app.get("/api/health", (_req, res) => res.json({ success: true, status: "ok", time: new Date().toISOString() }));

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}