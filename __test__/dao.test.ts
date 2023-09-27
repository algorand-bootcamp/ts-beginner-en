import {
  describe, test, expect, beforeAll, beforeEach
} from '@jest/globals';
import * as algokit from '@algorandfoundation/algokit-utils';
import algosdk from 'algosdk';
import { algorandFixture } from '@algorandfoundation/algokit-utils/testing';
import { DaoClient } from '../contracts/clients/DaoClient';

const fixture = algorandFixture();

let appClient: DaoClient;

describe('Dao', () => {
  beforeEach(fixture.beforeEach);

  beforeAll(async () => {
    await fixture.beforeEach();
    const { algod, testAccount } = fixture.context;
    const sender = algosdk.generateAccount();

    appClient = new DaoClient(
      {
        sender: testAccount,
        resolveBy: 'id',
        id: 0,
      },
      algod,
    );

    await appClient.create.bare();
  });

  test('sum', async () => {
    const a = 13;
    const b = 37;
    const sum = await appClient.doMath({ a, b, operation: 'sum' });
    expect(sum.return?.valueOf()).toBe(BigInt(a + b));
  });

  test('difference', async () => {
    const a = 13;
    const b = 37;
    const diff = await appClient.doMath({ a, b, operation: 'difference' });
    expect(diff.return?.valueOf()).toBe(BigInt(a >= b ? a - b : b - a));
  });
});
