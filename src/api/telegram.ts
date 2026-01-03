export const telegram = async (message: string) => {
  await fetch(
    `https://api.telegram.org/bot${Bun.env.TELEGRAM_APIKEY}/sendMessage`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: Bun.env.TELEGRAM_CHAT_ID,
        text: message,
      }),
    },
  );
};
