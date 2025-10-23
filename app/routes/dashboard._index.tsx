import { redirect, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Receipt, Folder, DollarSign, BookmarkCheck } from "lucide-react";
import { AppSidebar } from "~/components/app-sidebar";
import FileUploader from "~/components/fileUploader";
import { Card, CardContent } from "~/components/ui/card";
import { SidebarProvider } from "~/components/ui/sidebar";
import { getUserFromRequest } from "~/lib/user";
import prisma from "~/prisma.server";

export async function loader({ request}: any) {
  const { user } = await getUserFromRequest(request);
  
  if(!user) return redirect('/auth/login');
  
  const receiptCount = await prisma.receipt.count({
    where: { user_id: user?.id },
  });
  
  const totalSpent = await prisma.receipt.aggregate({
    where: { user_id: user?.id },
    _sum: { total_amount: true },
  });
  
  const categoryCount = await prisma.category.count({
    where: { user_id: user?.id },
  });

  // Convert Decimal to number, handle null case
  const totalAmount = totalSpent._sum.total_amount 
    ? Number(totalSpent._sum.total_amount) 
    : 0;

  return json({ 
    user, 
    receiptCount, 
    totalSpent: totalAmount.toFixed(2), // Convert to string with 2 decimals
    categoryCount 
  });
}

export default function Dashboard() {
  const { receiptCount, totalSpent, categoryCount } = useLoaderData<typeof loader>();

  const statsItems = [
    {
      title: 'Total Receipts',
      value: receiptCount,
      icon: Receipt,
    },
    {
      title: 'Total Spent',
      value: `JMD $${totalSpent}`,
      icon: DollarSign,
    },
    {
      title: 'Categories',
      value: categoryCount,
      icon: Folder,
    },
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full bg-background">
        <AppSidebar />

        {/* Main Content */}
        <main>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
            {statsItems.map((stat) => (
              <Card key={stat.title} className="border border-border shadow-sm rounded-2xl bg-card">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                      <stat.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                      <p className="text-xl font-medium">{stat.value}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Upload Section */}
          <FileUploader />
        </main>
      </div>
    </SidebarProvider>
  );
}