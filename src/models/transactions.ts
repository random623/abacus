import { createModel } from '@rematch/core';
import { AxiosResponse } from 'axios';
import { RootModel } from './index';

export type TransactionSplitType = {
  order?: number
  description: string,
  amount: string,
  type: string,
  categoryId: string,
  categoryName: string,
  budgetId: string,
  budgetName: string,
  currencyCode: string,
  currencySymbol: string,
  currencyDecimalPlaces?: number,
  date: string | Date,
  sourceName: string,
  destinationName: string,
  tags: string[],
  notes: string,
  foreignAmount: string,
  foreignCurrencyId: string,
  foreignCurrencyCode?: string,
}

export type TransactionType = {
  id: string
  type: string
  attributes: {
    groupTitle: string
    transactions: TransactionSplitType[]
    user: string
    createdAt: string
    updatedAt: string
  },
}

export type TransactionStateType = {
  transactionPayload: {
    title: string
    transactions: TransactionSplitType[]
  },
  page: number
  totalPages: number
  error: string
  success: boolean
}

export type ErrorStateType = {
  description: string
  sourceName: string
  destinationName: string
  amount: string
  categoryId: string
  budgetId: string
  tags: string
  foreignCurrencyId: string
  foreignAmount: string
  notes: string
}

export const initialSplit = () => ({
  type: 'withdrawal',
  amount: '',
  currencyCode: '',
  currencySymbol: '',
  date: new Date(),
  description: '',
  foreignCurrencyId: '',
  foreignAmount: '',
  sourceName: '',
  destinationName: '',
  categoryName: '',
  categoryId: '',
  budgetName: '',
  budgetId: '',
  tags: [],
  notes: '',
}) as TransactionSplitType;

const INITIAL_STATE = {
  page: 1,
  totalPages: 1,
  transactionPayload: null,
  error: '',
  success: false,
} as TransactionStateType;

export default createModel<RootModel>()({

  state: INITIAL_STATE,

  reducers: {
    setMetaPagination(state, payload): TransactionStateType {
      const {
        page = state.page,
        totalPages = state.totalPages,
      } = payload;

      return {
        ...state,
        page,
        totalPages,
      };
    },
    setGroupTitle(state, title): TransactionStateType {
      const {
        transactionPayload,
      } = state;

      return {
        ...state,
        transactionPayload: {
          ...transactionPayload,
          title,
        },
      };
    },
    setTransactionSplitByIndex(state, index, split): TransactionStateType {
      const {
        transactionPayload,
      } = state;

      const newTransactions = [...transactionPayload.transactions];
      newTransactions[index] = split;

      return {
        ...state,
        transactionPayload: {
          ...transactionPayload,
          transactions: newTransactions,
        },
      };
    },
    addTransactionSplit(state): TransactionStateType {
      const {
        transactionPayload,
      } = state;

      return {
        ...state,
        transactionPayload: {
          ...transactionPayload,
          transactions: [
            ...transactionPayload.transactions,
            initialSplit(),
          ],
        },
      };
    },
    deleteTransactionSplit(state, index): TransactionStateType {
      const {
        transactionPayload,
      } = state;

      return {
        ...state,
        transactionPayload: {
          ...transactionPayload,
          transactions: transactionPayload.transactions.filter((_, i) => i !== index),
        },
      };
    },
    setTransaction(state, payload): TransactionStateType {
      const {
        splits,
        title,
      } = payload;

      return {
        ...state,
        transactionPayload: {
          title,
          transactions: splits,
        },
      };
    },
    resetTransaction(state, payload): TransactionStateType {
      const {
        splits,
        title,
      } = payload;

      return {
        ...state,
        transactionPayload: {
          title,
          transactions: splits.length ? splits.map((split) => ({
            ...split,
            date: new Date(split.date),
            amount: split.amount ? parseFloat(split.amount).toFixed(2) : '',
            foreignAmount: split.foreignAmount ? parseFloat(split.foreignAmount).toFixed(2) : '',
          })) : [{ ...initialSplit() }],
        },
      };
    },
    setErrorStatus(state, error): TransactionStateType {
      return {
        ...state,
        error,
        success: false,
      };
    },
    setSuccessStatus(state): TransactionStateType {
      return {
        ...state,
        success: true,
      };
    },
    resetStatus(state): TransactionStateType {
      return {
        ...state,
        error: '',
        success: false,
      };
    },
    resetState() {
      return INITIAL_STATE;
    },
  },

  effects: (dispatch) => ({
    async getTransactions(_: void, rootState): Promise<TransactionType[]> {
      const {
        firefly: {
          rangeDetails: {
            start,
            end,
          },
        },
        currencies: {
          currentCode,
        },
      } = rootState;

      const type = 'all';
      const currentPage = 1;
      const {
        data: transactions,
        meta,
      } = await dispatch.configuration.apiFetch({ url: `/api/v1/currencies/${currentCode}/transactions?page=${currentPage}&start=${start}&end=${end}&type=${type}` }) as { data: TransactionType[], meta };

      dispatch.transactions.setMetaPagination({
        page: meta.pagination.currentPage,
        totalPages: meta.pagination.totalPages,
      });

      return transactions;
    },
    async getMoreTransactions(_: void, rootState): Promise<TransactionType[]> {
      const {
        firefly: {
          rangeDetails: {
            start,
            end,
          },
        },
        transactions: {
          page = 1,
          totalPages = 1,
        },
        currencies: {
          currentCode,
        },
      } = rootState;

      const type = 'all';
      const currentPage = (page < totalPages) ? page + 1 : 1;
      if (page < totalPages) {
        const {
          data: transactions,
          meta,
        } = await dispatch.configuration.apiFetch({ url: `/api/v1/currencies/${currentCode}/transactions?page=${currentPage}&start=${start}&end=${end}&type=${type}` }) as { data: TransactionType[], meta };

        dispatch.transactions.setMetaPagination({
          page: meta.pagination.currentPage,
          totalPages: meta.pagination.totalPages,
        });

        return transactions;
      }

      return [];
    },
    async createTransaction(_: void, rootState): Promise<AxiosResponse> {
      const {
        transactions: {
          transactionPayload: {
            title,
            transactions,
          },
        },
      } = rootState;

      const body = {
        group_title: title,
        transactions: transactions.map((transaction) => ({
          tags: transaction.tags,
          notes: transaction.notes,
          foreign_amount: transaction.foreignAmount ? parseFloat(transaction.foreignAmount.replace(',', '.')) : 0,
          foreign_currency_id: transaction.foreignCurrencyId,
          description: transaction.description,
          date: transaction.date,
          source_name: transaction.sourceName,
          destination_name: transaction.destinationName,
          category_id: transaction.categoryName === '' ? undefined : transaction.categoryId,
          category_name: transaction.categoryName,
          budget_id: transaction.budgetId,
          budget_name: transaction.budgetName,
          type: transaction.type,
          amount: transaction.amount ? parseFloat(transaction.amount.replace(',', '.')) : 0,
        })),
        error_if_duplicate_hash: false,
        apply_rules: true,
        fire_webhooks: true,
      };

      const data = await dispatch.configuration.apiPost({ url: '/api/v1/transactions', body });

      return data;
    },
    async updateTransaction({ id }, rootState): Promise<AxiosResponse> {
      const {
        transactions: {
          transactionPayload: {
            title,
            transactions,
          },
        },
      } = rootState;

      const body = {
        group_title: title,
        transactions: transactions.map((transaction: TransactionSplitType) => ({
          tags: transaction.tags,
          notes: transaction.notes,
          foreign_amount: transaction.foreignAmount ? parseFloat(transaction.foreignAmount.replace(',', '.')) : 0,
          foreign_currency_id: transaction.foreignCurrencyId,
          description: transaction.description,
          date: transaction.date,
          source_name: transaction.sourceName,
          destination_name: transaction.destinationName,
          category_id: transaction.categoryName === '' ? undefined : transaction.categoryId,
          category_name: transaction.categoryName,
          budget_id: transaction.budgetId,
          budget_name: transaction.budgetName,
          type: transaction.type,
          amount: transaction.amount ? parseFloat(transaction.amount.replace(',', '.')) : 0,
        })),
      };

      const data = await dispatch.configuration.apiPut({ url: `/api/v1/transactions/${id}`, body });

      return data;
    },
    async deleteTransaction(id): Promise<AxiosResponse> {
      const data = await dispatch.configuration.apiDelete({ url: `/api/v1/transactions/${id}` });

      return data;
    },
  }),
});
