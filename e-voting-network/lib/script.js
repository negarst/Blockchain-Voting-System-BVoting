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
        // Check if the election is still on hold.
        if(voting.electionAsset.endingTimestamp < Date.now / 1000) {
            throw new Error('The election is over.');
            return;
        }
    
        // Check if the the election asset ID matches the vote asset's election asset ID
        if(voting.electionAsset.electionAssetId !== voting.voteAsset.electionAssetId) {
            throw new Error('The vote ID does not match the election ID.');
            return;
        }
        
        // Check if the the member ID matches the vote asset's member ID
        if(voting.member.memberId !== voting.voteAsset.memberId) {
            throw new Error('The member ID does not match the vote ID.');
            return;
        }
    
        // Check if the voting timestamp is legal or not due to the related election's duration.
        if(voting.voteAsset.votingTimestamp > voting.electionAsset.endingTimestamp) {
                throw new Error('The election is over. You can not vote in this election anymore.');
            return;
        }
    
        // Check if the member has already voted in this election.
        if(voting.member.voted == true) {
            throw new Error('You have already voted in this election.');
            return;
        }
    
        // Check if the selected candidate name is whithin the election's candidate names.
        if(voting.electionAsset.candidatesNames.includes(voting.voteAsset.selectedCandidateName) == false) {
            throw new Error("The selected candidate's name is not whithin the election's candidates names.");
            return;
        }
    
        return getParticipantRegistry('org.blockchain.evoting.member')
        .then(function (memberParticipantRegistry) {
            // Update the voted parameter of the member participant.
            voting.member.voted = true;
    
            // Update the member participant in the participant registry.
            return memberParticipantRegistry.update(voting.member);
        })
        .then(getAssetRegistry('org.blockchain.evoting.electionAsset')
            .then(function(electionAssetRegistry) {
                // Increment the number of selected candidate's votes in the related election.
                let selectedCandidateIndex =
                voting.electionAsset.candidatesNames.indexOf(voting.voteAsset.selectedCandidateName);
                voting.electionAsset.candidatesVotes[selectedCandidateIndex] =
                (parseInt(voting.electionAsset.candidatesVotes[selectedCandidateIndex]) + 1).toString();
    
                // Update the election asset in the asset registry.
                return electionAssetRegistry.update(voting.electionAsset);
            }))
        .then(function() {
            // Emit an event for the added vote asset.
            let event = getFactory().newEvent('org.blockchain.evoting', 'newVoteEvent');
            event.firstName = voting.member.firstName;
            event.lastName = voting.member.lastName;
            event.electionAssetId = voting.voteAsset.electionAssetId;
            event.selectedCandidateName = voting.voteAsset.selectedCandidateName;
            
            emit(event);
            });
}

/**
 * Vote transaction processor function.
 * @param {org.blockchain.evoting.callForElection} election the callForElection transaction instance.
 * @transaction
 */
function callForElection(election) {
    // Reset every member's voted parameter to false.
    getParticipantRegistry('org.blockchain.evoting.member')
    .then(function (memberParticipantRegistry) {
        return memberParticipantRegistry.getAll();
    }).then(function(allMembers) {
        allMembers.forEach(function(member) {
            member.voted = false;
            memberParticipantRegistry.update(member);
        });
    })

    election.electionAsset.candidatesNames.forEach(function(candidateName, index, array) {
        election.electionAsset.candidatesVotes.push("0");
    });

    getAssetRegistry('org.blockchain.evoting.electionAsset')
    .then(function(electionAssetRegistry) {
        // Update the electionAsset CandidatesVotes with an array of zeros
        return electionAssetRegistry.update(election.electionAsset);
    })

	// Check if the election's starting timestamp is legal.
    // if(election.electionAsset.startingTimestamp < Date.now() / 1000 ) {
    //     // Date object is in Msec and timestamps is in secs
	// 	return;
	// }

    // Check if the election's ending timestamp is legal.
    // if(election.electionAsset.endingTimestamp > election.electionAsset.startingTimestamp ) {
    //     return;
    // }

	// Check if the directorMemberId exists and is valid.
    // getAssetRegistry('org.blockchain.evoting.member')
    // .then(function (memberParticipantRegistry) {
    //     // Determine if the specific member participant ID exists in the member asset registry.
    //     if(memberParticipantRegistry.exists(election.electionAsset.directorMemberId) == false) {
    //         return;
    //     }
    //     return memberParticipantRegistry;
    // })
    // .then(function(memberParticipantRegistry) {
    //     // Determine if the specific member participant ID belongs to a director.
    //     if(memberParticipantRegistry.get(election.electionAsset.directorMemberId).isDirector == false) {
    //         return;
    //     }
    // });

	// Check if candidatesNames are more than one.
    // if(election.electionAsset.candidatesNames.length < 2) {
    //     return;
    // }

    // return getParticipantRegistry('org.blockchain.evoting.electionAsset')
    // // Add the validated election asset to the election asset registry.
    // .then(function (electionAssetRegistry) {
    //     // Define a new electionAsset resource
    //     let newElectionAsset = getFactory().newResource('org.blockchain.evoting.electionAsset',
    //     'electionAsset', election.electionAsset.electionAssetId);
    //     newElectionAsset.startingTimestamp = election.electionAsset.startingTimestamp;
    //     newElectionAsset.endingTimestamp = election.electionAsset.endingTimestamp;
    //     newElectionAsset.directorMemberId = election.electionAsset.directorMemberId;
    //     newElectionAsset.candidatesNames = election.electionAsset.candidatesNames.slice(); // Copy the array
    //     let candidatesVotes = [];
    //     candidatesNames.forEach(function() {
    //         candidatesVotes.push('0');
    //     });
    //     newElectionAsset.candidatesVotes = candidatesVotes.slice(); // Copy the array

    //     // Add the new electionAsset resource to the election asset Registry.
    //     return electionAssetRegistry.add(newElectionAsset);
    // })
    // Emit the event of holding a new election.
    let event = getFactory().newEvent('org.blockchain.evoting', 'newElectionEvent');
    event.startingTimestamp = election.electionAsset.startingTimestamp;
    event.endingTimestamp = election.electionAsset.endingTimestamp;
    event.candidatesNames = election.electionAsset.candidatesNames.slice(); // Copy the array

    emit(event);
}

/**
 * Vote transaction processor function.
 * @param {org.blockchain.evoting.getElection} election the getElection transaction instance.
 * @returns {org.blockchain.evoting.electionAsset} The electionAsset.
 * @transaction
 */
function getElection(election) {

    // Check if the requested electionAsset ID exists.
    return getAssetRegistry('org.blockchain.evoting.electionAsset')
    .then(function (electionAssetRegistry) {
       if(electionAssetRegistry.exists(election.electionAssetId) == false) {
           throw new Error('The election asset ID does not exist.');
       }
       return electionAssetRegistry.get(election.electionAssetId);
    });
}