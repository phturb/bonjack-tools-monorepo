import { Home, LoisDesNorms, LunaBot, CryptoTracker, ExpenseManager, OtherProjects } from "./pages";

export const homeRoute = {name: 'Home', path: '/', element: Home};
export const loisDesNormsRoute = {name: 'LoisDesNorms', path: '/lois-des-norms', element: LoisDesNorms};
export const cryptoTracker = {name: 'Crypto Tracker', path: '/crypto-tracker', element: CryptoTracker};
export const lunaBot = {name: 'Luna Bot', path: '/luna-bot', element: LunaBot}
export const expensesTracker = {name: 'Expense Tracker', path: '/expense-tracker', element: ExpenseManager};
export const otherProjects = {name: 'Other Projects', path: '/other-projects', element: OtherProjects};


export const routes = [
    homeRoute,
    loisDesNormsRoute,
    expensesTracker,
    cryptoTracker,
    lunaBot,
    otherProjects,
];

export const cryptoRoutes = {
    name: "Crypto", routes: [
        cryptoTracker, lunaBot
    ]
};

export const gamesToolRoutes = {
    name: "Games Tool", routes: [
        loisDesNormsRoute
    ]
};
