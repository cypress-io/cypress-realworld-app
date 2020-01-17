///<reference path="types.ts" />

import express from "express";
import {
  getNotificationsByUserId,
  createPaymentNotification,
  createLikeNotification,
  createCommentNotification
} from "./database";
import { ensureAuthenticated, validateMiddleware } from "./helpers";
import { isNotificationsBodyValidator } from "./validators";
import { NotificationsType, NotificationPayloadType } from "../models";
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

    const notifications = items.flatMap((item: NotificationPayloadType) => {
      if (item.type === NotificationsType.payment) {
        return createPaymentNotification(
          req.user?.id!,
          item.transaction_id,
          item.status
        );
      } else if (item.type === NotificationsType.like) {
        return createLikeNotification(
          req.user?.id!,
          item.transaction_id,
          item.like_id
        );
      } else {
        return createCommentNotification(
          req.user?.id!,
          item.transaction_id,
          item.comment_id
        );
      }
    });

    res.status(200);
    // @ts-ignore
    res.json({ notifications });
  }
);

export default router;
