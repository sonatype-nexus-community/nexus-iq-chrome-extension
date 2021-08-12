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
import {ILogger} from '@sonatype/js-sona-types';

export const DEBUG = 'debug';
export const ERROR = 'error';
export const TRACE = 'trace';
export const INFO = 'info';
export const LOG = 'log';
export const WARN = 'warn';

export class BrowserExtensionLogger implements ILogger {
  logMessage(message: string, level: string, ...meta: any): void {
    switch (level) {
      case DEBUG:
        console.debug(message, ...meta);
        break;
      case ERROR:
        console.error(message, ...meta);
        break;
      case TRACE:
        console.trace(message, ...meta);
        break;
      case INFO:
        console.info(message, ...meta);
        break;
      case LOG:
        console.log(message, ...meta);
        break;
      case WARN:
        console.warn(message, ...meta);
        break;
      default:
        console.error('Unsupported log level', level);
        console.error('Logging as error', message, ...meta);
        break;
    }
  }
}

export default BrowserExtensionLogger;
