import LeaderboardChart from "./LeaderboardChart";
import HeatmapChart from "./HeatmapChart";
import DonutChart from "./DonutChart";
import TopProjectsChart from "./TopProjectsChart";
import RadialGaugeChart from "./RadialGuageChart";
import AreaSparklineChart from "./AreaSparklineChart";
import SingleLineChart from "./SingleLineChart";

export default function CardChart({ card }) {
  const k = card.id;
  switch (card.chartVariant) {
    case "leaderboard":   return <LeaderboardChart   data={card.chartData} color={card.accentColor} animKey={k} />;
    case "heatmap":       return <HeatmapChart       data={card.chartData} color={card.accentColor} animKey={k} />;
    case "donut":         return <DonutChart         data={card.chartData} total={card.kpi} animKey={k} />;
    case "topProjects":   return <TopProjectsChart   data={card.chartData} color={card.accentColor} animKey={k} />;
    case "radialGauge":   return <RadialGaugeChart   data={card.chartData} animKey={k} />;
    case "areaSparkline": return <AreaSparklineChart data={card.chartData} animKey={k} />;
    case "singleLine":    return <SingleLineChart    data={card.chartData} animKey={k} />;
    default: return null;
  }
}