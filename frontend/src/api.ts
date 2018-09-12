import { RequestOptions } from 'http';

class RequestError extends Error {
  public status: number;
  public response: Response;
  constructor(response: Response) {
    super(response.statusText);
    this.status = response.status;
    this.response = response;
  }
}

export const requestApi = apiUrl => async (
  method: 'get' | 'post' | 'put' | 'delete',
  path: string,
  params?: any,
  options: RequestInit = {}
) => {
  options.method = method;
  options.headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (params) {
    options.body = JSON.stringify(params);
  }

  const response = await fetch(`${apiUrl}/${path}`, options);
  if (response.status >= 200 && response.status < 300) {
    const json = await response.json();
    return json;
  }

  if (response.status < 500) {
    throw new RequestError(response);
  }

  throw new Error('Server error');
};
