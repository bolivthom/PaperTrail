import { json, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { AppSidebar } from "~/components/app-sidebar";
import { SidebarProvider } from "~/components/ui/sidebar";
import { Header } from "~/components/header";
import { getUserFromRequest } from "~/lib/user";
import prisma from "~/prisma.server";
import ReportsPage from "~/components/reportsPage";

// Define types for insights
type InsightType = 'success' | 'info' | 'warning' | 'tip';
type InsightIcon = 'TrendingUp' | 'TrendingDown' | 'PieChart' | 'Lightbulb' | 'Store';

interface Insight {
  type: InsightType;
  title: string;
  description: string;
  icon: InsightIcon;
}

interface GenerateInsightsData {
  categorySpending: Record<string, number>;
  merchantSpending: Record<string, { total: number; count: number }>;
  totalSpending: number;
  spendingChange: number;
  receipts: any[];
  period: number;
}

export async function loader({ request }: LoaderFunctionArgs) {
  const { user } = await getUserFromRequest(request);

  if (!user) return redirect('/auth/login');

  const url = new URL(request.url);
  const period = url.searchParams.get('period') || '30'; // days
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(period));

  // Get all receipts for the period
  const receipts = await prisma.receipt.findMany({
    where: {
      user_id: user.id,
      purchase_date: {
        gte: startDate,
      },
    },
    include: {
      category: true,
    },
    orderBy: {
      purchase_date: 'desc',
    },
  });

  // Calculate spending by category
  const categorySpending = receipts.reduce((acc, receipt) => {
    const categoryName = receipt.category?.name || 'Uncategorized';
    if (!acc[categoryName]) {
      acc[categoryName] = 0;
    }
    acc[categoryName] += Number(receipt.total_amount);
    return acc;
  }, {} as Record<string, number>);

  // Calculate daily spending for trend
  const dailySpending = receipts.reduce((acc, receipt) => {
    const date = receipt.purchase_date.toISOString().split('T')[0];
    if (!acc[date]) {
      acc[date] = 0;
    }
    acc[date] += Number(receipt.total_amount);
    return acc;
  }, {} as Record<string, number>);

  // Get top merchants
  const merchantSpending = receipts.reduce((acc, receipt) => {
    const merchant = receipt.company_name;
    if (!acc[merchant]) {
      acc[merchant] = { total: 0, count: 0 };
    }
    acc[merchant].total += Number(receipt.total_amount);
    acc[merchant].count += 1;
    return acc;
  }, {} as Record<string, { total: number; count: number }>);

  // Calculate total spending
  const totalSpending = receipts.reduce((sum, receipt) => sum + Number(receipt.total_amount), 0);

  // Get previous period for comparison
  const previousPeriodStart = new Date(startDate);
  previousPeriodStart.setDate(previousPeriodStart.getDate() - parseInt(period));

  const previousReceipts = await prisma.receipt.findMany({
    where: {
      user_id: user.id,
      purchase_date: {
        gte: previousPeriodStart,
        lt: startDate,
      },
    },
  });

  const previousTotal = previousReceipts.reduce((sum, receipt) => sum + Number(receipt.total_amount), 0);
  const spendingChange = previousTotal > 0 ? ((totalSpending - previousTotal) / previousTotal) * 100 : 0;

  // Generate insights/recommendations
  const insights = generateInsights({
    categorySpending,
    merchantSpending,
    totalSpending,
    spendingChange,
    receipts,
    period: parseInt(period),
  });

  return json({
    categorySpending: Object.entries(categorySpending).map(([name, amount]) => ({
      name,
      amount: amount.toFixed(2),
    })),
    dailySpending: Object.entries(dailySpending)
      .map(([date, amount]) => ({
        date,
        amount: amount.toFixed(2),
      }))
      .sort((a, b) => a.date.localeCompare(b.date)),
    topMerchants: Object.entries(merchantSpending)
      .map(([name, data]) => ({
        name,
        total: data.total.toFixed(2),
        count: data.count,
        average: (data.total / data.count).toFixed(2),
      }))
      .sort((a, b) => parseFloat(b.total) - parseFloat(a.total))
      .slice(0, 5),
    totalSpending: totalSpending.toFixed(2),
    spendingChange: spendingChange.toFixed(1),
    insights,
    period,
  });
}

function generateInsights(data: GenerateInsightsData): Insight[] {
  const insights: Insight[] = [];

  // Spending increase/decrease
  if (Math.abs(data.spendingChange) > 10) {
    if (data.spendingChange > 0) {
      insights.push({
        type: 'warning',
        title: `Spending increased by ${data.spendingChange.toFixed(1)}%`,
        description: `You've spent ${data.spendingChange.toFixed(1)}% more in the last ${data.period} days compared to the previous period. Consider reviewing your expenses.`,
        icon: 'TrendingUp',
      });
    } else {
      insights.push({
        type: 'success',
        title: `Great job! Spending decreased by ${Math.abs(data.spendingChange).toFixed(1)}%`,
        description: `You've saved ${Math.abs(data.spendingChange).toFixed(1)}% compared to the previous period. Keep it up!`,
        icon: 'TrendingDown',
      });
    }
  }

  // Category-specific insights
  const sortedCategories = Object.entries(data.categorySpending)
    .sort(([, a], [, b]) => (b as number) - (a as number));

  if (sortedCategories.length > 0) {
    const [topCategory, topAmountUnknown] = sortedCategories[0];
    const topAmount = topAmountUnknown as number;
    const percentage = (topAmount / data.totalSpending) * 100;

    if (percentage > 40) {
      insights.push({
        type: 'info',
        title: `${percentage.toFixed(0)}% of spending on ${topCategory}`,
        description: `You're spending heavily on ${topCategory}. Consider setting a budget limit for this category.`,
        icon: 'PieChart',
      });
    }
  }

  // Dining suggestions
  if (data.categorySpending['Dining']) {
    const diningAmount = data.categorySpending['Dining'];
    const monthlySavings = (diningAmount * 0.3).toFixed(2);
    insights.push({
      type: 'tip',
      title: 'Dining Out Savings Opportunity',
      description: `You spent JMD $${diningAmount.toFixed(2)} on dining. Cooking at home 2-3 times a week could save you ~JMD $${monthlySavings}/month.`,
      icon: 'Lightbulb',
    });
  }

  // Frequent merchant insight
  const merchantEntries = Object.entries(data.merchantSpending)
    .sort(([, a], [, b]) => b.count - a.count);
  
  const topMerchant = merchantEntries[0];

  if (topMerchant && topMerchant[1].count > 5) {
    insights.push({
      type: 'info',
      title: `Frequent visits to ${topMerchant[0]}`,
      description: `You've made ${topMerchant[1].count} purchases at ${topMerchant[0]}. Consider bulk buying or looking for loyalty programs to save money.`,
      icon: 'Store',
    });
  }

  // Investment opportunity
  const avgDailySpending = data.totalSpending / data.period;
  const potentialSavings = (avgDailySpending * 0.15 * 365).toFixed(2);
  insights.push({
    type: 'success',
    title: 'Investment Opportunity',
    description: `If you reduce daily spending by just 15% (JMD $${(avgDailySpending * 0.15).toFixed(2)}/day), you could save JMD $${potentialSavings} per year. That's enough for a vacation or emergency fund!`,
    icon: 'TrendingUp',
  });

  return insights;
}

export default function Reports() {
  const data = useLoaderData<typeof loader>();

  return (
    <div>
      <ReportsPage data={data} />
    </div>
  );
}