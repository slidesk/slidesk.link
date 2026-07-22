import { logoSvg } from "./logo";

const addonLinks = `
  <a href="/plugins/">Plugins</a>
  <a href="/components/">Components</a>
  <a href="/templates/">Templates</a>
  <a href="/themes/">Themes</a>
  <a href="https://slidesk.github.io/slidesk/" target="_blank" rel="noopener">Documentation</a>
`;

const header = (extra: string, big?: boolean) => {
  const left = big
    ? `<a href="/"><h1>SliDesk<span>.link</span></h1></a>`
    : `<a href="/" id="backhome">${logoSvg}<b class="h1">SliDesk<span>.link</span></b></a>`;

  return `<header>
    <nav class="container">
      <ul><li>${left}</li></ul>
      <ul class="nav-desktop">
        ${addonLinks.replace(/<a /g, "<li><a ").replace(/<\/a>/g, "</a></li>")}
        <li><a href="/search/">Search</a></li>
        ${extra}
      </ul>
      <button class="hamburger" aria-label="Menu" onclick="document.querySelector('header').classList.toggle('menu-open')">
        <span></span><span></span><span></span>
      </button>
    </nav>
    <div class="mobile-menu">
      ${addonLinks}
      <a href="/search/">Search</a>
      ${extra.replace(/<\/?li>/g, "")}
    </div>
  </header>`;
};

export const homeHeader = (loggedIn: boolean) =>
  header(
    loggedIn
      ? `<li><a href="/profile">Profile</a></li><li><a href="/exit">Logout</a></li>`
      : `<li><a href="/login/">Login</a></li>`,
    true,
  );

export const internalHeader = () => header("");

export const userHeader = () => header("");

export const profileHeader = () =>
  header(
    `<li><a href="#" id="gotomypage">My page</a></li><li><a href="/exit">Logout</a></li>`,
  );

const sidebarBase = (
  extra: string,
  logout: string,
) => `<aside class="profile-sidebar">
  <a href="/" class="brand">${logoSvg}<span>SliDesk.link</span></a>
  <nav>
    ${extra}
    <a href="/search/">Search</a>
    ${addonLinks}
  </nav>
  ${logout}
</aside>`;

export const profileSidebar = () =>
  sidebarBase(
    `<a href="#" id="gotomypage">My page</a>`,
    `<div class="spacer"></div>
    <a href="/exit" class="logout">Logout</a>`,
  );

export const userSidebar = () => sidebarBase("", "");
