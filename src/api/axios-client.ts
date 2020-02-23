import axios, { AxiosInstance, AxiosResponse } from 'axios';

declare module 'axios' {
  interface AxiosResponse<T = any> extends Promise<T> {}
}

abstract class AxiosClient {
  protected readonly _instance: AxiosInstance;

  public constructor(baseURL: string) {
    this._instance = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this._initializeResponseInterceptor();
  }

  private _initializeResponseInterceptor = () => {
    this._instance.interceptors.response.use(
      ({ data }: AxiosResponse) => data,
      (error) => Promise.reject(error),
    );
  };
}

export default AxiosClient;
