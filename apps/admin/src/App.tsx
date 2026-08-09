import { AdminRouteSlot, AdminShell } from '@lingcootech/frame-admin';
import {
  AdminAuthProvider,
  AdminChangePasswordPage,
  AdminLoginPage,
  useAdminAuth,
  type AdminAuthClient,
} from '@lingcootech/frame-admin/auth';
import {
  ApiError,
  changePassword,
  fetchCurrentAccount,
  fetchPresentation,
  fetchUnreadNotificationCount,
  login,
  logout,
  type AuthAccount,
} from '@lingcootech/frame-admin/defaults';
import { AdminApplicationShell } from '@lingcootech/frame-admin/layout';
import { AdminRouterProvider, useAdminRouter } from '@lingcootech/frame-admin/router';
import { FRAME_VERSION } from '@lingcootech/frame-extension-sdk';

import { adminRegistry, type AdminAppContext } from './extensions';

const authClient: AdminAuthClient<AuthAccount> = {
  async getCurrentAccount() {
    try {
      return await fetchCurrentAccount();
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) return null;
      throw error;
    }
  },
  login,
  logout,
  changePassword,
};

async function loadPresentation() {
  const presentation = await fetchPresentation();
  const logoId = presentation.squareLogoAssetId ?? presentation.fullLogoAssetId;
  return {
    displayName: presentation.displayName,
    logoUrl: logoId ? (presentation.assets[logoId]?.publicUrl ?? null) : null,
  };
}

function RoutedApp() {
  const { account, hasPermission, loading, logout: endSession } = useAdminAuth<AuthAccount>();
  const { pathname, searchParams } = useAdminRouter();
  if (loading)
    return (
      <main className="auth-loading">
        <span className="lc-spinner lc-spinner--lg" />
        <p>正在验证会话…</p>
      </main>
    );
  if (!account) return <AdminLoginPage brandName="LingcooTech" />;
  if (account.mustChangePassword) return <AdminChangePasswordPage />;
  if (!hasPermission('admin.access'))
    return (
      <main className="password-screen">
        <section className="password-panel">
          <h1>当前账号不能访问管理后台</h1>
          <button className="lc-button" onClick={() => void endSession()}>
            退出登录
          </button>
        </section>
      </main>
    );
  const match = adminRegistry.matchRoute(pathname);
  if (match && !hasPermission(match.route.permission))
    return (
      <main className="password-screen">
        <section className="password-panel">
          <h1>当前账号没有页面权限</h1>
          <a className="lc-button" href="/admin/">
            返回官网概览
          </a>
        </section>
      </main>
    );

  return (
    <AdminApplicationShell<AdminAppContext>
      context={{}}
      defaultBrandName="LingcooTech"
      frame={{
        name: 'Lingcoo Frame',
        version: FRAME_VERSION,
        systemInfoHref: '/system',
        systemInfoPermission: 'system.runtime.read',
      }}
      helpHref="/help"
      loadPresentation={loadPresentation}
      loadUnreadNotificationCount={fetchUnreadNotificationCount}
    >
      <AdminRouteSlot<AdminAppContext>
        context={{}}
        hasPermission={hasPermission}
        pathname={pathname}
        searchParams={searchParams}
        notFound={
          <section className="password-panel">
            <h1>页面不存在</h1>
            <a href="/admin/">返回官网概览</a>
          </section>
        }
      />
    </AdminApplicationShell>
  );
}

export function App() {
  return (
    <AdminShell registry={adminRegistry}>
      <AdminAuthProvider client={authClient}>
        <AdminRouterProvider>
          <RoutedApp />
        </AdminRouterProvider>
      </AdminAuthProvider>
    </AdminShell>
  );
}
