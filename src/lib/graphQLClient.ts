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
    const response = await fetch("/projeic/api/graphql", {
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
