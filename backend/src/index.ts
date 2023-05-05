import {CredentialManager} from './CredentialManager'
import {XMPPManager} from './XMPPManager'
import * as winston from 'winston'
import 'winston-daily-rotate-file'
import {promises as fs} from 'node:fs'
import {WebSocketManager} from './WebSocketManager'

interface ConfigFile {
    host: string
    streamID: string
    websocket: {
        port: number
        host: string
    }
}

(async () => {
    const logger = winston.createLogger({
        level: 'silly',
        transports: [
            new winston.transports.Console({
                level: 'info',
                format: winston.format.combine(
                    winston.format.colorize(),
                    winston.format.padLevels(),
                    winston.format.simple()
                )
            }),
            new winston.transports.DailyRotateFile({
                level: 'silly',
                dirname: 'logs',
                filename: 'log-%DATE%.log',
                zippedArchive: true,
                format: winston.format.combine(
                    winston.format.timestamp(),
                    winston.format.json()
                )
            })
        ]
    })

    const config = JSON.parse(await fs.readFile('./config.json', 'utf-8')) as ConfigFile

    logger.info('Starting...')

    const credentialManager = new CredentialManager(logger)
    const xmppManager = new XMPPManager(credentialManager, logger)
    const websocketManager = new WebSocketManager(logger, xmppManager)

    await xmppManager.connect(config.host, config.streamID)
    await websocketManager.start(config.websocket.port, config.websocket.host)

    logger.info(`Started WebSocket server on ${config.websocket.host}:${config.websocket.port}`)
})()

export {}