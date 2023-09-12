import { Contract } from '@algorandfoundation/tealscript';

// eslint-disable-next-line no-unused-vars
class Dao extends Contract {
  registeredAsaId = GlobalStateKey<Asset>();

  proposal = GlobalStateKey<string>({ key: 'p' });

  endVoting = GlobalStateKey<number>();

  votesTotal = GlobalStateKey<number>();

  votesInFavor = GlobalStateKey<number>();

  inFavor = LocalStateKey<boolean>();

  createApplication(proposal: string, endVoting: number): void {
    this.proposal.value = proposal;
    this.endVoting.value = endVoting;
  }

  bootstrap(): Asset {
    assert(this.txn.sender === this.app.creator);
    assert(!this.registeredAsaId.exists);
    const registeredAsa = sendAssetCreation({
      configAssetTotal: 1_000,
      configAssetDecimals: 0,
      configAssetFreeze: this.app.address,
      configAssetClawback: this.app.address,
      fee: 0,
    });
    this.registeredAsaId.value = registeredAsa;
    return registeredAsa;
  }

  @allow.call('OptIn')
  // eslint-disable-next-line no-unused-vars
  register(registeredASA: Asset): void {
    assert(globals.latestTimestamp < this.endVoting.value);
    assert(this.txn.sender.assetBalance(this.registeredAsaId.value) === 0);
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

  private forgetVote(): void {
    if (this.inFavor(this.txn.sender).exists) {
      this.votesTotal.value = this.votesTotal.value - 1;
      if (this.inFavor(this.txn.sender).value) {
        this.votesInFavor.value = this.votesInFavor.value - 1;
      }
    }
  }

  @allow.call('CloseOut')
  // eslint-disable-next-line no-unused-vars
  deregister(registeredASA: Asset): void {
    assert(this.txn.sender.assetBalance(this.registeredAsaId.value) === 1);
    sendAssetTransfer({
      xferAsset: this.registeredAsaId.value,
      assetSender: this.txn.sender,
      assetReceiver: this.app.address,
      assetAmount: 1,
      fee: 0,
    });
    this.forgetVote();
  }

  clearState(): void {
    this.forgetVote();
  }

  // eslint-disable-next-line no-unused-vars
  vote(inFavor: boolean, registeredASA: Asset): void {
    assert(globals.latestTimestamp < this.endVoting.value);
    assert(this.txn.sender.assetBalance(this.registeredAsaId.value) === 1);
    assert(!this.inFavor(this.txn.sender).exists);
    this.inFavor(this.txn.sender).value = inFavor;
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
