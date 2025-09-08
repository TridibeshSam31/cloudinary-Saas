import { clerkMiddleware , createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

//createRouteMatcher is a Clerk helper function that allows you to protect multiple routes. createRouteMatcher() accepts an array of routes and checks if the route the user is trying to visit matches one of the routes passed to it.


const isPublicRoute = createRouteMatcher([
    "/sign-in",
    "/sign-up",
    "/",
    "/home"
])

const isPublicApiRoute = createRouteMatcher([
    "/api/videos"
])


//maine kuch api ko public mai rkha hai aur kuch ko mai user ko tabhi acess dunga jab woh authenticate hoga


export default clerkMiddleware((auth,req)=>{
    const {userId}:any = auth();
    const currentUrl = new URL(req.url)
    //this currenturl has the property of pathname
    const isAccessingDashboard = currentUrl.pathname === "/home"
    const isApiRequest = currentUrl.pathname.startsWith("/api")


    //agar user logged in hai aur public route ko acess krna chahta hai lekin dashboard ko nhi krna chahta then
    //mai usse home pr le aaunga

    if(userId && isPublicRoute(req) && !isAccessingDashboard){
        return NextResponse.redirect(new URL("/home",req.url))
    }
    //not logged in
    if(!userId){
        //agae user logged in nhi hai aur jo humne upar protected routes bnaye hai usko access krna chahta hai toh usko sign-in ke page pr redirect krwa denge
        if(!isPublicRoute(req)&& !isPublicApiRoute(req)){
            return NextResponse.redirect(new URL("/sign-in",req.url))
        }
        //if the request is for a protected API and the User is not logged in
        if(isApiRequest && !isPublicApiRoute(req)){
            return NextResponse.redirect(new URL("/sign-in", req.url))
        }

    }
    return NextResponse.next()
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}