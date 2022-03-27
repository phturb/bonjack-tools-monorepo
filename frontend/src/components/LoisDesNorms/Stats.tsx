import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useTheme } from '@mui/material/styles';

const Stats = (props: { availablePlayers: any }) => {
  const stats = Object.entries(props.availablePlayers).filter(x => x[1] && (x[1] as any).name && (x[1] as any).stats).map((ap) => {
    const preliminaryStats = {
      id: ap[0],
      name: (ap[1] as any).name,
      numberOfGame: (ap[1] as any).stats.numberOfGame as number,
      totalRoll: (ap[1] as any).stats.totalRoll as number,
    };
    if (preliminaryStats.numberOfGame === 0 || preliminaryStats.totalRoll === 0) {
      return { ...preliminaryStats, winRate: 0 };
    }
    return { ...preliminaryStats, winRate: preliminaryStats.numberOfGame / preliminaryStats.totalRoll * 100 };
  });

  const preliminaryTeamStats = {
    id: '0',
    name: 'Team',
    numberOfGame: stats.reduce((x, y) => x + y.numberOfGame, 0),
    totalRoll: stats.reduce((x, y) => x + y.totalRoll, 0),
  };
  let teamStats;
  if (preliminaryTeamStats.numberOfGame === 0 || preliminaryTeamStats.totalRoll === 0) {
    teamStats = { ...preliminaryTeamStats, winRate: 0 };
  } else {

    teamStats = { ...preliminaryTeamStats, winRate: preliminaryTeamStats.numberOfGame / preliminaryTeamStats.totalRoll * 100 };
  }

  stats.push(teamStats);

  const theme = useTheme();

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart

        data={stats}
        margin={{
          top: 10,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis domain={[0, 100]} />
        <Tooltip />
        <Bar dataKey="winRate" name="Win Rate" fill={theme.palette.secondary.main} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default Stats;
