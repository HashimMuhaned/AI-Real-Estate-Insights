import { Download } from "lucide-react";

const MarketReports = () => {
  const monthlyReports = [
    { year: "2025", period: "Jun" },
    { year: "2025", period: "May" },
    { year: "2025", period: "Apr" },
    { year: "2025", period: "Mar" },
    { year: "2025", period: "Feb" },
    { year: "2025", period: "Jan" },
    { year: "2024", period: "Dec" },
    { year: "2024", period: "Nov" },
    { year: "2024", period: "Oct" },
    { year: "2024", period: "Sep" },
    { year: "2024", period: "Aug" },
    { year: "2024", period: "Jul" }
  ];

  const quarterlyReports = [
    { year: "2025", period: "Q2" },
    { year: "2025", period: "Q1" },
    { year: "2024", period: "Q4" },
    { year: "2024", period: "Q3" },
    { year: "2024", period: "Q2" }
  ];

  const yearlyReports = [
    { year: "Year", period: "2024" },
    { year: "Year", period: "2023" },
    { year: "Year", period: "2022" },
    { year: "Year", period: "2021" }
  ];

  const ReportButton = ({ report, isYearly = false }: { report: any, isYearly?: boolean }) => (
    <div className="group bg-background rounded-lg p-4 border border-border/30 hover:border-accent/50 hover:scale-105 hover:shadow-luxury transition-all duration-300 cursor-pointer">
      <div className="text-center">
        <div className="text-sm text-destructive font-medium mb-1">
          {report.year}
        </div>
        <div className="text-lg font-semibold text-foreground">
          {report.period}
        </div>
      </div>
    </div>
  );

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Market Reports
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Dig into monthly, quarterly, and yearly reports powered by real transaction data and AI insights.
          </p>
        </div>

        <div className="space-y-12">
          {/* Monthly Reports */}
          <div className="animate-fade-in">
            <h3 className="text-2xl font-bold text-foreground mb-6">Monthly Reports</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-12 gap-4">
              {monthlyReports.map((report, index) => (
                <ReportButton key={index} report={report} />
              ))}
            </div>
          </div>

          {/* Quarterly Reports */}
          <div className="animate-fade-in">
            <h3 className="text-2xl font-bold text-foreground mb-6">Quarterly Reports</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {quarterlyReports.map((report, index) => (
                <ReportButton key={index} report={report} />
              ))}
            </div>
          </div>

          {/* Yearly Reports */}
          <div className="animate-fade-in">
            <h3 className="text-2xl font-bold text-foreground mb-6">Yearly Reports</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {yearlyReports.map((report, index) => (
                <ReportButton key={index} report={report} isYearly />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MarketReports;