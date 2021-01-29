import getChannel from '../connections/rabbit';
import ElasticSearch from '../utils/elasticSearch';
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
    console.log('content.document :', content.document);
    const x = JSON.parse(JSON.stringify(content.document))
    console.log('x :', x);
    console.log('body :', x.body);
    try {
        await ElasticSearch.getIndex({ index: content.model.trim() })
    } catch (e) {
        console.log(e)
        if (e.meta.statusCode===404) {
            const setIndex = await ElasticSearch.setIndex({ index: content.model.trim(), body: content.document })
            console.log({ setIndex })

        }
    }
    channel.ack(message);
}

export default async function init() {
    const channel = await getChannel(local, queue);
    await channel.consume(queue, msg => onMessage(msg, channel));
    return channel;
}
