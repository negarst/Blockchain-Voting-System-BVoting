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
function voteTransaction(voteId, memberId, electionId, selectedCandidateName, votingTimestamp) {

    // Check if no other election is on hold.
    getAssetRegistry('org.blockchain.evoting.electionAsset')
    .then(function (electionAssetRegistry) {
        // Determine if the specific vote asset Id already does not exist in the vote asset registry.
        return electionAssetRegistry.getAll();
    }).then(function(allElections) {
        allElections.forEach(function(election) {
            if(election.endingTimestamp < Date.now() / 1000)
            return;
        });
    });

    // Reset every member's voted parameter to false.
    getParticipantRegistry('org.blockchain.evoting.member')
    .then(function (memberParticipantRegistry) {
        return memberParticipantRegistry.getAll();
    }).then(function(allMembers) {
        allMembers.forEach(function(member) {
            member.voted = false;
        });
    })

	// Check if the new vote asset ID already exists.
    getAssetRegistry('org.blockchain.evoting.voteAsset')
    .then(function (voteAssetRegistry) {
        // Determine if the specific vote asset Id already does not exist in the vote asset registry.
        if(voteAssetRegistry.exists(voteId) == true) {
            return;
        };
    })

    // Check if the member participant's Id exist.
    getParticipantRegistry('org.blockchain.evoting.member')
    .then(function (memberParticipantRegistry) {
        // Determine if the specific member participant Id exists in the member participant registry.
        if(memberParticipantRegistry.exists(memberId) == false) {
            return;
        };
    })

    // Check if the related election exists.
    getAssetRegistry('org.blockchain.evoting.electionAsset')
    .then(function (electionAssetRegistry) {
        // Determine if the specific vote asset Id already does not exist in the vote asset registry.
        if(electionAssetRegistry.exists(electionId) == false) {
            return;
        };
    })

    // Check if the voting timestamp is legal or not.
    getAssetRegistry('org.blockchain.evoting.electionAsset')
    .then(function (electionAssetRegistry) {
        let election = electionAssetRegistry.get(electionId);
        if(votingTimestamp > election.endingTimestamp ||
            votingTimestamp < election.startingTimestamp) {
            return;
        };
    })

	// Check if the member has already voted in this election, or not.
    getParticipantRegistry('org.blockchain.evoting.member')
    .then(function (memberParticipantRegistry) {
        let member = memberParticipantRegistry.get(memberId);
        if(member.voted == true) {
            return;
        };
    })

    // Check if the selected candidate name is whithin the election's candidate names, or not.
    getAssetRegistry('org.blockchain.evoting.electionAsset')
    .then(function (electionAssetRegistry) {
        let election = electionAssetRegistry.get(electionId);
        if(election.candidatesNames.includes(selectedCandidateName) == false) {
            return;
        };
    })

    return getParticipantRegistry('org.blockchain.evoting.member')
    .then(function (memberParticipantRegistry) {
        // Update the voted parameter of the member participant.
        let member = memberParticipantRegistry.get(memberId);
        member.voted = true;

        // Update the member participant in the participant registry.
		memberParticipantRegistry.update(member);
    })
    .then(getAssetRegistry('org.blockchain.evoting.voteAsset')
        .then(function (voteAssetRegistry) {
            // Create the validated vote asset in the vote asset registry.
            var newVoteAsset = getFactory()
            .newResource('org.blockchain.evoting', 'voteAsset', voteId);
            newVoteAsset.voteAssetId = voteId;
            newVoteAsset.memberId = memberId;
            newVoteAsset.electionAssetId = electionId;
            newVoteAsset.selectedCandidateName = selectedCandidateName;
            newVoteAsset.votingTimestamp = votingTimestamp;

            // Add the new vote asset to the vote asset registry.
            return voteAssetRegistry.add(newVoteAsset);
        })).then(function() {
            // Increment the number of selected candidate's votes in the relevant election.
            getAssetRegistry('org.blockchain.evoting.electionAsset')
            .then(function(electionAssetRegistry) {
                let election = electionAssetRegistry.get(electionId);
                let candidateIndex = election.candidatesNames.indexOf(selectedCandidateName);
                election.candidatesVotes[candidateIndex] += 1;
                electionAssetRegistry.update(election);
            })
        }).then(function() {
            // Emit an event for the added vote asset.
            var event = getFactory().newEvent('org.blockchain.evoting', 'New Vote');
            getParticipantRegistry('org.blockchain.evoting.member')
            .then(function(memberParticipantRegistry) {
                let member = memberParticipantRegistry.get(memberId);
            event.memberFirstName = member.firstName;
            event.memberLastName = member.lastName;
            event.electionId = electionId;
            event.selectedCandidateName = selectedCandidateName;
            emit(event);
            })
        });
}


/**
 * Election creating and announcing function.
 */
function callForAnElection(
    electionId, startingTimestamp, endingTimestamp, directorMemberId, candidatesNames) {

	// Check if the new electionAsset ID already exists, or not.
    getAssetRegistry('org.blockchain.evoting.electionAsset')
    .then(function (electionAssetRegistry) {
        // Determine if the specific electionAsset ID exists in the electionAsset registry.
        if(electionAssetRegistry.exists(electionId) == true) {
            return;
        };
    })

	// Check if the election's starting timestamp is legal.
    if(startingTimestamp < Date.now() / 1000 ) {
        // Date object is in Msec and timestamps is in secs
		return;
	}

    // Check if the election's ending timestamp is legal.
    if(endingTimestamp > startingTimestamp ) {
        return;
    }

	// Check if the directorMemberId exists and is valid.
    getAssetRegistry('org.blockchain.evoting.member')
    .then(function (memberParticipantRegistry) {
        // Determine if the specific member participant ID exists in the member asset registry.
        if(memberParticipantRegistry.exists(directorMemberId) == false ||
        memberParticipantRegistry.isDirector == false) {
            return;
        };
    })

	// Check if candidatesNames are more than one.
    if(candidatesNames.length < 2) {
        return;
    }

    return getParticipantRegistry('org.blockchain.evoting.electionAsset')
    .then(function (electionAssetRegistry) {
        // Define a new electionAsset
        var newElectionAsset = getFactory()
            .newResource('org.blockchain.evoting.electionAsset', 'electionAsset', electionId);
        newElectionAsset.startingTimestamp = startingTimestamp;
        newElectionAsset.endingTimestamp = endingTimestamp;
        newElectionAsset.directorMemberId = directorMemberId;
        newElectionAsset.candidatesNames = candidatesNames.slice(); // Copy the array
        var candidateVotes = [];
        candidatesNames.forEach(function() {
            candidatesVotes.push('0');
        });
        newElectionAsset.candidatesVotes = candidatesVotes.slice();

        // Add the newly defined electionAsset to the electionAsset Registry.
        electionAssetRegistry.add(newElectionAsset);
    })
    .then(function () {
        // Emit an event to call for voting in the new election
        let event = getFactory().newEvent('org.blockchain.evoting', 'NewElection');
        event.startingTimestamp = startingTimestamp;
        event.endingTimestamp = endingTimestamp;
        event.candidatesNames = candidatesNames.slice();

        emit(event);
    });
}

/**
 * Election ending and announcing the result function.
 */
function getElectionResult(electionId) {

    // Check if the requested electionAsset ID exists.
    return getParticipantRegistry('org.blockchain.evoting.electionAsset')
    .then(function (electionAssetRegistry) {
       if(electionAssetRegistry.exists(electionId) == false)
       return;
       let election = electionAssetRegistry.get(electionId);
       let result = '{'
       +'"electionId" : '  + election.electionAssetId + ','
       +'"startingTimestamp" : '  + election.startingTimestamp + ','
       +'"endingTimestamp" : '  + election.endingTimestamp + ','
       +'"directorMemberId" : '  + election.directorMemberId + ','
       +'"candidatesNames" : '  + election.candidatesNames + ','
       +'"candidatesVotes" : '  + election.candidatesVotes
       +'}';
       return result;
    });
}