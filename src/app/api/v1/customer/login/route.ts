import { NextRequest, NextResponse } from 'next/server';
import { asyncHandler } from '@/lib/asyncHandler';
import { connectToDB } from '@/config/mongo';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Customer } from '@/models/Customer';
import { loginCustomerSchema } from '@/lib/validations/customer.schema';
import { sendResponse } from '@/lib/sendResponse';
import { cookies } from 'next/headers';

export const POST = asyncHandler(async (req: NextRequest) => {
    const body = await req.json();

    // ✅ Joi validation
    const { error, value } = loginCustomerSchema.validate(body, { abortEarly: false });

    if (error) {
        const errorMessages = error.details.reduce((acc, curr) => {
            acc[curr.path[0] as string] = curr.message;
            return acc;
        }, {} as Record<string, string>);

        return sendResponse({
            success: false,
            statusCode: 400,
            message: 'Validation failed',
            data: errorMessages,
        });
    }

    const { mobile, password } = value;

    await connectToDB();

    // ⛔ Must include password field manually due to select: false
    const user = await Customer.findOne({ mobile }).select('+password');
    // console.log('>>>>>>>>',user);



    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
        return sendResponse({
            success: false,
            statusCode: 401,
            message: 'Invalid credentials',
        });
    }

    // ✅ JWT creation
    const token = generateToken({
        id: user._id.toString(),
        mobile: user.mobile,
        name: user.name,
    });

    // ✅ Permissions (can later be fetched from DB if needed)

    const response = NextResponse.json({
        success: true,
        message: 'Login successful',
        token,
        data: {
            mobile: user.mobile,
            name: user.name,
        },
    });

    response.cookies.set('customer_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return response;
});


export const GET = asyncHandler(async () => {
    const token = (await cookies()).get('customer_token')?.value;

    if (!token) {
        return sendResponse({
            success: false,
            statusCode: 401,
            message: 'Unauthorized. No admin token found.',
        });
    }

    let decodedToken: { id: string; mobile: string; name: string };

    try {
        decodedToken = jwt.verify(token, process.env.JWT_SECRET!) as typeof decodedToken;
    } catch (error) {
        return sendResponse({
            success: false,
            statusCode: 401,
            message: 'Invalid or expired token',
        });
    }

    await connectToDB();

    const user = await Customer.findById(decodedToken.id).select('name mobile isActive');

    if (!user || user.isActive !== true) {
        return sendResponse({
            success: false,
            statusCode: 403,
            message: 'Customer not found or unauthorized.',
        });
    }


    return sendResponse({
        message: 'Customer info fetched successfully',
        token,
        data: {
            mobile: user.mobile,
            name: user.name,
        },
    });
});

// 🔐 Generate JWT
const generateToken = (payload: object) => {
    return jwt.sign(payload, process.env.JWT_SECRET!, {
        expiresIn: '1d',
    });
};


