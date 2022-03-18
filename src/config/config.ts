import 'dotenv/config';

export const PORT: number | string =  process.env.PORT || 3001;
export const DISCORD_TOKEN: string | undefined = process.env.DISCORD_TOKEN;
export const CHANNEL_ID: string = process.env.CHANNEL_ID || '212369829582077953';
