#!/usr/bin/env node
import amqp from 'amqplib';
import { Logger } from '../utils';
import { LOG_LABELS } from '../constants/enums';

async function getChannel(config, queue) {
    try {
        const {
            protocol, userName, password, hostName, port, vHost,
        } = config;
        const connectionString = `${protocol}://${userName}:${password}@${hostName}:${port}${vHost}`;
        const connection = await amqp.connect(connectionString);
        const channel = await connection.createChannel();
        // we want to make sure the queues exists before we try to consume messages from it.
        await channel.assertQueue(queue, {
            // with durable true the queues will survive a RabbitMQ node restart
            // provider needs to set this option
            durable: true,
        });
        await channel.prefetch(2,false)
        console.log('rabbit connected with config', config)
        return channel;
    } catch (error) {
        Logger.error(LOG_LABELS.RABBIT_ERROR, error);
    }
}

export default getChannel;
