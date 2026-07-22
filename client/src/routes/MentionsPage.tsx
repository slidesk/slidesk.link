import { Card, CardContent } from "@/components/ui/card";
import { useDocumentTitle } from "@/lib/hooks/use-document-title";

export function MentionsPage() {
  useDocumentTitle("Legal | SliDesk.link");
  return (
    <main className="container max-w-3xl py-12">
      <Card>
        <CardContent className="space-y-4 py-8 text-sm leading-relaxed text-muted-foreground">
          <h1 className="text-2xl font-bold text-foreground">Legal notices</h1>
          <p>
            In accordance with the provisions of French law no. 2004-575 of June
            21, 2004 on trust in the digital economy, users and visitors,
            hereinafter the "User", to the <b>slidesk.link</b> website,
            hereinafter the "Site", are hereby informed of the present legal
            notice.
          </p>
          <p>
            Connection to and browsing of the Site by the User implies full
            acceptance of the present legal notice without reservation.
          </p>
          <p>
            These legal notices are available on the Site under the heading
            "Legal Notices". The Site is edited and published by Mr Sylvain
            Gougouzian, hereinafter the "Publisher".
          </p>

          <h2 className="pt-2 text-lg font-semibold text-foreground">Hoster</h2>
          <p>This site is hosted by OVH: http://www.ovh.com</p>
          <p>The domain name is hosted by OVH: http://www.ovh.com</p>
          <p>
            OVH SAS with capital of €10,069,020 — RCS Lille Métropole 424 761
            419 00045. Head office: 2 rue Kellermann - 59100 Roubaix - France.
          </p>

          <h2 className="pt-2 text-lg font-semibold text-foreground">Access</h2>
          <p>
            The Site is normally accessible to the User at all times. However,
            the Publisher may, at any time, suspend, limit or interrupt the Site
            in order, in particular, to update or modify its content. The
            Publisher may in no case be held responsible for any consequences of
            this unavailability on the User's activities.
          </p>
          <p>
            Any use, reproduction, distribution, marketing or modification of
            all or part of the Site without the express authorization of the
            Publisher is prohibited.
          </p>

          <h2 className="pt-2 text-lg font-semibold text-foreground">
            Source code
          </h2>
          <p>
            All source of this website is available on:{" "}
            <a
              href="https://github.com/slidesk/slidesk.link"
              target="_blank"
              rel="noopener"
              className="text-primary underline-offset-4 hover:underline"
            >
              https://github.com/slidesk/slidesk.link
            </a>
          </p>

          <h2 className="pt-2 text-lg font-semibold text-foreground">
            What we store
          </h2>
          <p>
            Only information in user page and a GitHub ID used for connection.
          </p>

          <h2 className="pt-2 text-lg font-semibold text-foreground">
            Credits
          </h2>
          <p>
            Icons:{" "}
            <a
              href="https://lucide.dev/"
              target="_blank"
              rel="noopener"
              className="text-primary underline-offset-4 hover:underline"
            >
              https://lucide.dev/
            </a>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
