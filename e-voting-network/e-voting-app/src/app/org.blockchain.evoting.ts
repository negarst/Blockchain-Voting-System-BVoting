import {Asset} from './org.hyperledger.composer.system';
import {Participant} from './org.hyperledger.composer.system';
import {Transaction} from './org.hyperledger.composer.system';
import {Event} from './org.hyperledger.composer.system';
// export namespace org.blockchain.evoting{
   export class member extends Participant {
      memberId: string;
      firstName: string;
      lastName: string;
      voted: boolean;
      isDirector: boolean;
      participatedInWhichElections: string[];
      votedToWhomInPastElections: string[];
   }
   export class electionAsset extends Asset {
      electionAssetId: string;
      startingTimestamp: string;
      endingTimestamp: string;
      directorMemberId: string;
      candidatesNames: string[];
      candidatesVotes: string[];
   }
   export class voteAsset extends Asset {
      voteAssetId: string;
      memberId: string;
      electionAssetId: string;
      selectedCandidateName: string;
      votingTimestamp: string;
   }
   export class callForElection extends Transaction {
      electionAsset: electionAsset;
   }
   export class voteTransaction extends Transaction {
      electionAsset: electionAsset;
      voteAsset: voteAsset;
      member: member;
   }
   export class getElection extends Transaction {
      electionAssetId: string;
   }
   export class newVoteEvent extends Event {
      firstName: string;
      lastName: string;
      electionAssetId: string;
      selectedCandidateName: string;
   }
   export class newElectionEvent extends Event {
      startingTimestamp: string;
      endingTimestamp: string;
      candidatesNames: string[];
   }
// }
