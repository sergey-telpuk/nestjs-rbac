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

type RequestLike = {
  headers?: Record<string, string>;
  rawHeaders?: string[];
};

@Injectable()
export class RequestFilter implements IFilterPermission {

  can(params?: unknown[]): boolean {
    const name = 'test-header';
    // Fix: missing `headers`, using `rawHeaders` for fixing tests on Node.js 15
    const request = params?.[0] as RequestLike | undefined;
    const header = request?.headers?.[name] ?? getRawHeader(name, request?.rawHeaders ?? []);
    return header === 'test';
  }

}
