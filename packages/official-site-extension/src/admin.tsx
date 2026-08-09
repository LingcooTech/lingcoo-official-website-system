import { defineAdminExtension } from '@lingcootech/frame-admin';
import { AdminLink } from '@lingcootech/frame-admin/router';
import {
  AdminPagination,
  DataTable,
  FilterBar,
  PageFrame,
  ResourceSection,
  StatusPill,
  type DataTableColumn,
  type StatusTone,
} from '@lingcootech/frame-admin/shared';
import { Button } from '@lingcootech/frame-ui/button';
import { Input } from '@lingcootech/frame-ui/input';
import { Textarea } from '@lingcootech/frame-ui/textarea';
import { useToast } from '@lingcootech/frame-ui/toast';
import { Home, Mail, MessageSquareText, Phone } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';

import {
  fetchInquiries,
  fetchInquiryAssignees,
  updateInquiry,
  type Inquiry,
  type InquiryAssignee,
  type InquiryStatus,
} from './admin-client.js';

const statusOptions: Array<{ value: InquiryStatus; label: string; tone: StatusTone }> = [
  { value: 'new', label: '新线索', tone: 'warn' },
  { value: 'in_progress', label: '跟进中', tone: 'info' },
  { value: 'resolved', label: '已完成', tone: 'ok' },
  { value: 'archived', label: '已归档', tone: 'neutral' },
];

function statusMeta(status: InquiryStatus) {
  return statusOptions.find((option) => option.value === status) ?? statusOptions[0];
}

function OfficialHomePage() {
  return (
    <PageFrame
      section={{
        group: '官网运营',
        title: '官网概览',
        description: '官网业务只保留内容运营与联系线索，通用能力由 Frame 版本化依赖提供。',
      }}
    >
      <ResourceSection title="日常工作入口" description="内容发布使用 CMS，项目咨询进入联系线索。">
        <div className="context-grid">
          <AdminLink className="context-card" href="/inquiries">
            <MessageSquareText size={20} />
            <strong>处理联系线索</strong>
            <span>查看、分配和跟进官网咨询。</span>
          </AdminLink>
          <AdminLink className="context-card" href="/cms">
            <Home size={20} />
            <strong>管理官网内容</strong>
            <span>维护页面、文章、SEO 与发布流程。</span>
          </AdminLink>
        </div>
      </ResourceSection>
    </PageFrame>
  );
}

function InquiriesPage() {
  const { toast } = useToast();
  const [items, setItems] = useState<Inquiry[]>([]);
  const [assignees, setAssignees] = useState<InquiryAssignee[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [status, setStatus] = useState<InquiryStatus | ''>('');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Inquiry | null>(null);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const pageSize = 30;

  useEffect(() => {
    let active = true;
    setLoading(true);
    void Promise.all([
      fetchInquiries({
        page,
        pageSize,
        status: status || undefined,
        search: appliedSearch || undefined,
      }),
      fetchInquiryAssignees(),
    ])
      .then(([result, people]) => {
        if (!active) return;
        setItems(result.items);
        setTotal(result.total);
        setAssignees(people);
      })
      .catch(() => active && toast({ title: '联系线索加载失败', tone: 'danger' }))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [appliedSearch, page, status, toast]);

  async function save(input: {
    status?: InquiryStatus;
    assignedTo?: string | null;
    internalNote?: string | null;
  }) {
    if (!selected) return;
    setSaving(true);
    try {
      const updated = await updateInquiry(selected.id, input);
      const assignee = updated.assignedTo
        ? (assignees.find((item) => item.id === updated.assignedTo) ?? null)
        : null;
      const enriched = { ...selected, ...updated, assignee };
      setSelected(enriched);
      setItems((current) => current.map((item) => (item.id === updated.id ? enriched : item)));
      toast({ title: '联系线索已更新', tone: 'success' });
    } catch {
      toast({ title: '联系线索更新失败', tone: 'danger' });
    } finally {
      setSaving(false);
    }
  }

  const columns: DataTableColumn<Inquiry>[] = [
    {
      key: 'contact',
      header: '联系人',
      cell: (item) => (
        <div>
          <strong>{item.name}</strong>
          <br />
          <small>{item.organization ?? item.email ?? item.phone}</small>
        </div>
      ),
    },
    { key: 'subject', header: '咨询主题', cell: (item) => item.subject ?? '项目咨询' },
    {
      key: 'status',
      header: '状态',
      cell: (item) => (
        <StatusPill tone={statusMeta(item.status).tone}>{statusMeta(item.status).label}</StatusPill>
      ),
    },
    {
      key: 'created',
      header: '提交时间',
      cell: (item) => new Date(item.createdAt).toLocaleString('zh-CN'),
    },
    {
      key: 'action',
      header: '操作',
      align: 'right',
      cell: (item) => (
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            setSelected(item);
            setNote(item.internalNote ?? '');
          }}
        >
          查看
        </Button>
      ),
    },
  ];

  function applyFilters(event: FormEvent) {
    event.preventDefault();
    setPage(1);
    setAppliedSearch(search.trim());
  }

  return (
    <PageFrame
      section={{
        group: '官网运营',
        title: '联系线索',
        description: '跟进官网访问者提交的项目咨询与合作意向。',
      }}
    >
      <ResourceSection title="线索列表">
        <FilterBar
          onSubmit={applyFilters}
          onReset={() => {
            setSearch('');
            setAppliedSearch('');
            setStatus('');
            setPage(1);
          }}
          actions={
            <Button size="sm" type="submit">
              查询
            </Button>
          }
        >
          <Input
            aria-label="搜索联系人、机构或主题"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="搜索联系人、机构或主题"
          />
          <select
            className="admin-native-select"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as InquiryStatus | '');
              setPage(1);
            }}
          >
            <option value="">全部状态</option>
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FilterBar>
        <DataTable columns={columns} getRowKey={(item) => item.id} loading={loading} rows={items} />
        <AdminPagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
      </ResourceSection>
      {selected ? (
        <ResourceSection
          title={selected.subject ?? '联系线索详情'}
          description={`提交于 ${new Date(selected.createdAt).toLocaleString('zh-CN')}`}
        >
          <div className="inquiry-detail">
            <p>
              <strong>{selected.name}</strong> · {selected.organization ?? '未填写机构'}
            </p>
            <p>
              {selected.email ? (
                <a href={`mailto:${selected.email}`}>
                  <Mail size={15} /> {selected.email}
                </a>
              ) : null}{' '}
              {selected.phone ? (
                <a href={`tel:${selected.phone}`}>
                  <Phone size={15} /> {selected.phone}
                </a>
              ) : null}
            </p>
            <p>{selected.message}</p>
            <label>
              状态
              <select
                className="admin-native-select"
                disabled={saving}
                value={selected.status}
                onChange={(event) => void save({ status: event.target.value as InquiryStatus })}
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              负责人
              <select
                className="admin-native-select"
                disabled={saving}
                value={selected.assignedTo ?? ''}
                onChange={(event) => void save({ assignedTo: event.target.value || null })}
              >
                <option value="">暂未分配</option>
                {assignees.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.displayName} · {person.email}
                  </option>
                ))}
              </select>
            </label>
            <label>
              内部备注
              <Textarea rows={6} value={note} onChange={(event) => setNote(event.target.value)} />
            </label>
            <Button loading={saving} onClick={() => void save({ internalNote: note || null })}>
              保存备注
            </Button>
          </div>
        </ResourceSection>
      ) : null}
    </PageFrame>
  );
}

export const officialSiteAdminExtension = defineAdminExtension({
  routes: [
    { id: 'official.home', component: OfficialHomePage },
    { id: 'official.inquiries', component: InquiriesPage },
  ],
  navigation: [
    { id: 'official.home', icon: Home },
    { id: 'official.inquiries', icon: MessageSquareText },
  ],
});
