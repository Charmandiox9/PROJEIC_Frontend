import { toast } from "sonner";

interface GraphQLRequest {
  query: string;
  variables?: Record<string, any>;
  silent?: boolean;
}

export async function fetchGraphQL({
  query,
  variables = {},
  silent = false,
}: GraphQLRequest) {
  let token = "";
  if (typeof window !== "undefined") {
    token = localStorage.getItem("projeic_accessToken") || "";
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const getBackendUrl = () => {
      if (typeof window === "undefined") return "";

      if (process.env.NEXT_PUBLIC_BACKEND_URL) {
        return process.env.NEXT_PUBLIC_BACKEND_URL;
      }

      if (window.location.hostname.includes("development.up.railway.app")) {
        return "https://projeicbackend-development.up.railway.app";
      }

      if (window.location.hostname.includes("production.up.railway.app")) {
        return "https://projeicbackend-production.up.railway.app";
      }

      return "http://localhost:4000";
    };

    const backendUrl = getBackendUrl();
    const response = await fetch(`${backendUrl}/projeic/api/graphql`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    const result = await response.json();

    if (result.errors) {
      const errorMessage = result.errors[0].message;

      if (typeof window !== "undefined" && !silent) {
        toast.error(errorMessage);
      }
      throw new Error(errorMessage);
    }

    return result.data;
  } catch (error: any) {
    if (
      typeof window !== "undefined" &&
      !silent &&
      error.message === "Failed to fetch"
    ) {
      toast.error("Error de conexión con el servidor.");
    }

    console.error("Error en fetchGraphQL:", error);
    throw error;
  }
}
