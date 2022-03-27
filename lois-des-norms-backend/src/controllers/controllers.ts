import { PrismaClient } from "@prisma/client";
import cors from "cors";
import { Application, Request, Response } from "express";

const configureExpressApplication = (app: Application, prisma: PrismaClient) => {
    app.use(cors());

    app.get("/players", async (req: Request, res: Response) => {
        const players = await prisma.player.findMany();
        res.json(players);
    });
    
    app.get("/games", async (req: Request, res: Response) => {
        const games = await prisma.game.findMany();
        res.json(games);
    });
    
    
    app.get("/rolls", async (req: Request, res: Response) => {
        const rolls = await prisma.roll.findMany();
        res.json(rolls);
    });

    return app;
}

export default configureExpressApplication;