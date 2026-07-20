import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Container,
  Title,
  Paper,
  Select,
  Radio,
  Group,
  Button,
  Text,
  Loader,
} from '@mantine/core';

const companies = [
  { id: `BC_1`, name: 'Blue Cheese Inc' },
  { id: `QP_2`, name: 'Quantum Pets' },
  { id: `EF_3`, name: 'EcoFriendship Ltd' },
  { id: `NR_4`, name: 'Neon Robotics' },
  { id: `SSE_5`, name: 'SolarSphere Energy' },
  { id: `BBF_6`, name: 'ByteBites Foods' },
  { id: `ACS_7`, name: 'AeroCloud Systems' },
  { id: `CWAR_8`, name: 'CrystalWear AR' },
  { id: `HAIL_9`, name: 'Harbor AI Logistics' },
  { id: `VRM_10`, name: 'VelvetRide Mobility' },
];

const ReportGenerator = observer(() => {
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [reportType, setReportType] = useState<'high-level' | 'detailed'>(
    'high-level'
  );
  const [markdown, setMarkdown] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onGenerate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMarkdown('');

    if (!companyId) {
      setError('Please select a company.');
      return;
    }

    setLoading(true);
    try {
      const company = companies.find((c) => c.id === companyId);
      const res = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: company?.name,
          companyId,
          reportType,
        }),
      });

      if (!res.ok) throw new Error(await res.text());

      const data: { reportMarkdown: string } = await res.json();
      setMarkdown(data.reportMarkdown || '');
    } catch (err: any) {
      setError(err?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container size='sm' py='xl'>
      <Title order={2} ta='center' mb='lg'>
        Investment Report Generator
      </Title>

      <Paper radius='md' p='lg'>
        <form onSubmit={onGenerate}>
          <Select
            label=''
            placeholder='Select a company'
            value={companyId}
            onChange={setCompanyId}
            data={companies.map((c) => ({ value: c.id, label: c.name }))}
            mb='md'
          />

          <Radio.Group
            label=''
            value={reportType}
            onChange={(val) => setReportType(val as 'high-level' | 'detailed')}
            mb='md'
          >
            <Group>
              <Radio value='high-level' label='High-level report' />
              <Radio value='detailed' label='Detailed report' />
            </Group>
          </Radio.Group>

          <Group mt='md'>
            <Button type='submit' disabled={loading} fullWidth>
              {loading ? <Loader size='xs' /> : 'Generate Report'}
            </Button>
            {error && (
              <Text c='red' size='sm'>
                {error}
              </Text>
            )}
          </Group>
        </form>
      </Paper>

      <Paper radius='md' p='lg' mt='lg'>
        {markdown ? (
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
        ) : (
          <Text size='sm' c='dimmed' ta='center'>
            Report output will render here as Markdown.
          </Text>
        )}
      </Paper>
    </Container>
  );
});

export default ReportGenerator;
