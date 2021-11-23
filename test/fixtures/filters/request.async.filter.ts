import { IFilterPermission } from '../../../src';
import { Injectable } from '@nestjs/common';

function getRawHeader(name: string, rawHeaders: string[]): string | boolean {
  const key = rawHeaders.indexOf(name);
  if (key < 0) {
    return false;
  }
  const value = key + 1;
  return rawHeaders[value];
}

@Injectable()
export class RequestAsyncFilter implements IFilterPermission {

  async canAsync(params?: any[]): Promise<boolean> {
    const name = 'test-header';
    // Fix: missing `headers`, using `rawHeaders` for fixing tests on Node.js 15
    const header = params[0]?.headers?.[name] ?? getRawHeader(name, params[0].rawHeaders);
    return Promise.resolve(header === 'test');
  }
}
