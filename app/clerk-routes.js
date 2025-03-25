// This configures routes for Clerk's components

const publicPages = ["/", "/login", "/register", "/(.*)/privacy", "/(.*)/terms"];

// Routes that should redirect to registration-success
const registrationPages = ["/verification"];

// Admin email for redirects
const ADMIN_EMAIL = "ktmtitans@gmail.com";

const clerkRedirects = {
  signInUrl: "/login",
  signUpUrl: "/register",
  afterSignInUrl: (user) => {
    // Check if user is admin by email
    if (user?.emailAddresses?.[0]?.emailAddress === ADMIN_EMAIL) {
      return "/admin";
    }
    return "/dashboard";
  },
  afterSignUpUrl: "/registration-success",
};

export { publicPages, registrationPages, clerkRedirects, ADMIN_EMAIL };