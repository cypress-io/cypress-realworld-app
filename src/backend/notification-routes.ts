///<reference path="types.ts" />

import express from "express";
import {
  getNotificationsByUserId,
  createPaymentNotification,
  createLikeNotification,
  createCommentNotification,
  createNotifications
} from "./database";
import { ensureAuthenticated, validateMiddleware } from "./helpers";
import { isNotificationsBodyValidator } from "./validators";
import {
  NotificationsType,
  NotificationPayloadType,
  PaymentNotificationPayload,
  LikeNotificationPayload,
  CommentNotificationPayload
} from "../models";
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

export default router;
