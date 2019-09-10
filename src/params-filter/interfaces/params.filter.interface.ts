export interface IParamsFilter {
  setParam(filter: string, ...params: any[]): IParamsFilter;

  getParam(filter: string): any;
}
