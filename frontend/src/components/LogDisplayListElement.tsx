import {Component, createMemo, Show} from 'solid-js'
import {ParsedLog} from '../fileParser'
import {FiArrowDownLeft, FiArrowUpRight} from 'solid-icons/fi'

export type LogDisplayListElementProps = {
    item: ParsedLog['xml'][0]
}

const LogDisplayListElement: Component<LogDisplayListElementProps> = (props) => {
    const first = createMemo(() => props.item.buffer[0])
    const time = createMemo(() => new Date(first().time))
    const length = createMemo(() => props.item.buffer.reduce((prev, curr) => prev + curr.data.length, 0))

    const title = createMemo(() => {
        switch(props.item.parsed.type) {
            case 'chat': return 'Chat'
            case 'query': return props.item.buffer[0].type === 'incoming' ? 'Query Response' : 'Query'
            case 'presence': return 'Presence Update'
            default: return 'Item'
        }
    })

    const subtitle = createMemo(() => {
        switch(props.item.parsed.type) {
            case 'chat': return props.item.parsed.message
            case 'query': return props.item.parsed.id
            default: return undefined
        }
    })

    return (
        <>
            <div class="flex flex-row items-center space-x-3 w-full max-w-full">
                <div>
                    <Show when={first().type === 'incoming'} fallback={<FiArrowUpRight color="#3B82F6"/>}>
                        <FiArrowDownLeft color="#F97316"/>
                    </Show>
                </div>
                <div class="flex-grow overflow-hidden">
                    {title()}
                    <Show when={subtitle() !== undefined}>
                        <p class="whitespace-nowrap text-ellipsis">{subtitle()}</p>
                    </Show>

                </div>
                <div class="text-center whitespace-nowrap">
                    {`${time().getHours()}:${time().getMinutes()}`}
                    <p class="font-light">{`${Math.round(length() / 100) / 10} Kb`}</p>
                </div>
            </div>

        </>
    )
}

export default LogDisplayListElement