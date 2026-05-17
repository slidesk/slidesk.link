import { internalHeader } from "../components/header";
import { page } from "../components/layout";

export const mentionsPage = () =>
  page(
    { title: "SliDesk.link | Legal" },
    `${internalHeader()}
    <main class="container">
      <article>
        <main>
          <h2>Legal notices</h2>
          <p>In accordance with the provisions of French law no. 2004-575 of June 21, 2004 on trust in the digital economy, users and visitors, hereinafter the "User", to the <b>slidesk.link</b> website, hereinafter the "Site", are hereby informed of the present legal notice.</p>
          <p>Connection to and browsing of the Site by the User implies full acceptance of the present legal notice without reservation.</p>
          <p>These legal notices are available on the Site under the heading "Legal Notices". SITE PUBLISHER The Site is edited and published by Mr Sylvain Gougouzian. hereinafter the "Publisher".</p>
          <h3>Hoster</h3>
          <p>This site is hosted by OVH: http://www.ovh.com</p>
          <p>The domain name is hosted by OVH: http://www.ovh.com</p>
          <p>OVH SAS with capital of €10,069,020 RCS Lille Métropole 424 761 419 00045</p>
          <p>Head office: 2 rue Kellermann - 59100 Roubaix - France.</p>
          <h3>Access to</h3>
          <p>The Site is normally accessible to the User at all times. However, the Publisher may, at any time, suspend, limit or interrupt the Site in order, in particular, to update or modify its content.</p>
          <p>The Publisher may in no case be held responsible for any consequences of this unavailability on the User's activities.</p>
          <p>Any use, reproduction, distribution, marketing or modification of all or part of the Site without the express authorization of the Publisher is prohibited and may result in legal action and prosecution as provided for by current legislation.</p>
          <h3>Source code</h3>
          <p>All source of this website is available on: <a href="https://github.com/slidesk/slidesk.link" target="_blank" rel="noopener">https://github.com/slidesk/slidesk.link</a></p>
          <h3>What we store</h3>
          <p>Only information in user page and a Github ID used for connection</p>
          <h3>Credits</h3>
          <p>Icons: <a href="https://lucide.dev/" target="_blank" rel="noopener">https://lucide.dev/</a></p>
        </main>
      </article>
    </main>`,
  );
