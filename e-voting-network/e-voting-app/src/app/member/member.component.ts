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

import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { memberService } from './member.service';
import 'rxjs/add/operator/toPromise';

@Component({
  selector: 'app-member',
  templateUrl: './member.component.html',
  styleUrls: ['./member.component.css'],
  providers: [memberService]
})
export class memberComponent implements OnInit {

  myForm: FormGroup;

  private allParticipants;
  private participant;
  private currentId;
  private errorMessage;

  memberId = new FormControl('', Validators.required);
  firstName = new FormControl('', Validators.required);
  lastName = new FormControl('', Validators.required);
  voted = new FormControl('', Validators.required);
  isDirector = new FormControl('', Validators.required);
  participatedInWhichElections = new FormControl('', Validators.required);
  votedToWhomInPastElections = new FormControl('', Validators.required);


  constructor(public servicemember: memberService, fb: FormBuilder) {
    this.myForm = fb.group({
      memberId: this.memberId,
      firstName: this.firstName,
      lastName: this.lastName,
      voted: this.voted,
      isDirector: this.isDirector,
      participatedInWhichElections: this.participatedInWhichElections,
      votedToWhomInPastElections: this.votedToWhomInPastElections
    });
  };

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): Promise<any> {
    const tempList = [];
    return this.servicemember.getAll()
    .toPromise()
    .then((result) => {
      this.errorMessage = null;
      result.forEach(participant => {
        tempList.push(participant);
      });
      this.allParticipants = tempList;
    })
    .catch((error) => {
      if (error === 'Server error') {
        this.errorMessage = 'Could not connect to REST server. Please check your configuration details';
      } else if (error === '404 - Not Found') {
        this.errorMessage = '404 - Could not find API route. Please check your available APIs.';
        this.errorMessage = error;
      }
    });
  }

	/**
   * Event handler for changing the checked state of a checkbox (handles array enumeration values)
   * @param {String} name - the name of the participant field to update
   * @param {any} value - the enumeration value for which to toggle the checked state
   */
  changeArrayValue(name: string, value: any): void {
    const index = this[name].value.indexOf(value);
    if (index === -1) {
      this[name].value.push(value);
    } else {
      this[name].value.splice(index, 1);
    }
  }

	/**
	 * Checkbox helper, determining whether an enumeration value should be selected or not (for array enumeration values
   * only). This is used for checkboxes in the participant updateDialog.
   * @param {String} name - the name of the participant field to check
   * @param {any} value - the enumeration value to check for
   * @return {Boolean} whether the specified participant field contains the provided value
   */
  hasArrayValue(name: string, value: any): boolean {
    return this[name].value.indexOf(value) !== -1;
  }

  addParticipant(form: any): Promise<any> {
    this.participant = {
      $class: 'org.blockchain.evoting.member',
      'memberId': this.memberId.value,
      'firstName': this.firstName.value,
      'lastName': this.lastName.value,
      'voted': this.voted.value,
      'isDirector': this.isDirector.value,
      'participatedInWhichElections': this.participatedInWhichElections.value,
      'votedToWhomInPastElections': this.votedToWhomInPastElections.value
    };

    this.myForm.setValue({
      'memberId': null,
      'firstName': null,
      'lastName': null,
      'voted': null,
      'isDirector': null,
      'participatedInWhichElections': null,
      'votedToWhomInPastElections': null
    });

    return this.servicemember.addParticipant(this.participant)
    .toPromise()
    .then(() => {
      this.errorMessage = null;
      this.myForm.setValue({
        'memberId': null,
        'firstName': null,
        'lastName': null,
        'voted': null,
        'isDirector': null,
        'participatedInWhichElections': null,
        'votedToWhomInPastElections': null
      });
      this.loadAll(); 
    })
    .catch((error) => {
      if (error === 'Server error') {
        this.errorMessage = 'Could not connect to REST server. Please check your configuration details';
      } else {
        this.errorMessage = error;
      }
    });
  }


   updateParticipant(form: any): Promise<any> {
    this.participant = {
      $class: 'org.blockchain.evoting.member',
      'firstName': this.firstName.value,
      'lastName': this.lastName.value,
      'voted': this.voted.value,
      'isDirector': this.isDirector.value,
      'participatedInWhichElections': this.participatedInWhichElections.value,
      'votedToWhomInPastElections': this.votedToWhomInPastElections.value
    };

    return this.servicemember.updateParticipant(form.get('memberId').value, this.participant)
    .toPromise()
    .then(() => {
      this.errorMessage = null;
      this.loadAll();
    })
    .catch((error) => {
      if (error === 'Server error') {
        this.errorMessage = 'Could not connect to REST server. Please check your configuration details';
      } else if (error === '404 - Not Found') {
        this.errorMessage = '404 - Could not find API route. Please check your available APIs.';
      } else {
        this.errorMessage = error;
      }
    });
  }


  deleteParticipant(): Promise<any> {

    return this.servicemember.deleteParticipant(this.currentId)
    .toPromise()
    .then(() => {
      this.errorMessage = null;
      this.loadAll();
    })
    .catch((error) => {
      if (error === 'Server error') {
        this.errorMessage = 'Could not connect to REST server. Please check your configuration details';
      } else if (error === '404 - Not Found') {
        this.errorMessage = '404 - Could not find API route. Please check your available APIs.';
      } else {
        this.errorMessage = error;
      }
    });
  }

  setId(id: any): void {
    this.currentId = id;
  }

  getForm(id: any): Promise<any> {

    return this.servicemember.getparticipant(id)
    .toPromise()
    .then((result) => {
      this.errorMessage = null;
      const formObject = {
        'memberId': null,
        'firstName': null,
        'lastName': null,
        'voted': null,
        'isDirector': null,
        'participatedInWhichElections': null,
        'votedToWhomInPastElections': null
      };

      if (result.memberId) {
        formObject.memberId = result.memberId;
      } else {
        formObject.memberId = null;
      }

      if (result.firstName) {
        formObject.firstName = result.firstName;
      } else {
        formObject.firstName = null;
      }

      if (result.lastName) {
        formObject.lastName = result.lastName;
      } else {
        formObject.lastName = null;
      }

      if (result.voted) {
        formObject.voted = result.voted;
      } else {
        formObject.voted = null;
      }

      if (result.isDirector) {
        formObject.isDirector = result.isDirector;
      } else {
        formObject.isDirector = null;
      }

      if (result.participatedInWhichElections) {
        formObject.participatedInWhichElections = result.participatedInWhichElections;
      } else {
        formObject.participatedInWhichElections = null;
      }

      if (result.votedToWhomInPastElections) {
        formObject.votedToWhomInPastElections = result.votedToWhomInPastElections;
      } else {
        formObject.votedToWhomInPastElections = null;
      }

      this.myForm.setValue(formObject);
    })
    .catch((error) => {
      if (error === 'Server error') {
        this.errorMessage = 'Could not connect to REST server. Please check your configuration details';
      } else if (error === '404 - Not Found') {
        this.errorMessage = '404 - Could not find API route. Please check your available APIs.';
      } else {
        this.errorMessage = error;
      }
    });

  }

  resetForm(): void {
    this.myForm.setValue({
      'memberId': null,
      'firstName': null,
      'lastName': null,
      'voted': null,
      'isDirector': null,
      'participatedInWhichElections': null,
      'votedToWhomInPastElections': null
    });
  }
}
