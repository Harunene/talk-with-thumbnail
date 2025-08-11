'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import type { Options as WordCloudOptions } from 'react-wordcloud/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const ReactWordcloud = dynamic(() => import('react-wordcloud'), { ssr: false });

interface StatsData {
  totalCount: number;
  typeStats: Record<string, number>;
  wordCloud: Array<{ text: string; value: number }>;
  recentMessages: Array<{
    message: string;
    imageType?: string;
    subType?: string;
    createdAt: string;
  }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function DashboardPage() {
  if (process.env.NEXT_PUBLIC_ENABLE_STATS !== 'true' && process.env.NODE_ENV === 'production') {
    return (
      <div className="container mx-auto p-4">
        <p className="text-muted-foreground mt-2">forbidden</p>
      </div>
    );
  }
  
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  if (!stats) return null;

  const typeChartData = Object.entries(stats.typeStats).map(([key, value]) => ({
    key,
    name: key === 'default' ? '기본' : key,
    value,
  }));

  const getTypeImageUrl = (imageType: string): string => {
    switch (imageType) {
      case 'hikari':
        return '/images/hikari.png';
      case 'nozomi':
        return '/images/nozomi.png';
      case 'sans':
        return '/images/sans.png';
      case 'ichihime':
        return '/images/ichihime.png';
      case 'sana_stare':
        return '/images/sana_stare.png';
      case 'sana_dizzy':
        return '/images/sana_dizzy.png';
      case 'cat_lick':
        return '/images/cat_lick.png';
      case 'cat_scared':
        return '/images/cat_scared.png';
      default:
        return '/favicon.ico';
    }
  };

  const buildOgUrl = (msg: { message: string; imageType?: string; subType?: string; zoomMode?: boolean }): string => {
    const HOST = 'https://talk.nene.dev';
    const message = msg?.message || '';
    const encodedMessage = encodeURIComponent(message);
    const base = message.trim() ? `${HOST}/api/og/${encodedMessage}` : `${HOST}/api/og/`;
    const params = new URLSearchParams({
      type: msg?.imageType || 'sana_stare',
      subType: msg?.subType || '',
      zoom: String(msg?.zoomMode || false),
    });
    return `${base}?${params.toString()}`;
  };

  const wordCloudOptions: Partial<WordCloudOptions> = {
    rotations: 2,
    rotationAngles: [-90, 0] as [number, number],
    scale: 'sqrt',
    spiral: 'archimedean',
    fontSizes: [12, 60],
    padding: 2,
    fontFamily: 'Pretendard',
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold mb-6">썸네일 생성 통계 대시보드</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>전체 생성 수</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{stats.totalCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>가장 인기 있는 타입</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {typeChartData.length > 0 
                ? typeChartData.sort((a, b) => b.value - a.value)[0].name
                : 'N/A'}
            </div>
            <div className="text-sm text-muted-foreground">
              {typeChartData.length > 0 
                ? `${typeChartData.sort((a, b) => b.value - a.value)[0].value}회 사용`
                : ''}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>타입 종류</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{Object.keys(stats.typeStats).length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>캐릭터 타입별 사용 통계</CardTitle>
            <CardDescription>전체 사용 비율</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <defs>
                  {typeChartData.map((entry) => (
                    <pattern
                      id={`pattern-${entry.key}`}
                      key={`pattern-${entry.key}`}
                      patternUnits="userSpaceOnUse"
                      width={80}
                      height={80}
                    >
                      <image
                        xlinkHref={getTypeImageUrl(entry.key)}
                        x={0}
                        y={0}
                        width={80}
                        height={80}
                        preserveAspectRatio="xMidYMid slice"
                      />
                    </pattern>
                  ))}
                </defs>
                <Pie
                  data={typeChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent = 0 }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {typeChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`url(#pattern-${entry.key})`} stroke={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>캐릭터 타입별 사용 횟수</CardTitle>
            <CardDescription>막대 차트</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={typeChartData}>
                <defs>
                  {typeChartData.map((entry) => (
                    <pattern
                      id={`bar-pattern-${entry.key}`}
                      key={`bar-pattern-${entry.key}`}
                      patternUnits="userSpaceOnUse"
                      width={40}
                      height={40}
                    >
                      <image
                        xlinkHref={getTypeImageUrl(entry.key)}
                        x={0}
                        y={0}
                        width={40}
                        height={40}
                        preserveAspectRatio="xMidYMid slice"
                      />
                    </pattern>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8">
                  {typeChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`url(#bar-pattern-${entry.key})`} stroke={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>자주 사용된 단어</CardTitle>
          <CardDescription>워드클라우드 (상위 100개)</CardDescription>
        </CardHeader>
        <CardContent>
          <div style={{ height: '400px', width: '100%' }}>
            {stats?.wordCloud?.length > 0 && (
              <ReactWordcloud
                words={stats.wordCloud}
                options={wordCloudOptions}
                minSize={[300, 300]}
              />
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>최근 생성된 메시지</CardTitle>
          <CardDescription>최근 10개</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.recentMessages.map((msg, index) => (
              <div key={index} className="border-b pb-3 last:border-0">
                <div className="flex items-start gap-4">
                  <img
                    src={buildOgUrl(msg)}
                    alt="최근 생성 썸네일"
                    className="w-48 h-24 object-cover rounded border"
                    loading="lazy"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <p className="font-medium break-words">{msg.message}</p>
                      <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                        {new Date(msg.createdAt).toLocaleString('ko-KR')}
                      </span>
                    </div>
                    <div className="flex gap-2 mt-1 items-center">
                      <span className="text-xs text-muted-foreground">
                        타입: {msg.imageType || 'default'}
                      </span>
                      {msg.subType && (
                        <span className="text-xs text-muted-foreground">
                          서브타입: {msg.subType}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
