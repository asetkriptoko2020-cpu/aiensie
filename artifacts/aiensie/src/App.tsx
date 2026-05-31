import { Switch, Route, Router as WouterRouter } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import HomePage         from "@/pages/home";
import AssessmentPage   from "@/pages/assessment";
import LoginPage        from "@/pages/login";
import DashboardOverview   from "@/pages/dashboard/index";
import ReportsPage         from "@/pages/dashboard/reports";
import ReportDetailPage    from "@/pages/dashboard/report-detail";
import TrendsPage          from "@/pages/dashboard/trends";
import MarketsPage         from "@/pages/dashboard/markets";
import SettingsPage        from "@/pages/dashboard/settings";
import UpgradePage         from "@/pages/dashboard/upgrade";
import NotFound         from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/"                       component={HomePage} />
      <Route path="/assessment"             component={AssessmentPage} />
      <Route path="/login"                  component={LoginPage} />
      <Route path="/dashboard"              component={DashboardOverview} />
      <Route path="/dashboard/reports"      component={ReportsPage} />
      <Route path="/dashboard/reports/:id"  component={ReportDetailPage} />
      <Route path="/dashboard/trends"       component={TrendsPage} />
      <Route path="/dashboard/markets"      component={MarketsPage} />
      <Route path="/dashboard/settings"       component={SettingsPage} />
      <Route path="/dashboard/upgrade"       component={UpgradePage} />
      <Route path="/dashboard/new-assessment" component={AssessmentPage} />
      <Route path="/reports"               component={ReportsPage} />
      <Route path="/upgrade"               component={UpgradePage} />
      <Route                                component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <TooltipProvider>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <Router />
      </WouterRouter>
      <Toaster />
    </TooltipProvider>
  );
}

export default App;
