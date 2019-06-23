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
import { voteAssetService } from './voteAsset.service';
import 'rxjs/add/operator/toPromise';

@Component({
  selector: 'app-voteasset',
  templateUrl: './voteAsset.component.html',
  styleUrls: ['./voteAsset.component.css'],
  providers: [voteAssetService]
})
export class voteAssetComponent implements OnInit {

  myForm: FormGroup;

  private allAssets;
  private asset;
  private currentId;
  private errorMessage;

  voteAssetId = new FormControl('', Validators.required);
  memberId = new FormControl('', Validators.required);
  electionAssetId = new FormControl('', Validators.required);
  selectedCandidateName = new FormControl('', Validators.required);
  votingTimestamp = new FormControl('', Validators.required);

  constructor(public servicevoteAsset: voteAssetService, fb: FormBuilder) {
    this.myForm = fb.group({
      voteAssetId: this.voteAssetId,
      memberId: this.memberId,
      electionAssetId: this.electionAssetId,
      selectedCandidateName: this.selectedCandidateName,
      votingTimestamp: this.votingTimestamp
    });
  };

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): Promise<any> {
    const tempList = [];
    return this.servicevoteAsset.getAll()
    .toPromise()
    .then((result) => {
      this.errorMessage = null;
      result.forEach(asset => {
        tempList.push(asset);
      });
      this.allAssets = tempList;
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

	/**
   * Event handler for changing the checked state of a checkbox (handles array enumeration values)
   * @param {String} name - the name of the asset field to update
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
   * only). This is used for checkboxes in the asset updateDialog.
   * @param {String} name - the name of the asset field to check
   * @param {any} value - the enumeration value to check for
   * @return {Boolean} whether the specified asset field contains the provided value
   */
  hasArrayValue(name: string, value: any): boolean {
    return this[name].value.indexOf(value) !== -1;
  }

  addAsset(form: any): Promise<any> {
    this.asset = {
      $class: 'org.blockchain.evoting.voteAsset',
      'voteAssetId': this.voteAssetId.value,
      'memberId': this.memberId.value,
      'electionAssetId': this.electionAssetId.value,
      'selectedCandidateName': this.selectedCandidateName.value,
      'votingTimestamp': this.votingTimestamp.value
    };

    this.myForm.setValue({
      'voteAssetId': null,
      'memberId': null,
      'electionAssetId': null,
      'selectedCandidateName': null,
      'votingTimestamp': null
    });

    return this.servicevoteAsset.addAsset(this.asset)
    .toPromise()
    .then(() => {
      this.errorMessage = null;
      this.myForm.setValue({
        'voteAssetId': null,
        'memberId': null,
        'electionAssetId': null,
        'selectedCandidateName': null,
        'votingTimestamp': null
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


  updateAsset(form: any): Promise<any> {
    this.asset = {
      $class: 'org.blockchain.evoting.voteAsset',
      'memberId': this.memberId.value,
      'electionAssetId': this.electionAssetId.value,
      'selectedCandidateName': this.selectedCandidateName.value,
      'votingTimestamp': this.votingTimestamp.value
    };

    return this.servicevoteAsset.updateAsset(form.get('voteAssetId').value, this.asset)
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


  deleteAsset(): Promise<any> {

    return this.servicevoteAsset.deleteAsset(this.currentId)
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

    return this.servicevoteAsset.getAsset(id)
    .toPromise()
    .then((result) => {
      this.errorMessage = null;
      const formObject = {
        'voteAssetId': null,
        'memberId': null,
        'electionAssetId': null,
        'selectedCandidateName': null,
        'votingTimestamp': null
      };

      if (result.voteAssetId) {
        formObject.voteAssetId = result.voteAssetId;
      } else {
        formObject.voteAssetId = null;
      }

      if (result.memberId) {
        formObject.memberId = result.memberId;
      } else {
        formObject.memberId = null;
      }

      if (result.electionAssetId) {
        formObject.electionAssetId = result.electionAssetId;
      } else {
        formObject.electionAssetId = null;
      }

      if (result.selectedCandidateName) {
        formObject.selectedCandidateName = result.selectedCandidateName;
      } else {
        formObject.selectedCandidateName = null;
      }

      if (result.votingTimestamp) {
        formObject.votingTimestamp = result.votingTimestamp;
      } else {
        formObject.votingTimestamp = null;
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
      'voteAssetId': null,
      'memberId': null,
      'electionAssetId': null,
      'selectedCandidateName': null,
      'votingTimestamp': null
      });
  }

}
