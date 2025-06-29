import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navigation } from "@/components/Navigation";
import Home from "@/pages/Home";
import GamesDatabase from "@/pages/GamesDatabase";
import PlayerProfile from "@/pages/PlayerProfile";
import LearnChess from "@/pages/LearnChess";
import Account from "@/pages/Account";
import OpponentScout from "@/pages/OpponentScout";
import NotFound from "@/pages/not-found";
import RedirectHandler from "./RedirectHandler"; // adjust path if needed


function Router() {
  return (
    <Switch>
      <Route path="/Educhess/" component={Home} />
<Route path="/Educhess/games" component={GamesDatabase} />
<Route path="/Educhess/profile" component={PlayerProfile} />
<Route path="/Educhess/scout" component={OpponentScout} />
<Route path="/Educhess/opponent-scout" component={OpponentScout} />
<Route path="/Educhess/learn" component={LearnChess} />
<Route path="/Educhess/account" component={Account} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
         <RedirectHandler /> {/* 🛠 Handles refresh redirects */}
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <Router />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
