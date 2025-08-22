export const asyncHandler = (fn: any) => async (req: any, ...args: any[]) => {
  try {
    return await fn(req, ...args);
  } catch (err) {
    console.error(err);
    return Response.json({ success: false, message: err.message || 'Internal Error' }, { status: 500 });
  }
};
