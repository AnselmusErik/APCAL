import { NextRequest, NextResponse } from "next/server";
import { userRepository } from "@/server/repositories/userRepository";
import { withRoles } from "@/lib/rbac-middleware";
import { handleApiError } from "@/server/utils/errors";
import { paginationSchema } from "@/server/utils/validation";
import { ZodError } from "zod";

async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const input = paginationSchema.parse({
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
    });
    const result = await userRepository.findAll(input.page, input.limit);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message }, { status: 400 });
    }
    const { message, status } = handleApiError(error);
    return NextResponse.json({ error: message }, { status });
  }
}

export const GET_handler = withRoles("ADMIN", "MANAGER")(GET);
export { GET_handler as GET };
