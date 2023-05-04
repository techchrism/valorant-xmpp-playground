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

interface DataLogEvent extends EventBase {
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

export async function parseFile(file: File): Promise<ParsedLog> {
    const lines = (await file.text()).split('\n')
    let header: HeaderData
    try {
        header = JSON.parse(lines[0])
        if(!header.version || header.type !== 'valorant-xmpp-logger') {
            throw new Error('missing version or type')
        }
    } catch(e) {
        throw new Error(`Invalid log file (bad header - ${e})`)
    }

    const parsed: ParsedLog = {
        version: header.version,
        events: [],
        xml: []
    }

    for(let i = 1; i < lines.length; i++) {
        const line = lines[i]
        if(line.length === 0 || line.startsWith('#')) continue

        parsed.events.push(JSON.parse(line))
    }

    const defaultParserOptions = {
        ignoreAttributes: false,
        suppressEmptyNode: true,
        suppressUnpairedNode: true,
        attributeNamePrefix: ''
    }
    const xmlParser = new XMLParser(defaultParserOptions)

    let inputBuffer: DataLogEvent[] = []
    let outputBuffer: DataLogEvent[] = []
    for(const event of parsed.events) {
        if(event.type !== 'outgoing' && event.type !== 'incoming') continue
        if(event.data === ' ' || event.data.startsWith('<?')) continue

        const buffer = (event.type === 'outgoing' ? outputBuffer : inputBuffer)
        buffer.push(event)

        const bufferText = buffer.reduce((prev, curr) => prev + curr.data, '')
        const valid = XMLValidator.validate(`<root>${bufferText}</root>`)

        if(valid === true) {
            const data = xmlParser.parse(bufferText)
            parsed.xml.push({
                buffer: [...buffer],
                data,
                parsed: parseData(data)
            })

            buffer.length = 0
        }
    }

    return parsed
}