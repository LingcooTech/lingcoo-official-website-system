export interface HostBindingCheck {
  bindingSource: string;
  boundHost?: string;
  requestHost?: string;
}

/**
 * 生产环境把部署锁定到 lingcoo.com。绑定关闭时（none / 无 boundHost）一律放行，
 * 便于本地开发与内网 IP 访问。apex 与 www 视为同一站点。
 */
export function isRequestHostAllowed({
  bindingSource,
  boundHost,
  requestHost,
}: HostBindingCheck): boolean {
  if (bindingSource === 'none' || !boundHost) {
    return true;
  }
  if (!requestHost) {
    return false;
  }
  const host = requestHost.split(':')[0].toLowerCase();
  const bound = boundHost.split(':')[0].toLowerCase();
  return host === bound || host === `www.${bound}` || `www.${host}` === bound;
}
