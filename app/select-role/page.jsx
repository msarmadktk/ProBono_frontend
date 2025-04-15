"use client";
import { useState } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export default function SelectRole() {
  const { user, isSignedIn, isLoaded } = useUser();
  const { clerk } = useClerk();
  const [selectedRole, setSelectedRole] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

  // Handle role selection
  const handleRoleChange = (value) => {
    setSelectedRole(value);
  };

  // Function to update Clerk metadata
  const updateClerkMetadata = async (role) => {
    try {
      await user.update({
        unsafeMetadata: { role },
      });
      console.log("Clerk metadata updated successfully");
    } catch (error) {
      console.error("Failed to update Clerk metadata:", error);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!selectedRole) {
      alert("Please select a role");
      return;
    }

    setIsLoading(true);

    try {
      // Call backend signup API
      const response = await fetch(`${baseUrl}/api/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user.primaryEmailAddress?.emailAddress,
          password: "clerk-managed",
          user_type: selectedRole,
        }),
      });

      if (response.status === 201) {
        const responseData = await response.json();
        console.log("User registered successfully:", responseData);

        // Update Clerk metadata
        await updateClerkMetadata(selectedRole);

        // Redirect based on role
        switch (selectedRole) {
          case "client":
            router.push("/post-job");
            break;
          case "freelancer":
            router.push("/profile");
            break;
          case "admin":
            router.push("/admin-pannel");
            break;
          default:
            alert("Invalid role selected.");
        }
      } else {
        const errorData = await response.json();
        console.error("Signup failed:", errorData);
        alert(`Failed to register user: ${errorData.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error during signup:", error);
      alert(`An error occurred: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoaded) return <div>Loading...</div>;
  if (!isSignedIn) return <div>Please sign in first</div>;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-sm bg-white border border-gray-200 rounded-lg shadow-lg p-6">
        <h1 className="text-xl font-semibold text-gray-900 text-center mb-4">
          Select Your Role
        </h1>

        <Select value={selectedRole} onValueChange={handleRoleChange}>
          <SelectTrigger className="w-full border border-gray-300 rounded-md p-2 shadow-sm focus:ring-2 focus:ring-gray-500">
            <SelectValue placeholder="Select Role" />
          </SelectTrigger>
          <SelectContent className="border border-gray-300 rounded-md shadow-md bg-white">
            <SelectItem value="client">Client</SelectItem>
            <SelectItem value="freelancer">Freelancer</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>

        <Button
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full mt-3 cursor-pointer hover:!bg-black hover:!text-white transition-all disabled:opacity-100"
        >
          {isLoading ? "Submitting..." : "Submit"}
        </Button>
      </div>
    </div>
  );
}
