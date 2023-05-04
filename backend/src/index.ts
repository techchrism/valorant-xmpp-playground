import {CredentialManager} from './CredentialManager'
import {XMPPManager} from './XMPPManager'
import * as winston from 'winston'
import 'winston-daily-rotate-file'
import {promises as fs} from 'node:fs'

interface ConfigFile {
    host: string
    streamID: string
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
    await xmppManager.connect(config.host, config.streamID)
})()

export {}