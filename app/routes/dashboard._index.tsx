import { Receipt, Folder, DollarSign, BookmarkCheck } from "lucide-react";
import { AppSidebar } from "~/components/app-sidebar";
import FileUploader from "~/components/fileUploader";
import { Header } from "~/components/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { SidebarProvider } from "~/components/ui/sidebar";

export default function Dashboard() {

  const statsItems = [
    {
      title: 'Total Receipts',
      value: '3',
      icon: Receipt,
    },
    {
      title: 'Total Spent',
      value: '$12,000 JMD',
      icon: DollarSign,
    },
    {
      title: 'Categories',
      value: '1',
      icon: Folder,
    },
  ];

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />

        {/* Main Content */}
        <main className="flex-1 p-8">
          <Header />

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
          {/* <FileUploader/> */}
          {/* <Card>
            <CardHeader>
              <CardTitle>Upload Receipt</CardTitle>
              <CardDescription>AI powered receipt processing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-12 text-center hover:border-primary/50 transition-colors cursor-pointer">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-8 h-8 text-primary-foreground" />
                </div>
                <p className="text-foreground mb-2">Drag & drop or click to upload receipts</p>
                <p className="text-sm text-muted-foreground">Support JPEG, PNG, PDF Max 10MB</p>
              </div>
            </CardContent>
          </Card> */}


          <FileUploader />
        </main>
      </div>
    </SidebarProvider>
  );
}