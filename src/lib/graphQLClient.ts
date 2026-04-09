interface GraphQLRequest {
  query: string;
  variables?: Record<string, any>;
}

export async function fetchGraphQL({ query, variables = {} }: GraphQLRequest) {
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
      if (typeof window === "undefined") return ""; // Lado del servidor

      // Si estás en producción de Railway
      if (
        window.location.hostname.includes(
          "projeicfrontend-production.up.railway.app",
        )
      ) {
        return "https://projeicbackend-production.up.railway.app";
      }

      // Por defecto (Localhost)
      return "http://localhost:4000";
    };

    const backendUrl = getBackendUrl();
    console.log("DEBUG - URL forzada por hostname:", backendUrl);
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
      throw new Error(result.errors[0].message);
    }

    return result.data;
  } catch (error) {
    console.error("Error en fetchGraphQL:", error);
    throw error;
  }
}
