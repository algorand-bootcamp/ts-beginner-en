import { Contract } from '@algorandfoundation/tealscript';

// eslint-disable-next-line no-unused-vars
class Dao extends Contract {
  registeredAsaId = GlobalStateKey<Asset>();

  proposal = GlobalStateKey<string>({ key: 'p' });

  votesTotal = GlobalStateKey<number>();

  votesInFavor = GlobalStateKey<number>();

  hasVoted = LocalStateKey<boolean>();

  createApplication(proposal: string): void {
    this.proposal.value = proposal;
  }

  bootstrap(): Asset {
    assert(this.txn.sender === this.app.creator);
    assert(!this.registeredAsaId.exists);
    const registeredAsa = sendAssetCreation({
      configAssetTotal: 1_000,
      configAssetDecimals: 0,
      configAssetFreeze: this.app.address,
      fee: 0,
    });
    this.registeredAsaId.value = registeredAsa;
    return registeredAsa;
  }

  @allow.call('OptIn')
  // eslint-disable-next-line no-unused-vars
  register(registeredASA: Asset): void {
    assert(this.txn.sender.assetBalance(this.registeredAsaId.value) === 0);
    this.hasVoted(this.txn.sender).value = false;
    sendAssetTransfer({
      xferAsset: this.registeredAsaId.value,
      assetReceiver: this.txn.sender,
      assetAmount: 1,
      fee: 0,
    });
    sendAssetFreeze({
      freezeAsset: this.registeredAsaId.value,
      freezeAssetAccount: this.txn.sender,
      freezeAssetFrozen: true,
      fee: 0,
    });
  }

  // eslint-disable-next-line no-unused-vars
  vote(inFavor: boolean, registeredASA: Asset): void {
    assert(this.txn.sender.assetBalance(this.registeredAsaId.value) === 1);
    assert(!this.hasVoted(this.txn.sender).value);
    this.hasVoted(this.txn.sender).value = true;
    this.votesTotal.value = this.votesTotal.value + 1;
    if (inFavor) {
      this.votesInFavor.value = this.votesInFavor.value + 1;
    }
  }

  getProposal(): string {
    return this.proposal.value;
  }

  getRegisteredASA(): Asset {
    assert(this.registeredAsaId.exists);
    return this.registeredAsaId.value;
  }

  getVotes(): { votesTotal: number, votesInFavor: number } {
    assert(this.votesTotal.exists);
    return { votesTotal: this.votesTotal.value, votesInFavor: this.votesInFavor.value };
  }
}
