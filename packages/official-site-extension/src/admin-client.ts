export type InquiryStatus = 'new' | 'in_progress' | 'resolved' | 'archived';

export interface InquiryAssignee {
  id: string;
  email: string;
  displayName: string;
}

export interface Inquiry {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  organization: string | null;
  subject: string | null;
  message: string;
  status: InquiryStatus;
  sourcePath: string;
  assignedTo: string | null;
  internalNote: string | null;
  handledAt: string | null;
  createdAt: string;
  updatedAt: string;
  assignee: InquiryAssignee | null;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  });
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(payload?.message ?? `Request failed (${response.status})`);
  }
  return response.json() as Promise<T>;
}

export function fetchInquiries(input: {
  page: number;
  pageSize: number;
  status?: InquiryStatus;
  search?: string;
}): Promise<{ items: Inquiry[]; total: number; page: number; pageSize: number }> {
  const query = new URLSearchParams({ page: String(input.page), pageSize: String(input.pageSize) });
  if (input.status) query.set('status', input.status);
  if (input.search) query.set('search', input.search);
  return request(`/api/inquiries?${query}`);
}

export async function fetchInquiryAssignees(): Promise<InquiryAssignee[]> {
  return (await request<{ items: InquiryAssignee[] }>('/api/inquiries/assignees')).items;
}

export async function updateInquiry(
  inquiryId: string,
  input: { status?: InquiryStatus; assignedTo?: string | null; internalNote?: string | null },
): Promise<Inquiry> {
  return (
    await request<{ inquiry: Inquiry }>(`/api/inquiries/${inquiryId}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    })
  ).inquiry;
}
