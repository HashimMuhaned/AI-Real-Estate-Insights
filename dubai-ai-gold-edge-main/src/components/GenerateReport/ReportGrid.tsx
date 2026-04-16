import { Download } from "lucide-react";

const monthlyReports = [
  { year: "2025", period: "Jun" }, { year: "2025", period: "May" },
  { year: "2025", period: "Apr" }, { year: "2025", period: "Mar" },
  { year: "2025", period: "Feb" }, { year: "2025", period: "Jan" },
  { year: "2024", period: "Dec" }, { year: "2024", period: "Nov" },
  { year: "2024", period: "Oct" }, { year: "2024", period: "Sep" },
  { year: "2024", period: "Aug" }, { year: "2024", period: "Jul" },
];

const quarterlyReports = [
  { year: "2025", period: "Q2" }, { year: "2025", period: "Q1" },
  { year: "2024", period: "Q4" }, { year: "2024", period: "Q3" },
  { year: "2024", period: "Q2" },
];

const yearlyReports = [
  { year: "Year", period: "2024" }, { year: "Year", period: "2023" },
  { year: "Year", period: "2022" }, { year: "Year", period: "2021" },
];

const reportSections = [
  { title: "Monthly Reports", data: monthlyReports, cols: "grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12" },
  { title: "Quarterly Reports", data: quarterlyReports, cols: "grid-cols-3 sm:grid-cols-5" },
  { title: "Yearly Reports", data: yearlyReports, cols: "grid-cols-2 sm:grid-cols-4" },
];

function ReportCard({ report }) {
  return (
    <button className="group relative rounded-xl p-4 border border-border/50 bg-card hover:border-accent/50 hover:shadow-md transition-all duration-200 text-center w-full overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative">
        <div className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground/70 mb-1">
          {report.year}
        </div>
        <div className="text-lg font-bold text-foreground">{report.period}</div>
        <div className="pt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <Download className="w-3.5 h-3.5 mx-auto text-accent" />
        </div>
      </div>
    </button>
  );
}

export default function ReportGrid() {
  return (
    <div className="space-y-12">
      {reportSections.map((section) => (
        <div key={section.title}>
          <div className="flex items-center gap-4 mb-5">
            <span className="w-8 h-px bg-accent/60" />
            <h3 className="text-sm font-bold uppercase tracking-widest text-foreground/80">{section.title}</h3>
            <div className="flex-1 h-px bg-border/50" />
          </div>
          <div className={`grid ${section.cols} gap-3`}>
            {section.data.map((report, i) => (
              <ReportCard key={i} report={report} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}