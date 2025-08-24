import { NextRequest, NextResponse } from 'next/server';
import { asyncHandler } from '@/lib/asyncHandler';
import { connectToDB } from '@/config/mongo';
import { Customer } from '@/models/Customer';
import { createCustomerSchema } from '@/lib/validations/customer.schema';
import bcrypt from 'bcryptjs';


type CreateCustomerBody = {
    name: string;
    password: string;
    mobile: string;
    pin: string;
    isActive?: boolean;

};

export const POST = asyncHandler(async (req: NextRequest) => {
    await connectToDB();

    // ✅ Parse JSON body
    const rawBody = await req.json();
    console.log("Received body:", rawBody);



    // ✅ Validate input with Joi schema
    const { error, value } = createCustomerSchema.validate(rawBody, { abortEarly: false });
    if (error) {
        const formattedErrors = error.details.reduce((acc, curr) => {
            acc[curr.path[0] as string] = curr.message;
            return acc;
        }, {} as Record<string, string>);

        return NextResponse.json(
            {
                success: false,
                message: 'Validation failed',
                errors: formattedErrors,
                data: null,
            },
            { status: 400 }
        );
    }


    const rawPassword = rawBody.password || generateSecurePassword();
    const hashedPassword = await bcrypt.hash(rawPassword, 10);
    value.password = hashedPassword;

    const customerData: CreateCustomerBody = {
        ...value,
        isActive: rawBody.isActive ?? true,
    };

    // ✅ Insert into DB
    const createdCustomer = new Customer(customerData);
    await createdCustomer.save();

    return NextResponse.json({
        success: true,
        message: 'Customer registered successfully',

    });
})

function generateSecurePassword(length = 12) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const specialChars = '!@#$%^&*';
    const password = Array.from({ length: length - 2 }, () =>
        chars[Math.floor(Math.random() * chars.length)]).join('');
    return password +
        specialChars[Math.floor(Math.random() * specialChars.length)] +
        chars[Math.floor(Math.random() * chars.length)];
}