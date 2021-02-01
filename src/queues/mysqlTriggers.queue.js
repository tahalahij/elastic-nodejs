import getChannel from '../connections/rabbit';
import { IndexesService } from '../services';
import config from '../config';

const {
    rabbit: {
        local,
        queues: { local: queue },
    },
} = config;

// the message content is a byte array
// takes buffer and return an object
function bufferToJson(content) {
    return JSON.parse(content.toString());
}

// callback function on message receive
async function onMessage(message, channel) {
    const content = bufferToJson(message.content);
    console.log('--------------');
    console.log('message from rabbit :', content);
    console.log('--------------');
    await IndexesService.handleTriggerMessages(content)
    channel.ack(message);
}

export default async function init() {
    const channel = await getChannel(local, queue);
    await channel.consume(queue, msg => onMessage(msg, channel));
    return channel;
}
