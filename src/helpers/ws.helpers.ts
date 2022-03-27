import {WebSocket, Server as WebSocketServer} from "ws";

const broadcast = (wsServer: WebSocketServer, content: any, sender?: WebSocket | undefined) => {
    console.log(content);
    wsServer.clients.forEach(client => {
        if ( sender || sender === client ) return;
        client.send(JSON.stringify(content));
    })
} 

const send = (content: any, receiver: WebSocket) => {
    receiver.send(JSON.stringify(content));
}


export {broadcast, send}