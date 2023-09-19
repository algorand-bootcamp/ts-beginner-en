import { Contract } from '@algorandfoundation/tealscript';

// eslint-disable-next-line no-unused-vars
class Dao extends Contract {
  proposal = GlobalStateKey<string>();

  createApplication(proposal: string): void {
    this.proposal.value = proposal;
  }

  getProposal(): string {
    return this.proposal.value;
  }
}
