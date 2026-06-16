import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { useEffect } from "react";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import EngineLayout from "./components/EngineLayout";
import Dashboard from "./pages/Dashboard";
import Pipeline from "./pages/Pipeline";
import Login from "./pages/Login";
import { trpc } from "@/lib/trpc";

function AuthGuard({ children }: { children: React.ReactNode }) {
  const me = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!me.isLoading && !me.data) {
      navigate("/login");
    }
  }, [me.isLoading, me.data, navigate]);

  if (me.isLoading || !me.data) return null;
  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route>
        <AuthGuard>
          <EngineLayout>
            <Switch>
              <Route path="/" component={Dashboard} />
              <Route path="/pipeline" component={Pipeline} />
              <Route path="/404" component={NotFound} />
              <Route component={NotFound} />
            </Switch>
          </EngineLayout>
        </AuthGuard>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
