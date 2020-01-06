import React from "react";

interface Transaction {
  id: number;
  to: string;
  from: string;
  amount: number;
}

type TransactionProps = {
  transaction: Transaction;
};

const TransactionCard: React.FC<TransactionProps> = ({ transaction }) => (
  <li>
    <div>
      <p>
        <span>{transaction.from}</span>
        <span> paid </span>
        <span>{transaction.to}</span>
      </p>
    </div>
    <div>
      <div>${transaction.amount}</div>
    </div>
  </li>
);

export default TransactionCard;
