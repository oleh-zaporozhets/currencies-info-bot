import axios, { AxiosInstance, AxiosResponse } from 'axios';

export default abstract class {
  protected readonly instance: AxiosInstance;

  public constructor(baseURL: string) {
    this.instance = axios.create({ baseURL });

    this.initializeResponseInterceptor();
  }

  private initializeResponseInterceptor = () => {
    this.instance.interceptors.response.use(
      ({ data }: AxiosResponse) => data,
      (error) => Promise.reject(error),
    );
  };
}
