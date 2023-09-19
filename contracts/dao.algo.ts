import { Contract } from '@algorandfoundation/tealscript';

// eslint-disable-next-line no-unused-vars
class Dao extends Contract {
  proposal = GlobalStateKey<string>();

  createApplication(): void {
    this.proposal.value = 'This is a proposal.';
  }

  getProposal(): string {
    return this.proposal.value;
  }
}
