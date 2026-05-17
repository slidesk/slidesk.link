import { homeHeader } from "../components/header";
import { page } from "../components/layout";

export const homePage = (
  highlightedYaml: string,
  highlightedJson: string,
  loggedIn: boolean,
) =>
  page(
    { title: "SliDesk.link | A place for your slides" },
    `${homeHeader(loggedIn)}
    <div class="home-hero">
      <div class="container">
        <div id="home">
          <figure>
            <svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" viewBox="0 0 256 256">
              <defs>
                <style>
                  .color { stroke: black; color-scheme: light dark; }
                  @media (prefers-color-scheme: dark) { .color { stroke: white; } }
                </style>
              </defs>
              <circle cx="149.95" cy="72.23" r="36.22" fill="none" stroke="#999" stroke-width="14"/>
              <ellipse cx="128" cy="163.51" fill="none" stroke="#999" stroke-width="14" rx="88.25" ry="56.48"/>
              <path fill="none" class="color" stroke-width="14" d="M128 107.03c48.74 0 88.25 25.29 88.25 56.48s-39.51 56.48-88.25 56.48c-33.72 0-63.02-12.1-77.88-29.89"/>
              <path fill="none" class="color" stroke-linecap="round" stroke-width="14" d="M144.11 107.98c-41.53-4.76-66.08 8.98-68.24 18.96-3.77 17.45 18.76 23.4 37.85 30.11 26.5 9.31 28.48 26.57 20.95 39.79-11.45 20.11-65.69 20.6-87.92-11.22"/>
              <ellipse cx="155.7" cy="66.47" fill="#999" stroke="#999" stroke-miterlimit="10" rx="5.29" ry="5.76"/>
              <path fill="#999" stroke="#999" stroke-miterlimit="10" d="M186.17 69.62s15.38-1.47 17.28 1.35c1.35 6.92-12.66 13.48-18.25 13.48"/>
            </svg>
          </figure>
          <div>
            <hgroup>
              <h2>SliDesk<span>.link</span></h2>
              <p>A place for your slides</p>
            </hgroup>
            <div class="step">
              <span class="step-badge">1</span>
              <div class="step-content">
                <p>First create an account with your github by clicking "login" on this page</p>
              </div>
            </div>
            <div class="step">
              <span class="step-badge">2</span>
              <div class="step-content">
                <p>Connect your device with slidesk.link</p>
                <pre><code>slidesk link login</code></pre>
              </div>
            </div>
            <div class="step">
              <span class="step-badge">3</span>
              <div class="step-content">
                <p>Then you can host a presentation for 72h</p>
                <pre><code>slidesk link host</code></pre>
              </div>
            </div>
            <div class="step">
              <span class="step-badge">4</span>
              <div class="step-content">
                <p>Or push some information about your talk on your page</p>
                <pre><code>slidesk link push</code></pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <main class="container">
      <section>
        <h2>Add information to share your talks</h2>
        <p>Add a <code>link.yml</code> in the root of your presentation, you can specify all sessions where your talk is given</p>
        <pre><code>${highlightedYaml}</code></pre>
      </section>
      <section>
        <h2>Add your plugin to the HUB</h2>
        <pre><code>slidesk plugin push YOUR_PLUGIN</code></pre>
        <p>will be installed with</p>
        <pre><code>slidesk plugin install @YOUR_USER_SLUG/YOUR_PLUGIN</code></pre>
        <p>Write your <code>plugin.json</code> like this:</p>
        <pre><code>${highlightedJson}</code></pre>
        <p>The <code>README.md</code> will be used as the description in your slidesk.link page.</p>
      </section>
      <section>
        <h2>Add your theme to the HUB</h2>
        <pre><code>slidesk theme push YOUR_THEME</code></pre>
        <p>Create a <code>README.md</code> in your folder to add a description.</p>
        <p>If you want to add previews, then create a sub-directory <code>preview</code> within <code>.webp</code> images (width should be 320px).</p>
      </section>
    </main>`,
  );
