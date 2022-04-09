import 'dotenv/config';

export const PORT: number | string =  process.env.PORT || 3001;
export const DISCORD_TOKEN: string | undefined = process.env.DISCORD_TOKEN;
export const CHANNEL_ID: string = process.env.CHANNEL_ID || '212369829582077953';
export const TIMER_TIME: number = 10*1000*1;
export const TEXT_CHANNEL_ID: string = process.env.TEXT_CHANNEL_ID || '212369747973636097';
