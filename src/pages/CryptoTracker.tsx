import { Avatar, Container, Divider, Stack, List, ListItem, ListItemAvatar, ListItemText, Typography, Paper, CircularProgress } from "@mui/material";
import axios from "axios";
import { useQuery } from "react-query";
import CoinTracker from "../components/CryptoTracker/CoinTracker";

const cryptoIds = ["bitcoin",
    "ethereum",
    "crypto-com-chain",
    "iota",
    "elrond-erd-2",
    "terra-luna",
    "cardano",
    "solana",
    "kucoin-shares",
    "matic-network",
    "binancecoin"];

const queryCryptos = async () => {
    const cryptoList = [];
    for (const id of cryptoIds) {
        const coin = await axios.get(`https://api.coingecko.com/api/v3/coins/${id}?market_data=true`);
        cryptoList.push(coin.data);
    }
    return cryptoList

}

const CryptoTracker = (props: {}) => {

    const cryptos = useQuery("cryptos", queryCryptos, { refetchInterval: 120000 });
    let data;
    if (cryptos.status === "success") {
        if (cryptos.data) {
            data = cryptos.data;
        } else {
            data = [];
        }
    } else {
        data = [];
    }

    let content;
    if(cryptos.isLoading) {
        content = (<CircularProgress />)
    } else {
        content = (            <Paper>
            <List sx={{ bgcolor: 'background.paper' }}>
                {data?.map((x, index) => {
                    return (
                        <>
                            <CoinTracker {...x} />
                            {index !== data.length - 1 ? <Divider variant="inset" component="li" /> : null}
                        </>);
                })}
            </List>
        </Paper>);
    }

    return (
        <Container>
            <Typography variant="h4" component="h4" align="center">CryptoTracker</Typography>
            {content}
        </Container>
    );
}

export default CryptoTracker;