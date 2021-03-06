import { Stack, Typography, ListItem, ListItemAvatar, Avatar, ListItemText } from "@mui/material";


const CoinTracker = (props: any) => {
    const coinDetail = (
        <Stack direction="row" spacing={2}>
            <Typography>Price: {props.market_data.current_price.usd}</Typography>
            <Typography>Percentage Change: <span style={{color: props.market_data.price_change_percentage_24h <= 0 ? 'red' : 'green'}}>{props.market_data.price_change_percentage_24h}</span></Typography>
        </Stack>

    );

    return (
        <ListItem>
            <ListItemAvatar>
                <Avatar alt={props.name} src={props.image.thumb} />
            </ListItemAvatar>
            <ListItemText primary={props.name} secondary={coinDetail} />
        </ListItem>);

}

export default CoinTracker;
