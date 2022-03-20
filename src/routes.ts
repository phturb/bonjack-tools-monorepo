import { Home, LoisDesNorms, LunaBot, CryptoTracker } from "./pages";
import OtherProjects from "./pages/OtherProjects";

export const routes = [
    {name: 'Home', path: '/', element: Home},
    {name: 'LoisDesNorms', path: '/lois-des-norms', element: LoisDesNorms},
    {name: 'Crypto Tracker', path: '/crypto-tracker', element: CryptoTracker},
    {name: 'Luna Bot', path: '/luna-bot', element: LunaBot},
    {name: 'Other Projects', path: '/other-projects', element: OtherProjects},
]