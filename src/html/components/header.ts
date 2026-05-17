import { logoSvg } from "./logo";

type HeaderLink = {
  html: string;
};

const dropdownLinks = `<details class="dropdown">
  <summary>See all</summary>
  <ul dir="rtl">
    <li><a href="/components/">Components</a></li>
    <li><a href="/plugins/">Plugins</a></li>
    <li><a href="/templates/">Templates</a></li>
    <li><a href="/themes/">Themes</a></li>
  </ul>
</details>`;

const searchLink = `<a href="/search/">Search</a>`;

export const seeAllDropdown = dropdownLinks;

export const header = (links: HeaderLink[], big?: boolean) => {
  const left = big
    ? `<a href="/"><h1>SliDesk<span>.link</span></h1></a>`
    : `<a href="/" id="backhome">${logoSvg}<b class="h1">SliDesk<span>.link</span></b></a>`;

  return `<header>
    <nav class="container">
      <ul><li>${left}</li></ul>
      <ul>${links.map((l) => `<li>${l.html}</li>`).join("")}</ul>
    </nav>
  </header>`;
};

export const homeHeader = (loggedIn: boolean) =>
  header(
    [
      { html: dropdownLinks },
      { html: searchLink },
      {
        html: loggedIn
          ? `<a href="/profile">Profile</a>`
          : `<a href="/login/">Login</a>`,
      },
      ...(loggedIn ? [{ html: `<a href="/exit">Logout</a>` }] : []),
    ],
    true,
  );

export const internalHeader = () =>
  header([{ html: dropdownLinks }, { html: searchLink }]);

export const userHeader = () =>
  header([{ html: dropdownLinks }, { html: searchLink }]);

export const profileHeader = () =>
  header([
    { html: dropdownLinks },
    { html: searchLink },
    { html: `<a href="#" id="gotomypage">My page</a>` },
    { html: `<a href="/exit">Logout</a>` },
  ]);
