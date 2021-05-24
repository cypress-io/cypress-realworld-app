import { omit } from "lodash/fp";
import gql from "graphql-tag";
import { dataMachine } from "./dataMachine";
import { httpClient } from "../utils/asyncUtils";
import { backendPort } from "../utils/portUtils";

const listBankAccountQuery = gql`
  query ListBankAccount {
    listBankAccount {
      id
      uuid
      userId
      bankName
      accountNumber
      routingNumber
      isDeleted
      createdAt
      modifiedAt
    }
  }
`;

const deleteBankAccountMutation = gql`
  mutation DeleteBankAccount($id: ID!) {
    deleteBankAccount(id: $id)
  }
`;

const createBankAccountMutation = gql`
  mutation CreateBankAccount($bankName: String!, $accountNumber: String!, $routingNumber: String!) {
    createBankAccount(
      bankName: $bankName
      accountNumber: $accountNumber
      routingNumber: $routingNumber
    ) {
      id
      uuid
      userId
      bankName
      accountNumber
      routingNumber
      isDeleted
      createdAt
    }
  }
`;

export const bankAccountsMachine = dataMachine("bankAccounts").withConfig({
  services: {
    fetchData: async (ctx, event: any) => {
      const resp = await httpClient.post(`http://localhost:${backendPort}/graphql`, {
        operationName: "ListBankAccount",
        query: listBankAccountQuery.loc?.source.body,
      });
      return { results: resp.data.data.listBankAccount, pageData: {} };
    },
    deleteData: async (ctx, event: any) => {
      const payload = omit("type", event);
      const resp = await httpClient.post(`http://localhost:${backendPort}/graphql`, {
        operationName: "DeleteBankAccount",
        query: deleteBankAccountMutation.loc?.source.body,
        variables: payload,
      });
      return resp.data;
    },
    createData: async (ctx, event: any) => {
      const payload = omit("type", event);
      const resp = await httpClient.post(`http://localhost:${backendPort}/graphql`, {
        operationName: "CreateBankAccount",
        query: createBankAccountMutation.loc?.source.body,
        variables: payload,
      });
      return resp.data;
    },
  },
});
