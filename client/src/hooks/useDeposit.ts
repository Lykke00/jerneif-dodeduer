import {
  type DepositResponse,
  type PagedResultOfGetDepositsResponse,
} from '../generated-ts-client';
import { extractApiErrors } from '../api/extractApiErrors';
import { useLoading } from './useLoading';
import { depositClient } from '../api/APIClients';
import { useAuthContext } from '../contexts/AuthContext';
import { useState } from 'react';

type useDepositTypes = {
  deposit(amount: number, paymentId: string, picture: File | undefined): Promise<DepositResponse>;
  getAll(page: number, pageSize: number): Promise<PagedResultOfGetDepositsResponse>;
  isLoading: boolean;
};

export const useDeposit = (): useDepositTypes => {
  const { isLoading, withLoading } = useLoading();
  const { makeApiCall } = useAuthContext();

  const [allDeposits, setAllDeposits] = useState<PagedResultOfGetDepositsResponse>();

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

      setAllDeposits(allDeposits);

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

  return {
    deposit,
    getAll,
    isLoading,
  };
};
