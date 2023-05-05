import {Logger} from 'winston'
import {HistoryItem, XMPPManager} from './XMPPManager'
import WebSocket, {WebSocketServer} from 'ws'

export class WebSocketManager {
    private readonly _logger: Logger
    private readonly _xmppManager: XMPPManager

    constructor(logger: Logger, xmppManager: XMPPManager) {
        this._logger = logger
        this._xmppManager = xmppManager
    }

    async start(port: number, host: string) {
        this._logger.info(`Starting WebSocket server on ${host}:${port}...`)
        const wss = new WebSocketServer({port, host})

        wss.on('connection', (ws: WebSocket) => {
            this._logger.info('WebSocket connection established')

            const messageHandler = (message: HistoryItem) => {
                ws.send(JSON.stringify(message))
            }
            this._xmppManager.on('message', messageHandler)

            ws.on('message', (message: string) => {
                this._logger.verbose(`Received message: ${message}`)
                try {
                    const parsedMessage = JSON.parse(message)
                    if(parsedMessage.type === 'send') {
                        this._xmppManager.sendMessage(parsedMessage.data)
                    } else if(parsedMessage.type === 'history') {
                        for(const historyItem of this._xmppManager.getHistory()) {
                            ws.send(JSON.stringify(historyItem))
                        }
                    }
                } catch (ignored) {}
            })

            ws.on('close', () => {
                this._logger.info('WebSocket connection closed')
                this._xmppManager.removeListener('message', messageHandler)
            })
        })
    }
}