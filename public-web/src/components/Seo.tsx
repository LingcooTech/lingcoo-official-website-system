import { Head } from 'vite-react-ssg';

import { site } from '@/content/site';

export default function Seo({
  title,
  description,
}: {
  title?: string;
  description?: string;
}) {
  const fullTitle = title ? `${title} · ${site.name}` : `${site.name} · ${site.tagline}`;
  const desc = description ?? site.description;
  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:type" content="website" />
    </Head>
  );
}
