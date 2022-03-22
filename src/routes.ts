import { Home, LoisDesNorms, LunaBot, CryptoTracker } from "./pages";
import OtherProjects from "./pages/OtherProjects";

export const homeRoute = {name: 'Home', path: '/', element: Home};
export const loisDesNormsRoute = {name: 'LoisDesNorms', path: '/lois-des-norms', element: LoisDesNorms};
export const cryptoTracker = {name: 'Crypto Tracker', path: '/crypto-tracker', element: CryptoTracker};
export const lunaBot = {name: 'Luna Bot', path: '/luna-bot', element: LunaBot}
export const otherProjects = {name: 'Other Projects', path: '/other-projects', element: OtherProjects};

export const routes = [
    homeRoute,
    loisDesNormsRoute,
    cryptoTracker,
    lunaBot,
    otherProjects,
]

export const cryptoRoutes = {
    name: "Crypto", routes: [
        cryptoTracker, lunaBot
    ]
}

export const gamesToolRoutes = {
    name: "Games Tool", routes: [
        loisDesNormsRoute
    ]
}