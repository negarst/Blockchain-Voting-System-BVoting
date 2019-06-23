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
import { electionAssetService } from './electionAsset.service';
import 'rxjs/add/operator/toPromise';

@Component({
  selector: 'app-electionasset',
  templateUrl: './electionAsset.component.html',
  styleUrls: ['./electionAsset.component.css'],
  providers: [electionAssetService]
})
export class electionAssetComponent implements OnInit {

  myForm: FormGroup;

  private allAssets;
  private asset;
  private currentId;
  private errorMessage;

  electionAssetId = new FormControl('', Validators.required);
  startingTimestamp = new FormControl('', Validators.required);
  endingTimestamp = new FormControl('', Validators.required);
  directorMemberId = new FormControl('', Validators.required);
  candidatesNames = new FormControl('', Validators.required);
  candidatesVotes = new FormControl('', Validators.required);

  constructor(public serviceelectionAsset: electionAssetService, fb: FormBuilder) {
    this.myForm = fb.group({
      electionAssetId: this.electionAssetId,
      startingTimestamp: this.startingTimestamp,
      endingTimestamp: this.endingTimestamp,
      directorMemberId: this.directorMemberId,
      candidatesNames: this.candidatesNames,
      candidatesVotes: this.candidatesVotes
    });
  };

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): Promise<any> {
    const tempList = [];
    return this.serviceelectionAsset.getAll()
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
      $class: 'org.blockchain.evoting.electionAsset',
      'electionAssetId': this.electionAssetId.value,
      'startingTimestamp': this.startingTimestamp.value,
      'endingTimestamp': this.endingTimestamp.value,
      'directorMemberId': this.directorMemberId.value,
      'candidatesNames': this.candidatesNames.value,
      'candidatesVotes': this.candidatesVotes.value
    };

    this.myForm.setValue({
      'electionAssetId': null,
      'startingTimestamp': null,
      'endingTimestamp': null,
      'directorMemberId': null,
      'candidatesNames': null,
      'candidatesVotes': null
    });

    return this.serviceelectionAsset.addAsset(this.asset)
    .toPromise()
    .then(() => {
      this.errorMessage = null;
      this.myForm.setValue({
        'electionAssetId': null,
        'startingTimestamp': null,
        'endingTimestamp': null,
        'directorMemberId': null,
        'candidatesNames': null,
        'candidatesVotes': null
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
      $class: 'org.blockchain.evoting.electionAsset',
      'startingTimestamp': this.startingTimestamp.value,
      'endingTimestamp': this.endingTimestamp.value,
      'directorMemberId': this.directorMemberId.value,
      'candidatesNames': this.candidatesNames.value,
      'candidatesVotes': this.candidatesVotes.value
    };

    return this.serviceelectionAsset.updateAsset(form.get('electionAssetId').value, this.asset)
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

    return this.serviceelectionAsset.deleteAsset(this.currentId)
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

    return this.serviceelectionAsset.getAsset(id)
    .toPromise()
    .then((result) => {
      this.errorMessage = null;
      const formObject = {
        'electionAssetId': null,
        'startingTimestamp': null,
        'endingTimestamp': null,
        'directorMemberId': null,
        'candidatesNames': null,
        'candidatesVotes': null
      };

      if (result.electionAssetId) {
        formObject.electionAssetId = result.electionAssetId;
      } else {
        formObject.electionAssetId = null;
      }

      if (result.startingTimestamp) {
        formObject.startingTimestamp = result.startingTimestamp;
      } else {
        formObject.startingTimestamp = null;
      }

      if (result.endingTimestamp) {
        formObject.endingTimestamp = result.endingTimestamp;
      } else {
        formObject.endingTimestamp = null;
      }

      if (result.directorMemberId) {
        formObject.directorMemberId = result.directorMemberId;
      } else {
        formObject.directorMemberId = null;
      }

      if (result.candidatesNames) {
        formObject.candidatesNames = result.candidatesNames;
      } else {
        formObject.candidatesNames = null;
      }

      if (result.candidatesVotes) {
        formObject.candidatesVotes = result.candidatesVotes;
      } else {
        formObject.candidatesVotes = null;
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
      'electionAssetId': null,
      'startingTimestamp': null,
      'endingTimestamp': null,
      'directorMemberId': null,
      'candidatesNames': null,
      'candidatesVotes': null
      });
  }

}
