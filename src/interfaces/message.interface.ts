export interface Message {
    action: string,
    content: string
}

const createMessage = (action: string, content: any): Message => {
    return {
        action,
        content: JSON.stringify(content)
    }
}

export default { createMessage };