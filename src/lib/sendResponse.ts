import { NextResponse } from 'next/server';

type ResponseOptions<T> = {
  message: string;
  data?: T;
  token?: string;
  success?: boolean;
  statusCode?: number;
};

type ResponseBody<T> = {
  success: boolean;
  message: string;
  data?: T;
  token?: string;
};

export const sendResponse = <T>(options: ResponseOptions<T>) => {
  const {
    success = true,
    statusCode = 200,
    message,
    data,
    token,
  } = options;

  const responseBody: ResponseBody<T> = {
    success,
    message,
  };

  if (data !== undefined) responseBody.data = data;
  if (token) responseBody.token = token;

  return NextResponse.json(responseBody, { status: statusCode });
};
