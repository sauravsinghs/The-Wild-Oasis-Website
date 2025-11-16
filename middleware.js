/*import { NextResponse } from "next/server";

export function middleware(request) {
  console.log(request);

  return NextResponse.redirect(new URL("/about", request.url));
}*/

import { NextResponse } from "next/server";
import { auth } from "@/app/_lib/auth";

const isMockMode = process.env.MOCK_MODE === "true";

export async function middleware(request) {
  if (isMockMode) return NextResponse.next();
  return auth(request);
}

export const config = {
  matcher: ["/account"],
};
