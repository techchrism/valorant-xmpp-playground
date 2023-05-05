import {XMLParser, XMLValidator} from 'fast-xml-parser'

type OpenValorantEventType = 'open-valorant'
type OpenCloseEventTypes = 'close-valorant' | 'open-riot' | 'close-riot'
type DataEventTypes = 'outgoing' | 'incoming'

interface HeaderData {
    type: 'valorant-xmpp-logger'
    version: string
}

interface EventBase {
    time: number
}

interface OpenCloseLogEvent extends EventBase {
    type: OpenCloseEventTypes
    socketID: number
}

interface OpenValorantLogEvent extends EventBase {
    type: OpenValorantEventType
    socketID: number
    host: string
    port: number
}

export interface DataLogEvent extends EventBase {
    type: DataEventTypes
    data: string
}

export type LogEvent = OpenValorantLogEvent | OpenCloseLogEvent | DataLogEvent

export interface ParsedLog {
    version: string
    events: LogEvent[]
    xml: {
        buffer: DataLogEvent[]
        data: any
        parsed: {
            type: 'unknown'
        } | {
            type: 'chat'
            message: string
        } | {
            type: 'query'
            id: string
        } | {
            type: 'presence'
            data: any
        }
    }[]
}

function parseData(data: any): ParsedLog['xml'][0]['parsed'] {
    if(data.hasOwnProperty('message')) {
        return {
            type: 'chat',
            message: data.message.body
        }
    }

    if(data.hasOwnProperty('iq') && data.iq.hasOwnProperty('id')) {
        return {
            type: 'query',
            id: data.iq.id
        }
    }

    if(data.hasOwnProperty('presence') && Object.keys(data).length === 1) {
        try {
            const presenceData = JSON.parse(atob(data.presence.games.valorant.p))
            return {
                type: 'presence',
                data: presenceData
            }
        } catch(ignored) {}
    }

    return {type: 'unknown'}
}

export class StreamingParser {
    private _inputBuffer: DataLogEvent[] = []
    private _outputBuffer: DataLogEvent[] = []
    private _parser: XMLParser

    constructor() {
        const defaultParserOptions = {
            ignoreAttributes: false,
            suppressEmptyNode: true,
            suppressUnpairedNode: true,
            attributeNamePrefix: ''
        }
        this._parser = new XMLParser(defaultParserOptions)
    }

    parse(event: DataLogEvent): ParsedLog['xml'][0] | void {
        if(event.type !== 'outgoing' && event.type !== 'incoming') return
        if(event.data === ' ' || event.data.startsWith('<?')) return

        const buffer = (event.type === 'outgoing' ? this._outputBuffer : this._inputBuffer)
        buffer.push(event)

        const bufferText = buffer.reduce((prev, curr) => prev + curr.data, '')
        const valid = XMLValidator.validate(`<root>${bufferText}</root>`)

        if(valid === true) {
            const data = this._parser.parse(bufferText)
            const ret = {
                buffer: [...buffer],
                data,
                parsed: parseData(data)
            }
            buffer.length = 0
            return ret
        }
    }
}