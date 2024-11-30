import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher(["/organization(.*)", "/select-org(.*)", "/board(.*)", "/activity(.*)"]);

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const { userId, orgId, redirectToSignIn } = await auth();
  console.log("Incoming request URL:", req.url);
  console.log("User ID:", userId);
  console.log("Org ID:", orgId);

  // Protect private routes
  if (!userId && isProtectedRoute(req)) {
    console.log("Private route without user ID. Redirecting to sign-in.");
    //return auth().redirectToSignIn({ returnBackUrl: req.url });
    return redirectToSignIn({ returnBackUrl: req.url });
  }

  // Redirect authenticated users to select-org if they have no orgId and they are not already on select-org route
  if (userId && !orgId && req.nextUrl.pathname !== "/select-org") {
    const orgSelection = new URL("/select-org", req.url);
    console.log("User ID present, but no org ID. Redirecting to org selection.");
    return NextResponse.redirect(orgSelection);
  }

  // Redirect authenticated users with orgId to organization route
  if (userId && orgId && !isProtectedRoute(req)) {
    const organizationUrl = new URL(`/organization/${orgId}`, req.url);
    console.log("Authenticated user with org ID. Redirecting to organization route:", organizationUrl);
    return NextResponse.redirect(organizationUrl);
  }

  // Allow authenticated users to access public routes without redirection
  if (!isProtectedRoute(req) && userId) {
    console.log("Authenticated user accessing public route. Allowing access.");
    return NextResponse.next();
  }

  console.log("Request passed through middleware without redirection.");
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
