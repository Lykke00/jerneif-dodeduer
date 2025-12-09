import { type DepositResponse } from '../generated-ts-client';
import { extractApiErrors } from '../api/extractApiErrors';
import { useLoading } from './useLoading';
import { depositClient } from '../api/APIClients';
import { useAuthContext } from '../contexts/AuthContext';

type useDepositTypes = {
  deposit(amount: number, paymentId: string, picture: File | undefined): Promise<DepositResponse>;
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

  return {
    deposit,
    isLoading,
  };
};
