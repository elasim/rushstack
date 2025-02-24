﻿// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.

import type { StdioSummarizer } from '@rushstack/terminal';
import type { CollatedWriter } from '@rushstack/stream-collator';

import type { OperationStatus } from './OperationStatus';
import type { OperationStateFile } from './OperationStateFile';
import type { IStopwatchResult } from '../../utilities/Stopwatch';

/**
 * Information passed to the executing `IOperationRunner`
 *
 * @beta
 */
export interface IOperationRunnerContext {
  /**
   * The writer into which this `IOperationRunner` should write its logs.
   */
  collatedWriter: CollatedWriter;
  /**
   * If Rush was invoked with `--debug`
   */
  debugMode: boolean;
  /**
   * Defaults to `true`. Will be `false` if Rush was invoked with `--verbose`.
   */
  quietMode: boolean;
  /**
   * Object used to report a summary at the end of the Rush invocation.
   */
  stdioSummarizer: StdioSummarizer;
  /**
   * Object used to record state of the operation.
   *
   * @internal
   */
  _operationStateFile?: OperationStateFile;
  /**
   * Object used to track elapsed time.
   */
  stopwatch: IStopwatchResult;
}

/**
 * The `Operation` class is a node in the dependency graph of work that needs to be scheduled by the
 * `OperationExecutionManager`. Each `Operation` has a `runner` member of type `IOperationRunner`, whose
 * implementation manages the actual process for running a single operation.
 *
 * @beta
 */
export interface IOperationRunner {
  /**
   * Name of the operation, for logging.
   */
  readonly name: string;

  /**
   * This flag determines if the operation is allowed to be skipped if up to date.
   */
  isSkipAllowed: boolean;

  /**
   * Indicates that this runner's duration has meaning.
   */
  reportTiming: boolean;

  /**
   * Indicates that this runner is architectural and should not be reported on.
   */
  silent: boolean;

  /**
   * If set to true, a warning result should not make Rush exit with a nonzero
   * exit code
   */
  warningsAreAllowed: boolean;

  /**
   * Indicates if the output of this operation may be written to the cache
   */
  isCacheWriteAllowed: boolean;

  /**
   * Method to be executed for the operation.
   */
  executeAsync(context: IOperationRunnerContext): Promise<OperationStatus>;
}
