import {
  describe, test, expect, beforeAll, beforeEach,
} from '@jest/globals';
import algosdk, { makeAssetTransferTxnWithSuggestedParams } from 'algosdk';
import { algorandFixture } from '@algorandfoundation/algokit-utils/testing';
import { algos, microAlgos, getOrCreateKmdWalletAccount } from '@algorandfoundation/algokit-utils';
import { DaoClient } from '../contracts/clients/DaoClient';

const fixture = algorandFixture();

let appClient: DaoClient;

describe('Dao', () => {
  let algod: algosdk.Algodv2;
  let sender: algosdk.Account;
  let other: algosdk.Account;
  const proposal = 'This is a proposal.';
  let registeredASA: bigint;
  beforeEach(fixture.beforeEach);

  beforeAll(async () => {
    await fixture.beforeEach();
    algod = fixture.context.algod;
    const { testAccount, kmd } = fixture.context;
    sender = await getOrCreateKmdWalletAccount({
      name: 'tealscript-dao-sender',
      fundWith: algos(10),
    }, algod, kmd);
    other = await getOrCreateKmdWalletAccount({
      name: 'tealscript-dao-other',
      fundWith: algos(10),
    }, algod, kmd);

    appClient = new DaoClient(
      {
        sender: testAccount,
        resolveBy: 'id',
        id: 0,
      },
      algod,
    );

    await appClient.create.createApplication({ proposal });
  }, 15_000);

  test('getProposal', async () => {
    const proposalFromMethod = await appClient.getProposal({});
    expect(proposalFromMethod.return?.valueOf()).toBe(proposal);
  });

  test('getRegisteredASA (Negative)', async () => {
    await expect(appClient.getRegisteredAsa({})).rejects.toThrow();
  });

  test('bootstrap (Negative)', async () => {
    await appClient.appClient.fundAppAccount(microAlgos(200_000));

    await expect(appClient.bootstrap({}, {
      sender,
      sendParams: {
        fee: microAlgos(2_000),
      },
    })).rejects.toThrow();
  });

  test('bootstrap', async () => {
    const bootstrapResult = await appClient.bootstrap({}, {
      sendParams: {
        fee: microAlgos(2_000),
      },
    });
    registeredASA = bootstrapResult.return!.valueOf();
  });

  test('getRegisteredASA', async () => {
    const registeredAsaFromMethod = await appClient.getRegisteredAsa({});
    expect(registeredAsaFromMethod.return?.valueOf()).toBe(registeredASA);
  });

  test('vote (Negative)', async () => {
    await expect(appClient.vote({ inFavor: true, registeredASA }, { sender }))
      .rejects
      .toThrow();
  });

  test('register', async () => {
    const registeredAsaOptInTxn = makeAssetTransferTxnWithSuggestedParams(
      sender.addr,
      sender.addr,
      undefined,
      undefined,
      0,
      undefined,
      Number(registeredASA),
      await algod.getTransactionParams().do(),
    );
    await algod.sendRawTransaction(registeredAsaOptInTxn.signTxn(sender.sk)).do();
    await algosdk.waitForConfirmation(algod, registeredAsaOptInTxn.txID(), 1);

    await appClient.optIn.register({ registeredASA }, {
      sender,
      sendParams: {
        fee: microAlgos(3_000),
      },
    });

    const registeredAsaTransferTxn = makeAssetTransferTxnWithSuggestedParams(
      sender.addr,
      sender.addr,
      undefined,
      undefined,
      1,
      undefined,
      Number(registeredASA),
      await algod.getTransactionParams().do(),
    );
    await expect(algod.sendRawTransaction(registeredAsaTransferTxn.signTxn(sender.sk)).do())
      .rejects
      .toThrow();
  });

  test('getVotes (Negative: should fail because no vote)', async () => {
    await expect(appClient.getVotes({})).rejects.toThrow();
  });

  test('vote & getVotes', async () => {
    await appClient.vote({ inFavor: true, registeredASA }, { sender });

    const votesAfter = await appClient.getVotes({});
    expect(votesAfter.return?.valueOf()).toEqual([BigInt(1), BigInt(1)]);

    await expect(appClient.vote({ inFavor: false, registeredASA }, { sender }))
      .rejects
      .toThrow();

    const votesAfter2 = await appClient.getVotes({});
    expect(votesAfter2.return?.valueOf()).toEqual([BigInt(1), BigInt(1)]);
  });

  test('deregister', async () => {
    await appClient.closeOut.deregister(
      { registeredASA },
      {
        sender,
        sendParams: {
          fee: microAlgos(2_000),
        },
      },
    );

    const votesAfter = await appClient.getVotes({});
    expect(votesAfter.return?.valueOf()).toEqual([BigInt(0), BigInt(0)]);

    const registeredAsaOptOutTxn = makeAssetTransferTxnWithSuggestedParams(
      sender.addr,
      other.addr,
      other.addr,
      undefined,
      0,
      undefined,
      Number(registeredASA),
      await algod.getTransactionParams().do(),
    );
    await algod.sendRawTransaction(registeredAsaOptOutTxn.signTxn(sender.sk)).do();
    await algosdk.waitForConfirmation(algod, registeredAsaOptOutTxn.txID(), 1);

    const registeredAsaOptInTxn = makeAssetTransferTxnWithSuggestedParams(
      sender.addr,
      sender.addr,
      undefined,
      undefined,
      0,
      undefined,
      Number(registeredASA),
      await algod.getTransactionParams().do(),
    );
    await algod.sendRawTransaction(registeredAsaOptInTxn.signTxn(sender.sk)).do();
    await algosdk.waitForConfirmation(algod, registeredAsaOptInTxn.txID(), 1);

    await appClient.optIn.register({ registeredASA }, {
      sender,
      sendParams: {
        fee: microAlgos(3_000),
      },
    });

    await appClient.vote({ inFavor: false, registeredASA }, { sender });

    const votesAfter2 = await appClient.getVotes({});
    expect(votesAfter2.return?.valueOf()).toEqual([BigInt(1), BigInt(0)]);
  });

  test('clearState', async () => {
    await appClient.clearState({ sender });

    const votesAfter = await appClient.getVotes({});
    expect(votesAfter.return?.valueOf()).toEqual([BigInt(0), BigInt(0)]);

    await expect(appClient.vote({ inFavor: true, registeredASA }, { sender }))
      .rejects
      .toThrow();

    await expect(appClient.optIn.register({ registeredASA }, {
      sender,
      sendParams: {
        fee: microAlgos(3_000),
      },
    }))
      .rejects
      .toThrow();
  });
});
