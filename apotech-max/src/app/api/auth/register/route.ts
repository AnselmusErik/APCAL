import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/server/services/authService";
import { registerSchema } from "@/server/utils/validation";
import { handleApiError } from "@/server/utils/errors";
import { ZodError } from "zod";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const input = registerSchema.parse(body);
    const user = await authService.register(input);

    return NextResponse.json(
      { message: "Account created successfully", data: { id: user.id, email: user.email } },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Validation error" },
        { status: 400 }
      );
    }
    const { message, status } = handleApiError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
