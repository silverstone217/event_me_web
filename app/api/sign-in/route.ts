import { prisma } from "@/lib/prisma";
import { userSignInSchema } from "@/schema/user";
import { compare } from "bcrypt";
import { sign } from "jsonwebtoken";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function POST(request: Request) {
  const body = await request.json();

  try {
    const { email, password } = userSignInSchema.parse(body);

    const isUserExist = await prisma.user.findUnique({
      where: {
        email: email.trim(),
      },
    });

    if (!isUserExist) {
      return NextResponse.json({
        error: true,
        message: "User with this email not found",
        data: null,
      });
    }

    if (!isUserExist.password) {
      return NextResponse.json({
        error: true,
        message: "Password not provided, please try other strategies",
        data: null,
      });
    }

    const isPasswordValid = await compare(
      password.trim(),
      isUserExist.password
    );

    if (!isPasswordValid) {
      return NextResponse.json({
        error: true,
        message: "Invalid password",
        data: null,
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: pass, ...rest } = isUserExist;

    const token = await sign(
      {
        id: isUserExist.id,
        email: isUserExist.email,
        username: isUserExist.username,
      },
      process.env.SECRET_KEY as string
    );

    if (!token) {
      return NextResponse.json({
        error: true,
        message: "Failed to create token",
        data: null,
      });
    }

    return NextResponse.json({
      error: false,
      message: "User signed in successfully! ",
      data: {
        token,
        user: rest,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Gère les erreurs de validation Zod
      const formattedErrors = error.errors.map((err) => ({
        path: err.path.join(" > "), // Chemin de l'erreur dans l'objet de données
        message: err.message, // Message d'erreur
      }));

      console.log({ formattedErrors });

      // Retourner les erreurs de validation Zod
      return NextResponse.json({
        error: true,
        message: "Validation error, please enter valid informations",
        details: formattedErrors,
      });
    }

    const err = error as Error;

    console.log({ err: err.message });

    return NextResponse.json({
      error: true,
      message: err.message,
    });
  }
}
