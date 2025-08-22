export class ApiError extends Error {
  statusCode: number;
  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const handleMongooseError = (err: any) => {
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val: any) => val.message).join(', ');
    return new ApiError(400, message);
  }
  return new ApiError(500, 'Database Error');
};
