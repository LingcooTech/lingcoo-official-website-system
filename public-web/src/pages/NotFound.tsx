import { Link } from 'react-router-dom';

import Container from '@/components/Container';
import Seo from '@/components/Seo';

export default function NotFound() {
  return (
    <>
      <Seo title="页面不存在" />
      <Container className="flex min-h-[50vh] flex-col items-center justify-center py-24 text-center">
        <p className="text-6xl font-semibold tracking-tight">404</p>
        <p className="mt-4 text-muted">抱歉，你访问的页面不存在。</p>
        <Link
          to="/"
          className="mt-8 inline-flex items-center rounded-full border border-line px-6 py-3 text-sm font-medium transition-colors hover:bg-paper"
        >
          返回首页
        </Link>
      </Container>
    </>
  );
}
