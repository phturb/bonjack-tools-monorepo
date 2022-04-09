import { PrismaClient } from "@prisma/client";

export const getPlayerStats = async (id: string, prisma: PrismaClient) => {
    const playerGames = await prisma.game.findMany({
        where : {OR : [{
                player1Id : {
                    equals: id
                }
            },
            {
                player2Id : {
                    equals: id
                }
            },
            {
                player3Id : {
                    equals: id
                }
            },
            {
                player4Id : {
                    equals: id
                }
            },
            {
                player5Id : {
                    equals: id
                }
            }],
        },
        include: {
            roll: true
        }
    });
    const gamesLength = playerGames.map(x => x.roll.length);
    return { numberOfGame: gamesLength.length,
             totalRoll: gamesLength.reduce((x, y,) => x + y, 0)
            };
};

export const getAllPlayerStats = async (prisma: PrismaClient) => {
    const players = await prisma.player.findMany();
    return players.map( async player => {
        return { ...player, stats : await getPlayerStats(player.id, prisma)};
    });
}
