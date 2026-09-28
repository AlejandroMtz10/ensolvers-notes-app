const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export async function fetchApi(
  endpoint: string,
  options: RequestInit = {}
) {
  const credentials =
    typeof window !== "undefined"
      ? sessionStorage.getItem("auth")
      : null;

  const formattedEndpoint = endpoint.startsWith("/")
    ? endpoint
    : `/${endpoint}`;

  return fetch(`${API_URL}${formattedEndpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(credentials && {
        Authorization: `Basic ${credentials}`,
      }),
      ...options.headers,
    },
  });
}