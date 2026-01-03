export async function fetchUniversalAuthToken(options: {
  baseUrl: string;
  clientId: string;
  clientSecret: string;
}): Promise<string> {
  const response = await fetch(
    `${options.baseUrl}/api/v1/auth/universal-auth/login`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        clientId: options.clientId,
        clientSecret: options.clientSecret,
      }),
    },
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `Infisical Universal Auth failed (${response.status}): ${text}`,
    );
  }

  const json = (await response.json()) as {
    accessToken?: string;
  };

  if (!json.accessToken) {
    throw new Error(
      'Infisical Universal Auth response missing accessToken or credentials',
    );
  }

  return json.accessToken;
}
