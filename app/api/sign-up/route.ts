import { prisma } from "@/lib/prisma";
import { userSignUpSchema } from "@/schema/user";
import { hash } from "bcrypt";
import { NextResponse } from "next/server";
import { z } from "zod";
import { sign } from "jsonwebtoken";

export async function POST(request: Request) {
  const body = await request.json();

  try {
    const { email, password, username } = userSignUpSchema.parse(body);

    const isUserExist = await prisma.user.findUnique({
      where: {
        email: email.trim(),
      },
    });

    if (isUserExist) {
      return NextResponse.json({
        error: true,
        message: "User already exist",
        data: null,
      });
    }

    const isUsernameTaken = await prisma.user.findUnique({
      where: {
        username: username.trim(),
      },
    });

    if (isUsernameTaken) {
      return NextResponse.json({
        error: true,
        message: "Username already taken",
        data: null,
      });
    }

    const hashedPassword = await hash(password.trim(), 10);

    const user = await prisma.user.create({
      data: {
        email: email.trim(),
        password: hashedPassword,
        username: username.trim(),
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: pass, ...rest } = user;

    const token = await sign(
      {
        id: user.id,
        email: user.email,
        username: user.username,
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
      message: "User created successfully",
      data: { user: rest, token },
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
