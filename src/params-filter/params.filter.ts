import { IParamsFilter } from './interfaces/params.filter.interface';


export class ParamsFilter implements IParamsFilter {
  private storage: object = {};

  getParams(filter: string): any {
    return this.storage[filter];
  }

  setParams(filter: string, ...params: any[]): IParamsFilter {
    this.storage[filter] = params;
    return this;
  }

}
