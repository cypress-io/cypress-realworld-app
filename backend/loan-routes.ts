///<reference path="types.ts" />

import express from "express";
import { validationResult } from "express-validator";
import { createLoan, formatLoanForApiResponse, getUserById, getContactsByUserId } from "./database";
import { ensureAuthenticated, validateMiddleware } from "./helpers";
import { isLoanPayloadValidator } from "./validators";

const router = express.Router();

// POST /loans - Create a new loan request
router.post("/", ensureAuthenticated, validateMiddleware(isLoanPayloadValidator), (req, res) => {
  const { toUserId, amount, interestRate, durationMonths } = req.body;
  const borrowerId = req.user?.id!;

  // Validate that the lender (toUserId) exists
  const lender = getUserById(toUserId);
  if (!lender) {
    res.status(404);
    res.json({ error: "Lender not found" });
    return;
  }

  // Validate that toUserId is in borrower's contacts
  const borrowerContacts = getContactsByUserId(borrowerId);
  const isContact = borrowerContacts.some((contact) => contact.contactUserId === toUserId);

  if (!isContact) {
    res.status(404);
    res.json({ error: "Lender must be in your contacts" });
    return;
  }

  try {
    const loan = createLoan(borrowerId, {
      toUserId,
      amount,
      interestRate,
      durationMonths,
    });

    const formattedLoan = formatLoanForApiResponse(loan);

    res.status(201);
    res.json({ loan: formattedLoan });
  } catch (error) {
    console.error("Error creating loan:", error);
    res.status(500);
    res.json({ error: "Internal server error" });
  }
});

export default router;
