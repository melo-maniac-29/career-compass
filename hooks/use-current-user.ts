import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@clerk/nextjs";
import { useEffect } from "react";

export function useCurrentUser() {
  const { isSignedIn } = useAuth();
  const createOrFindUser = useMutation(api.auth.createOrFindUser);
  const user = useQuery(api.users.getMyProfile, isSignedIn ? {} : "skip");
  
  // Call createOrFindUser immediately when signed in
  useEffect(() => {
    if (isSignedIn) {
      // Always try to create/find user when signed in
      createOrFindUser()
        .then(result => console.log("User creation result:", result))
        .catch(err => console.error("Failed to create user:", err));
    }
  }, [isSignedIn, createOrFindUser]);
  
  return { 
    user, 
    isLoading: isSignedIn && user === undefined,
  };
}