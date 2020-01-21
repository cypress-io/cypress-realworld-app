///<reference path="types.ts" />

import express from "express";
import {
  getNotificationsByUserId,
  createNotifications,
  updateNotificationById
} from "./database";
import { ensureAuthenticated, validateMiddleware } from "./helpers";
import {
  isNotificationsBodyValidator,
  shortIdValidation,
  isNotificationPatchValidator
} from "./validators";
const router = express.Router();

// Routes

//GET /notifications/
router.get("/", ensureAuthenticated, (req, res) => {
  const notifications = getNotificationsByUserId(req.user?.id!);

  res.status(200);
  res.json({ notifications });
});

//POST /notifications/bulk
router.post(
  "/bulk",
  ensureAuthenticated,
  validateMiddleware([...isNotificationsBodyValidator]),
  (req, res) => {
    const { items } = req.body;

    const notifications = createNotifications(req.user?.id!, items);

    res.status(200);
    // @ts-ignore
    res.json({ notifications });
  }
);

//PATCH /notifications/:notification_id - scoped-user
router.patch(
  "/:notification_id",
  ensureAuthenticated,
  validateMiddleware([
    shortIdValidation("notification_id"),
    ...isNotificationPatchValidator
  ]),
  (req, res) => {
    const { notification_id } = req.params;

    updateNotificationById(req.user?.id!, notification_id, req.body);

    res.sendStatus(204);
  }
);

export default router;
