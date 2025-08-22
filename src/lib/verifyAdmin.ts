import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { sendResponse } from './sendResponse';
import { cookies } from 'next/headers';

// Define a safe function type for the handler
type Handler = (req: NextRequest, ...args: any[]) => Promise<NextResponse>;

export const verifyAdmin = (handler: Handler): Handler => {
  return async (req: NextRequest, ...args: any[]): Promise<NextResponse> => {
    const token = (await cookies()).get('admin_token')?.value;

    if (!token) {
      return sendResponse({
        success: false,
        message: 'Unauthorized: Token not found in cookies',
        statusCode: 401,
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        id: string;
        email: string;
        role: string;
      };

      if (!decoded || decoded.role !== 'admin') {
        return sendResponse({
          success: false,
          message: 'Unauthorized: Admin access only',
          statusCode: 403,
        });
      }

      // Attach user to request (cast to allow dynamic property)
      (req as any).user = decoded;

      return handler(req, ...args);
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        return sendResponse({
          success: false,
          message: 'Unauthorized: Token expired',
          statusCode: 401,
        });
      }

      if (err instanceof jwt.JsonWebTokenError) {
        return sendResponse({
          success: false,
          message: 'Unauthorized: Invalid token',
          statusCode: 401,
        });
      }

      throw err;
    }
  };
};
