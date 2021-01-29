export default function messageComposer(message, ...args) {
    args.forEach((w) => {
        message = message.replace('*', w);
    });
    return message;
}
