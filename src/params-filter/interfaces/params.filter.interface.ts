export interface IParamsFilter {
  setParams(filter: string, ...params: any[]): IParamsFilter;

  getParams(filter: string): any;
}
