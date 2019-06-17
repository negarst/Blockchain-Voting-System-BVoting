/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* global getAssetRegistry getFactory emit */

/**
 * Vote transaction processor function.
 * @param {org.blockchain.evoting.voteTransaction} voting the vote transaction instance.
 * @transaction
 */
function voteTransaction(voting) {

	// Check if the new vote asset ID already exists, or not.
    getAssetRegistry('org.blockchain.evoting.voteAsset')
    .then(function (voteAssetRegistry) {
        // Determine if the specific vote asset id exists in the vote asset registry.
        if(voteAssetRegistry.exists(voting.voteAssetId) == true) {
            return;
        };
    })

	// Check if the voting timestamp is legal or not.
    if(voting.votingTimestamp < voting.electionAsset.startingTimestamp &&
        voting.votingTimestamp > voting.electionAsset.endingTimestamp) {
		return;
	}

	// Check if the voting timestamp is legal or not.
    if(voting.votingTimestamp < voting.electionAsset.startingTimestamp &&
        voting.votingTimestamp > voting.electionAsset.endingTimestamp) {
		return;
	}

	// Check if the given vote belongs to the given member or not.
	if(voting.voteAsset.memberId != voting.member.memberId) {
		return;
	}

	// Check if the member has already voted in this election, or not.
    if(voting.member.voted == true) {
        return;
    }

    // Check if the selected candidate name is whithin the election's candidate names, or not.
    if(voting.electionAsset.candidatesNames.includes(voting.selectedCandidateName) == false) {
        return;
    }

    return getParticipantRegistry('org.blockchain.evoting.member')
    .then(function (memberParticipantRegistry) {
        // Update the voted parameter of the member participant.
        voting.member.voted = true;

        // Update the member participant in the participant registry.
		memberParticipantRegistry.update(voting.member);
    })
    .then(getAssetRegistry('org.blockchain.evoting.voteAsset')
        .then(function (voteAssetRegistry) {
            // Create the validated vote asset in the vote asset registry.
            var newVoteAsset = getFactory()
            .newResource('org.blockchain.evoting', 'voteAsset', voting.voteAssetId);
            newVoteAsset.selectedCandidateName = voting.selectedCandidateName;
            newVoteAsset.votingTimestamp = voting.votingTimestamp;
            newVoteAsset.memberId = voting.member.memberId;
            newVoteAsset.electionAsset = voting.electionAsset;

            // Add the new vote asset to the vote asset registry.
            return voteAssetRegistry.add(newVoteAsset);
        }))
        .then(function (newVoteAsset) {
            // Emit an event for the added asset.
            var event = getFactory().newEvent('org.blockchain.evoting', 'New Vote');
            event.newVote = newVoteAsset;
            emit(event);

        });

}