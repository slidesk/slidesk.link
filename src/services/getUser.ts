import { telegram } from "../api/telegram";
import add from "../database/user/add";
import checkGithub from "../database/user/checkGithub";
import checkSlug from "../database/user/checkSlug";

export default async (userInfo: {
  name: string;
  login: string;
  bio: string | null;
  avatar_url: string;
  id: number;
}) => {
  const dbUser = await checkGithub(userInfo.id);
  if (dbUser === null) {
    if (await checkSlug(userInfo.login)) {
      const u = userInfo.login;
      let cpt = 0;
      do {
        userInfo.login = `${u}-${cpt++}`;
      } while (await checkSlug(userInfo.login));
    }
    const newUser = await add({
      id: undefined,
      name: userInfo.name,
      bio: userInfo.bio ?? "",
      avatarUrl: userInfo.avatar_url,
      url: "",
      slug: userInfo.login,
      token: Bun.randomUUIDv7(),
      githubId: userInfo.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    telegram(
      `🎉 Nouveau compte : ${newUser.name ?? "sans nom"} (@${newUser.slug})`,
    ).catch((error) => console.error("Telegram signup alert failed:", error));
    return newUser;
  }
  return dbUser;
};
