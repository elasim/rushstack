// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.

import { StringBufferTerminalProvider, Terminal } from '@rushstack/node-core-library';

import { EnvironmentConfiguration } from '../../../../api/EnvironmentConfiguration';
import { AmazonS3BuildCacheProvider } from '../AmazonS3BuildCacheProvider';
import { RushUserConfiguration } from '../../../../api/RushUserConfiguration';
import { CredentialCache } from '../../../CredentialCache';

describe('AmazonS3BuildCacheProvider', () => {
  let buildCacheWriteCredentialEnvValue: string | undefined;

  beforeEach(() => {
    buildCacheWriteCredentialEnvValue = undefined;
    jest
      .spyOn(EnvironmentConfiguration, 'buildCacheWriteCredential', 'get')
      .mockImplementation(() => buildCacheWriteCredentialEnvValue);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("Isn't writable if isCacheWriteAllowed is set to false and there is no env write credential", () => {
    const cacheProvider: AmazonS3BuildCacheProvider = new AmazonS3BuildCacheProvider({
      s3Region: 'region-name',
      s3Bucket: 'bucket-name',
      isCacheWriteAllowed: false
    });

    expect(cacheProvider.isCacheWriteAllowed).toBe(false);
  });

  it('Is writable if isCacheWriteAllowed is set to true and there is no env write credential', () => {
    const cacheProvider: AmazonS3BuildCacheProvider = new AmazonS3BuildCacheProvider({
      s3Region: 'region-name',
      s3Bucket: 'bucket-name',
      isCacheWriteAllowed: true
    });

    expect(cacheProvider.isCacheWriteAllowed).toBe(true);
  });

  it('Is writable if isCacheWriteAllowed is set to false and there is an env write credential', () => {
    buildCacheWriteCredentialEnvValue = 'token';

    const cacheProvider: AmazonS3BuildCacheProvider = new AmazonS3BuildCacheProvider({
      s3Region: 'region-name',
      s3Bucket: 'bucket-name',
      isCacheWriteAllowed: false
    });

    expect(cacheProvider.isCacheWriteAllowed).toBe(true);
  });

  async function testCredentialCache(isCacheWriteAllowed: boolean): Promise<void> {
    const cacheProvider: AmazonS3BuildCacheProvider = new AmazonS3BuildCacheProvider({
      s3Region: 'region-name',
      s3Bucket: 'bucket-name',
      isCacheWriteAllowed
    });

    // Mock the user folder to the current folder so a real .rush-user folder doesn't interfere with the test
    jest.spyOn(RushUserConfiguration, 'getRushUserFolderPath').mockReturnValue(__dirname);
    let setCacheEntryArgs: unknown[] = [];
    const credentialsCacheSetCacheEntrySpy: jest.SpyInstance = jest
      .spyOn(CredentialCache.prototype, 'setCacheEntry')
      .mockImplementation((...args) => {
        setCacheEntryArgs = args;
      });
    const credentialsCacheSaveSpy: jest.SpyInstance = jest
      .spyOn(CredentialCache.prototype, 'saveIfModifiedAsync')
      .mockImplementation(() => Promise.resolve());

    const terminal: Terminal = new Terminal(new StringBufferTerminalProvider());
    await cacheProvider.updateCachedCredentialAsync(terminal, 'credential');

    expect(credentialsCacheSetCacheEntrySpy).toHaveBeenCalledTimes(1);
    expect(setCacheEntryArgs).toMatchSnapshot();
    expect(credentialsCacheSaveSpy).toHaveBeenCalledTimes(1);
  }

  it('Has an expected cached credential name (write not allowed)', async () => {
    await testCredentialCache(false);
  });

  it('Has an expected cached credential name (write allowed)', async () => {
    await testCredentialCache(true);
  });
});
