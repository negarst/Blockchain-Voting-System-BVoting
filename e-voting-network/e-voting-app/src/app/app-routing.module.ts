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

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './home/home.component';

import { electionAssetComponent } from './electionAsset/electionAsset.component';
import { voteAssetComponent } from './voteAsset/voteAsset.component';

import { memberComponent } from './member/member.component';

import { callForElectionComponent } from './callForElection/callForElection.component';
import { voteTransactionComponent } from './voteTransaction/voteTransaction.component';
import { getElectionComponent } from './getElection/getElection.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'electionAsset', component: electionAssetComponent },
  { path: 'voteAsset', component: voteAssetComponent },
  { path: 'member', component: memberComponent },
  { path: 'callForElection', component: callForElectionComponent },
  { path: 'voteTransaction', component: voteTransactionComponent },
  { path: 'getElection', component: getElectionComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
 imports: [RouterModule.forRoot(routes)],
 exports: [RouterModule],
 providers: []
})
export class AppRoutingModule { }
