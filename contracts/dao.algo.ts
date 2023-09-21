import { Contract } from '@algorandfoundation/tealscript';

// eslint-disable-next-line no-unused-vars
class Dao extends Contract {
  proposal = GlobalStateKey<string>();

  votesTotal = GlobalStateKey<number>();

  votesInFavor = GlobalStateKey<number>();

  createApplication(proposal: string): void {
    this.proposal.value = proposal;
  }

  vote(inFavor: boolean): void {
    this.votesTotal.value = this.votesTotal.value + 1;
    if (inFavor) {
      this.votesInFavor.value = this.votesInFavor.value + 1;
    }
  }

  getProposal(): string {
    return this.proposal.value;
  }

  getVotes(): { votesTotal: number, votesInFavor: number } {
    assert(this.votesTotal.exists);
    return { votesTotal: this.votesTotal.value, votesInFavor: this.votesInFavor.value };
  }
}
