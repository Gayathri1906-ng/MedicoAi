import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Dashboard from "@/components/Dashboard";


const ReportPage = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Upload Medical Report</CardTitle>
          <CardDescription>
            Upload your medical reports for secure storage and analysis
          </CardDescription>
        </CardHeader>
      </Card>
      <Dashboard />
    </div>
  );
};

export default ReportPage;
