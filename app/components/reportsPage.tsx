import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { TrendingUp, TrendingDown, PieChart, Lightbulb, AlertCircle, CheckCircle, Info, Store } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useSearchParams, useNavigate } from "@remix-run/react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RePieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';

const COLORS = ['#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#6366F1'];

const insightIcons = {
  TrendingUp: TrendingUp,
  TrendingDown: TrendingDown,
  PieChart: PieChart,
  Lightbulb: Lightbulb,
  Store: Store,
};

const insightStyles = {
  warning: 'bg-orange-50 border-orange-200 dark:bg-orange-950 dark:border-orange-800',
  success: 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800',
  info: 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800',
  tip: 'bg-purple-50 border-purple-200 dark:bg-purple-950 dark:border-purple-800',
};

const insightIconColors = {
  warning: 'text-orange-600 dark:text-orange-400',
  success: 'text-green-600 dark:text-green-400',
  info: 'text-blue-600 dark:text-blue-400',
  tip: 'text-purple-600 dark:text-purple-400',
};

interface ReportsPageProps {
  data: {
    categorySpending: Array<{ name: string; amount: string }>;
    dailySpending: Array<{ date: string; amount: string }>;
    topMerchants: Array<{ name: string; total: string; count: number; average: string }>;
    totalSpending: string;
    spendingChange: string;
    insights: Array<{
      type: 'warning' | 'success' | 'info' | 'tip';
      title: string;
      description: string;
      icon: keyof typeof insightIcons;
    }>;
    period: string;
  };
}

export default function ReportsPage({ data }: ReportsPageProps) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const handlePeriodChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('period', value);
    navigate(`?${params.toString()}`);
  };

  const categoryData = data.categorySpending.map(cat => ({
    name: cat.name,
    value: parseFloat(cat.amount),
  }));

  const dailyData = data.dailySpending.map(day => ({
    date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    amount: parseFloat(day.amount),
  }));

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">Financial Insights</h2>
          <p className="text-sm text-muted-foreground">Analyze your spending patterns and get personalized recommendations</p>
        </div>
        <Select value={data.period} onValueChange={handlePeriodChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
            <SelectItem value="365">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Spending</CardDescription>
            <CardTitle className="text-3xl">JMD ${data.totalSpending}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {parseFloat(data.spendingChange) > 0 ? (
                <>
                  <TrendingUp className="w-4 h-4 text-orange-500" />
                  <span className="text-sm text-orange-500">+{data.spendingChange}% from last period</span>
                </>
              ) : (
                <>
                  <TrendingDown className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-500">{data.spendingChange}% from last period</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Average Daily Spending</CardDescription>
            <CardTitle className="text-3xl">
              JMD ${(parseFloat(data.totalSpending) / parseInt(data.period)).toFixed(2)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Based on {data.period} days of activity
            </p>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">💡 Smart Recommendations</h3>
        {data.insights.map((insight, index) => {
          const Icon = insightIcons[insight.icon];
          return (
            <Card key={index} className={`${insightStyles[insight.type]} border`}>
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <div className={`flex-shrink-0 ${insightIconColors[insight.type]}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">{insight.title}</h4>
                    <p className="text-sm text-muted-foreground">{insight.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
            <CardDescription>Where your money goes</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RePieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => `JMD $${value.toFixed(2)}`} />
              </RePieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Spending Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Spending Trend</CardTitle>
            <CardDescription>Daily spending over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value: any) => `JMD $${value.toFixed(2)}`} />
                <Line type="monotone" dataKey="amount" stroke="#8B5CF6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Merchants */}
      <Card>
        <CardHeader>
          <CardTitle>Top Merchants</CardTitle>
          <CardDescription>Where you shop most frequently</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.topMerchants.map((merchant, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{merchant.name}</p>
                    <p className="text-sm text-muted-foreground">{merchant.count} purchases</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">JMD ${merchant.total}</p>
                  <p className="text-sm text-muted-foreground">Avg: JMD ${merchant.average}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}