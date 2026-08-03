import { Button } from '@lingcoo/frame-ui/button';
import { Input } from '@lingcoo/frame-ui/input';
import { Textarea } from '@lingcoo/frame-ui/textarea';
import { useToast } from '@lingcoo/frame-ui/toast';
import { Mail, Phone } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';

import {
  fetchInquiries,
  fetchInquiryAssignees,
  updateInquiry,
  type Inquiry,
  type InquiryStatus,
  type InquiryAssignee,
} from '../api/client';
import { AdminPagination } from '../components/shared/AdminPagination';
import { DataTable, type DataTableColumn } from '../components/shared/DataTable';
import { DetailDrawer } from '../components/shared/DetailDrawer';
import { FilterBar } from '../components/shared/FilterBar';
import { PageFrame } from '../components/shared/PageFrame';
import { ResourceSection } from '../components/shared/ResourceSection';
import { StatusPill, type StatusTone } from '../components/shared/StatusPill';
import { sections } from '../lib/foundation';

const statusOptions: Array<{ value: InquiryStatus; label: string; tone: StatusTone }> = [
  { value: 'new', label: '新线索', tone: 'warn' },
  { value: 'in_progress', label: '跟进中', tone: 'info' },
  { value: 'resolved', label: '已完成', tone: 'ok' },
  { value: 'archived', label: '已归档', tone: 'neutral' },
];

function statusMeta(status: InquiryStatus) {
  return statusOptions.find((option) => option.value === status) ?? statusOptions[0];
}

export function InquiriesPage() {
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
    void Promise.all([
      fetchInquiries({
        page,
        pageSize,
        status: status || undefined,
        search: appliedSearch || undefined,
      }),
      fetchInquiryAssignees(),
    ])
      .then(([result, assigneeItems]) => {
        if (!active) return;
        setItems(result.items);
        setTotal(result.total);
        setAssignees(assigneeItems);
      })
      .catch(() => {
        if (active) toast({ title: '联系线索加载失败', tone: 'danger' });
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [appliedSearch, page, status, toast]);

  function open(inquiry: Inquiry) {
    setSelected(inquiry);
    setNote(inquiry.internalNote ?? '');
  }

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
        <div className="inquiry-contact-cell">
          <strong>{item.name}</strong>
          <span>{item.organization ?? item.email ?? item.phone ?? '未填写机构'}</span>
        </div>
      ),
    },
    { key: 'subject', header: '咨询主题', cell: (item) => item.subject ?? '项目咨询' },
    {
      key: 'status',
      header: '状态',
      cell: (item) => {
        const meta = statusMeta(item.status);
        return <StatusPill tone={meta.tone}>{meta.label}</StatusPill>;
      },
    },
    {
      key: 'createdAt',
      header: '提交时间',
      cell: (item) => new Date(item.createdAt).toLocaleString('zh-CN'),
    },
    {
      key: 'actions',
      header: '操作',
      align: 'right',
      cell: (item) => (
        <Button onClick={() => open(item)} size="sm" variant="secondary">
          查看
        </Button>
      ),
    },
  ];

  function applyFilters(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setPage(1);
    setAppliedSearch(search.trim());
  }

  return (
    <PageFrame section={sections.inquiries}>
      <ResourceSection
        description="访问者通过官网公开表单提交的项目咨询与合作意向。"
        title="联系线索"
      >
        <FilterBar
          actions={
            <Button size="sm" type="submit">
              查询
            </Button>
          }
          onReset={() => {
            setSearch('');
            setAppliedSearch('');
            setStatus('');
            setPage(1);
            setLoading(true);
          }}
          onSubmit={applyFilters}
        >
          <Input
            aria-label="搜索联系人、机构或主题"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="搜索联系人、机构或主题"
            value={search}
          />
          <select
            aria-label="按状态筛选"
            className="admin-native-select"
            onChange={(event) => {
              setStatus(event.target.value as InquiryStatus | '');
              setPage(1);
              setLoading(true);
            }}
            value={status}
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
        <AdminPagination
          onPageChange={(nextPage) => {
            setLoading(true);
            setPage(nextPage);
          }}
          page={page}
          pageSize={pageSize}
          total={total}
        />
      </ResourceSection>

      <DetailDrawer
        description={
          selected ? `提交于 ${new Date(selected.createdAt).toLocaleString('zh-CN')}` : undefined
        }
        footer={
          selected ? (
            <div className="inquiry-drawer-actions">
              <Button
                loading={saving}
                onClick={() => void save({ internalNote: note || null })}
                variant="secondary"
              >
                保存备注
              </Button>
              {selected.status !== 'resolved' ? (
                <Button
                  loading={saving}
                  onClick={() => void save({ status: 'resolved', internalNote: note || null })}
                >
                  标记完成
                </Button>
              ) : (
                <Button loading={saving} onClick={() => void save({ status: 'in_progress' })}>
                  重新跟进
                </Button>
              )}
            </div>
          ) : null
        }
        onOpenChange={(openState) => !openState && setSelected(null)}
        open={Boolean(selected)}
        title={selected?.subject ?? '联系线索详情'}
      >
        {selected ? (
          <div className="inquiry-detail">
            <div className="inquiry-detail__identity">
              <div>
                <span>联系人</span>
                <strong>{selected.name}</strong>
              </div>
              <div>
                <span>公司或机构</span>
                <strong>{selected.organization ?? '未填写'}</strong>
              </div>
            </div>
            <div className="inquiry-detail__contacts">
              {selected.email ? (
                <a href={`mailto:${selected.email}`}>
                  <Mail size={16} />
                  {selected.email}
                </a>
              ) : null}
              {selected.phone ? (
                <a href={`tel:${selected.phone}`}>
                  <Phone size={16} />
                  {selected.phone}
                </a>
              ) : null}
            </div>
            <section>
              <h3>项目情况</h3>
              <p>{selected.message}</p>
            </section>
            <label className="inquiry-detail__status">
              <span>处理状态</span>
              <select
                className="admin-native-select"
                disabled={saving}
                onChange={(event) => void save({ status: event.target.value as InquiryStatus })}
                value={selected.status}
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="inquiry-detail__status">
              <span>负责人</span>
              <select
                className="admin-native-select"
                disabled={saving}
                onChange={(event) => void save({ assignedTo: event.target.value || null })}
                value={selected.assignedTo ?? ''}
              >
                <option value="">暂未分配</option>
                {assignees.map((assignee) => (
                  <option key={assignee.id} value={assignee.id}>
                    {assignee.displayName} · {assignee.email}
                  </option>
                ))}
              </select>
            </label>
            <label className="inquiry-detail__note">
              <span>内部跟进备注</span>
              <Textarea onChange={(event) => setNote(event.target.value)} rows={7} value={note} />
            </label>
          </div>
        ) : null}
      </DetailDrawer>
    </PageFrame>
  );
}
