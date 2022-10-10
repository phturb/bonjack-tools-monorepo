import React from "react";
import {
  Paper,
  Table,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableBody,
  Grid,
  CircularProgress,
  Container,
  Typography,
} from "@mui/material";
import { useQuery } from "react-query";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { getPrices } from "../api/prices";
import { getLoops } from "../api/loops";
import { getTxs, Tx } from "../api/txs";
import moment from "moment";

const LunaBot = () => {
  const query = useQuery("data-luna", async () => {
    const txs = await getTxs();
    const prices = await getPrices();
    const loops = await getLoops();
    return { txs, prices, loops };
  });

  if (query.isLoading) {
    return (
      <Container>
        <Typography variant="h4" component="h4" align="center">
          Luna Bot
        </Typography>
        <CircularProgress />
      </Container>
    );
  }

  if (query.isError) {
    console.log(query.error);
    return (
      <Container>
        <Typography variant="h4" component="h4" align="center">
          Luna Bot
        </Typography>
        <Typography>
          Something went wrong: {(query.error as any).message} !
        </Typography>
      </Container>
    );
  }

  if (!query.data) {
    return (
      <Container>
        <Typography variant="h4" component="h4" align="center">
          Luna Bot
        </Typography>
        <Typography>No data !</Typography>
      </Container>
    );
  }

  return (
    <Container>
      <Typography variant="h4" component="h4" align="center">
        Luna Bot
      </Typography>
      <Grid container>
        <Grid item>
          <Paper>{(query.data.loops as any[]).length}</Paper>
        </Grid>
        <Grid item>
          <Paper>{(query.data.txs as any[]).length}</Paper>
        </Grid>
        <Grid item>
          <Paper>{(query.data.prices as any[]).length}</Paper>
        </Grid>
      </Grid>

      <LineChart
        width={500}
        height={300}
        data={(query.data.prices as any).slice(
          (query.data.prices as any).length - 10000,
          (query.data.prices as any).length - 1
        )}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="timestamp"
          type="number"
          tickFormatter={(timeStr) => moment(timeStr).format("HH:mm")}
        />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="bLunaPrice"
          stroke="#8884d8"
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="lunaPrice"
          stroke="#82ca9d"
          dot={false}
        />
      </LineChart>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="Transactions Table">
          <TableHead>
            <TableRow>
              <TableCell>Tx Hash</TableCell>
              <TableCell align="right">Loop Id</TableCell>
              <TableCell align="right">Timestamp</TableCell>
              <TableCell align="right">Amount&nbsp;In</TableCell>
              <TableCell align="right">Amount&nbsp;Out</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(query.data.txs as any).map((row: Tx) => (
              <TableRow
                key={row.txHash}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  <a
                    href={`https://finder.terra.money/mainnet/tx/${row.txHash}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {row.txHash}
                  </a>
                </TableCell>
                <TableCell align="right">{row.loopId}</TableCell>
                <TableCell align="right">{row.timestamp}</TableCell>
                <TableCell align="right">{row.amountIn}</TableCell>
                <TableCell align="right">{row.amountOut}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default LunaBot;
