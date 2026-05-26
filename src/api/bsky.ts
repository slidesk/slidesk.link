const createSession = async (): Promise<{ did: string; accessJwt: string }> => {
  const res = await fetch(
    "https://bsky.social/xrpc/com.atproto.server.createSession",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        identifier: Bun.env.BSKY_HANDLE,
        password: Bun.env.BSKY_PASSWORD,
      }),
    },
  );

  if (!res.ok) throw new Error(`Auth failed: ${await res.text()}`);
  return res.json();
};

const createPost = async (
  accessJwt: string,
  did: string,
  text: string,
): Promise<void> => {
  const res = await fetch(
    "https://bsky.social/xrpc/com.atproto.repo.createRecord",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessJwt}`,
      },
      body: JSON.stringify({
        repo: did,
        collection: "app.bsky.feed.post",
        record: {
          $type: "app.bsky.feed.post",
          text,
          createdAt: new Date().toISOString(),
        },
      }),
    },
  );

  if (!res.ok) throw new Error(`Post failed: ${await res.text()}`);
  await res.json();
};

export const bksy = async (message: string) => {
  const session = await createSession();
  await createPost(session.accessJwt, session.did, message);
};
