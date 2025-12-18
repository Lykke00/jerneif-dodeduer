import {
  type DepositResponse,
  type GetDepositsResponse,
  type PagedResultOfGetDepositsResponse,
} from '../generated-ts-client';
import { extractApiErrors } from '../api/extractApiErrors';
import { useLoading } from './useLoading';
import { depositClient } from '../api/APIClients';
import { useAuthContext } from '../contexts/AuthContext';
import { useState } from 'react';

// "" er alle
export type DepositStatus = '' | 'approved' | 'declined' | 'pending';

type useDepositTypes = {
  deposit(amount: number, paymentId: string, picture: File | undefined): Promise<DepositResponse>;
  getAll(page: number, pageSize: number): Promise<PagedResultOfGetDepositsResponse>;
  adminGetAll(
    search: string,
    status: DepositStatus,
    page: number,
    pageSize: number
  ): Promise<PagedResultOfGetDepositsResponse>;
  adminUpdateStatus(depositId: string, status: DepositStatus): Promise<GetDepositsResponse>;
  isLoading: boolean;
};

export const useDeposit = (): useDepositTypes => {
  const { isLoading, withLoading } = useLoading();
  const { makeApiCall } = useAuthContext();

  // anmod om at modtage token
  const deposit = async (
    amount: number,
    paymentId: string,
    picture: File | undefined
  ): Promise<DepositResponse> => {
    // prøv at kald backend og se om vi kan logge brugeren ind
    try {
      const fileParam = picture ? { data: picture, fileName: picture.name } : undefined;
      const response = await withLoading(() =>
        makeApiCall(() => depositClient.createDeposit(amount, paymentId, fileParam))
      );

      var createdDeposit = response.value;
      if (createdDeposit == null) {
        throw new Error('Ingen deposit modtaget');
      }

      return createdDeposit;
      // hvis en fejl sker, så extract fejlene og kast en error så vores
      // visningsside kan håndtere den korrekt med try catch.
    } catch (e) {
      const apiError = extractApiErrors(e);
      if (apiError) {
        throw new Error(apiError);
      }

      throw e;
    }
  };

  const getAll = async (
    page: number,
    pageSize: number
  ): Promise<PagedResultOfGetDepositsResponse> => {
    // prøv at kald backend og se om vi kan logge brugeren ind
    try {
      const response = await withLoading(() =>
        makeApiCall(() => depositClient.getDeposits(page, pageSize))
      );

      var allDeposits = response.value;
      if (allDeposits == null) {
        throw new Error('Ingen indbetalninger fundet');
      }

      return allDeposits;
      // hvis en fejl sker, så extract fejlene og kast en error så vores
      // visningsside kan håndtere den korrekt med try catch.
    } catch (e) {
      const apiError = extractApiErrors(e);
      if (apiError) {
        throw new Error(apiError);
      }

      throw e;
    }
  };

  const adminGetAll = async (
    search: string,
    status: DepositStatus,
    page: number,
    pageSize: number
  ): Promise<PagedResultOfGetDepositsResponse> => {
    // prøv at kald backend og se om vi kan logge brugeren ind
    try {
      const response = await withLoading(() =>
        makeApiCall(() => depositClient.getAllDeposits(search, status, page, pageSize))
      );

      var allDeposits = response.value;
      if (allDeposits == null) {
        throw new Error('Ingen indbetalninger fundet');
      }

      return allDeposits;
      // hvis en fejl sker, så extract fejlene og kast en error så vores
      // visningsside kan håndtere den korrekt med try catch.
    } catch (e) {
      const apiError = extractApiErrors(e);
      if (apiError) {
        throw new Error(apiError);
      }

      throw e;
    }
  };

  const adminUpdateStatus = async (
    depositId: string,
    status: DepositStatus
  ): Promise<GetDepositsResponse> => {
    try {
      const response = await withLoading(() =>
        makeApiCall(() => depositClient.updateDepositStatus(depositId, { status }))
      );

      var updatedDeposit = response.value;
      if (updatedDeposit == null) {
        throw new Error('Indbetalning blev ikke opdateret');
      }

      return updatedDeposit;
      // hvis en fejl sker, så extract fejlene og kast en error så vores
      // visningsside kan håndtere den korrekt med try catch.
    } catch (e) {
      const apiError = extractApiErrors(e);
      if (apiError) {
        throw new Error(apiError);
      }

      throw e;
    }
  };

  return {
    deposit,
    getAll,
    adminGetAll,
    adminUpdateStatus,
    isLoading,
  };
};
