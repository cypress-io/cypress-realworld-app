import { mount } from "@cypress/react";
import NotificationListItem from "./NotificationListItem";
import { PaymentNotificationStatus } from "../../src/models";

describe("Notification List Item", () => {
  it("displays the correct username and message when a payment is received.", () => {
    const notification = {
      userFullName: "Kaylin Homenick",
      id: "95qRwfJnSORQ",
      uuid: "0b5a0f25-c56b-4434-ba4d-21f133d8964f",
      userId: "t45AiwidW",
      transactionId: "xAsSYDsiEGSj",
      status: PaymentNotificationStatus.received,
      isRead: false,
      createdAt: new Date(),
      modifiedAt: new Date(),
    };

    const updateNotification = cy.spy().as("updateNotificationSpy");

    mount(
      <NotificationListItem notification={notification} updateNotification={updateNotification} />
    );

    cy.contains(`${notification.userFullName} received payment.`);
  });

  it("displays the correct username and message when a user likes a transaction.", () => {
    const notification = {
      userFullName: "Ibrahim Dickens",
      id: "9m-W-uI5fQUF",
      uuid: "f4a10fbf-d12e-4a6d-b888-d86989b66687",
      userId: "t45AiwidW",
      likeId: "heOJ8kL74llw",
      transactionId: "PPrW38YZtQD",
      isRead: false,
      createdAt: new Date(),
      modifiedAt: new Date(),
    };

    const updateNotification = cy.spy();

    mount(
      <NotificationListItem notification={notification} updateNotification={updateNotification} />
    );

    cy.contains(`${notification.userFullName} liked a transaction.`);
  });

  it("displays the correct username and message when a user requests a payment", () => {
    const notification = {
      userFullName: "Kaylin Homenick",
      id: "95qRwfJnSORQ",
      uuid: "0b5a0f25-c56b-4434-ba4d-21f133d8964f",
      userId: "t45AiwidW",
      transactionId: "xAsSYDsiEGSj",
      status: PaymentNotificationStatus.requested,
      isRead: false,
      createdAt: new Date(),
      modifiedAt: new Date(),
    };

    const updateNotification = cy.spy();

    mount(
      <NotificationListItem notification={notification} updateNotification={updateNotification} />
    );

    cy.contains(`${notification.userFullName} requested payment.`);
  });

  it("displays the correct username and message when a user requests a payment", () => {
    const notification = {
      userFullName: "Edgar Johns",
      id: "88Nrddj3XCir",
      uuid: "7b1697cf-4240-4eed-bc19-e60f60268b31",
      userId: "t45AiwidW",
      commentId: "K3HLpKcGKDiP",
      transactionId: "lPUBZKlc4MLR",
      isRead: false,
      createdAt: new Date(),
      modifiedAt: new Date(),
    };

    const updateNotification = cy.spy();

    mount(
      <NotificationListItem notification={notification} updateNotification={updateNotification} />
    );

    cy.contains(`${notification.userFullName} commented on a transaction.`);
  });

  it("the isRead button calls the update notification function with the correct data when clicked.", () => {
    const notification = {
      userFullName: "Kaylin Homenick",
      id: "95qRwfJnSORQ",
      uuid: "0b5a0f25-c56b-4434-ba4d-21f133d8964f",
      userId: "t45AiwidW",
      transactionId: "xAsSYDsiEGSj",
      status: PaymentNotificationStatus.received,
      isRead: false,
      createdAt: new Date(),
      modifiedAt: new Date(),
    };

    const updateNotification = cy.spy().as("updateNotificationSpy");

    mount(
      <NotificationListItem notification={notification} updateNotification={updateNotification} />
    );

    cy.contains(`${notification.userFullName} received payment.`);
    cy.get("button").click();
    cy.get("@updateNotificationSpy").should("be.calledWith", {
      id: notification.id,
      isRead: true,
    });
  });
});
