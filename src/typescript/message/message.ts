export interface Message {
    requestId?: number;
    messageType: string;
    className: string;
    data: object;
}
