import { clerkMiddleware, createRouteMatcher, redirectToSignIn } from '@clerk/nextjs/server'
import { NextResponse } from "next/server";


export default clerkMiddleware({
    publicRoutes: ["/"],
    afterAuth(auth, req) {
      if (auth.userId && auth.isPublicRoute) {
        let path = "/select-org";
        if (auth.orgId) {
          path = `/organization/${auth.orgId}`;
        }
        const orgSelectionUrl = new URL(path, req.url);
  
        return NextResponse.redirect(orgSelectionUrl);
      }
      if (!auth.userId && !auth.isPublicRoute) {
        return redirectToSignIn({ returnBackUrl: req.url });
      }
  
      if (auth.userId && !auth.orgId && req.nextUrl.pathname !== "/select-org") {
        const orgSelectionUrl = new URL("/select-org", req.url);
        return NextResponse.redirect(orgSelectionUrl);
      }
    }
});

export const config = {
    matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
}
