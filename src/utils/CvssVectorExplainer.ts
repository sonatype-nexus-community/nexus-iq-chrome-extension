/*
 * Copyright (c) 2019-present Sonatype, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const ATTACK_VECTOR = 'Attack Vector';
const ATTACK_COMPLEXITY = 'Attack Complexity';
const PRIVILEGES_REQUIRED = 'Privileges Required';
const USER_INTERACTION = 'User Interaction';
const SCOPE = 'Scope';
const CONFIDENTIALITY_IMPACT = 'Confidentiality Impact';
const INTEGRITY_IMPACT = 'Integrity Impact';
const AVAILABILITY_IMPACT = 'Availability Impact';

const CvssVectorExplainer = (vectors: string[]): Map<string, string> => {
  const result = new Map<string, string>();

  vectors.forEach((vector) => {
    switch (vector) {
      case 'AV:N':
        result.set(ATTACK_VECTOR, `Network (${vector})`);
        break;
      case 'AV:A':
        result.set(ATTACK_VECTOR, `Adjacent Network (${vector})`);
        break;
      case 'AV:L':
        result.set(ATTACK_VECTOR, `Local (${vector})`);
        break;
      case 'AV:P':
        // Hell yeah Alien Vs Predator
        result.set(ATTACK_VECTOR, `Physical (${vector})`);
        break;
      case 'AC:L':
        result.set(ATTACK_COMPLEXITY, `Low (${vector})`);
        break;
      case 'AC:H':
        result.set(ATTACK_COMPLEXITY, `High (${vector})`);
        break;
      case 'PR:N':
        result.set(PRIVILEGES_REQUIRED, `None (${vector})`);
        break;
      case 'PR:L':
        result.set(PRIVILEGES_REQUIRED, `Low (${vector})`);
        break;
      case 'PR:H':
        result.set(PRIVILEGES_REQUIRED, `High (${vector})`);
        break;
      case 'UI:N':
        result.set(USER_INTERACTION, `None (${vector})`);
        break;
      case 'UI:R':
        result.set(USER_INTERACTION, `Required (${vector})`);
        break;
      case 'S:U':
        result.set(SCOPE, `Unchanged (${vector})`);
        break;
      case 'S:C':
        result.set(SCOPE, `Changed (${vector})`);
        break;
      case 'C:N':
        result.set(CONFIDENTIALITY_IMPACT, `None (${vector})`);
        break;
      case 'C:L':
        result.set(CONFIDENTIALITY_IMPACT, `Low (${vector})`);
        break;
      case 'C:H':
        result.set(CONFIDENTIALITY_IMPACT, `High (${vector})`);
        break;
      case 'I:N':
        result.set(INTEGRITY_IMPACT, `None (${vector})`);
        break;
      case 'I:L':
        result.set(INTEGRITY_IMPACT, `Low (${vector})`);
        break;
      case 'I:H':
        result.set(INTEGRITY_IMPACT, `High (${vector})`);
        break;
      case 'A:N':
        result.set(AVAILABILITY_IMPACT, `None (${vector})`);
        break;
      case 'A:L':
        result.set(AVAILABILITY_IMPACT, `Low (${vector})`);
        break;
      case 'A:H':
        result.set(AVAILABILITY_IMPACT, `High (${vector})`);
        break;
      default:
        // Do nothing
        break;
    }
  });

  return result;
};

export {CvssVectorExplainer};
