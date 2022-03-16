import { useEffect, useState } from "react";
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
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "react-query";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { getPrices } from "../api/prices";
import { getLoops } from "../api/loops";
import { getTxs, Tx } from "../api/txs";
import moment from "moment";

export type LunaBotProperties = {};

const LunaBot = (props: LunaBotProperties) => {
  const [data, setData] = useState([]);

  const queryClient = useQueryClient();

  const txsQuery = useQuery("tx-data", getTxs);
  const pricesQuery = useQuery("price-data", getPrices);
  const loopsQuery = useQuery("loop-data", getLoops);

  if (pricesQuery.status !== "success" && txsQuery.status !== "success" && loopsQuery.status !== "success") {
    return <div>
        <CircularProgress />
    </div>;
  }

  return (
    <div>

      <Grid container>
          <Grid item>
            <Paper >
                {(loopsQuery.data as any[]).length}
            </Paper>
          </Grid>
          <Grid item>
            <Paper >
                {(txsQuery.data as any[]).length}
            </Paper>
          </Grid>
          <Grid item>
            <Paper >
                {(pricesQuery.data as any[]).length}
            </Paper>
          </Grid>
      </Grid>

      <LineChart
        width={500}
        height={300}
        data={(pricesQuery.data as any).slice(
          (pricesQuery.data as any).length - 10000,
          (pricesQuery.data as any).length - 1
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
            {(txsQuery.data as any).map((row: Tx) => (
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
    </div>
  );
};

export default LunaBot;
