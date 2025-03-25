"use client"

import { Button } from "@/components/ui/button";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@clerk/nextjs";
import { useState } from "react";

export default function ForceCreateUserButton() {
  const { isSignedIn } = useAuth();
  const createOrFindUser = useMutation(api.auth.createOrFindUser);
  const [status, setStatus] = useState("");
  
  const handleClick = async () => {
    if (!isSignedIn) {
      setStatus("Please sign in first");
      return;
    }
    
    setStatus("Creating user...");
    try {
      const result = await createOrFindUser();
      setStatus("User created successfully!");
      console.log("User creation result:", result);
    } catch (err) {
      setStatus("Error creating user");
      console.error("Failed to create user:", err);
    }
  };
  
  return (
    <div>
      <Button onClick={handleClick} disabled={!isSignedIn}>
        Force Create User
      </Button>
      {status && <p className="mt-2">{status}</p>}
    </div>
  );
}