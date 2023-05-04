import {Component, ComponentProps, createMemo, createSignal, Show} from 'solid-js'
import {ParsedLog} from '../fileParser'
import {FiArrowDownLeft, FiArrowUpRight, FiFilter} from 'solid-icons/fi'
import '@alenaksu/json-viewer'
import {VirtualContainer, VirtualItemProps} from '@minht11/solid-virtual-container'
import LogDisplayListElement from '../components/LogDisplayListElement'
import GitHubStar from '../components/GitHubStar'
import LogElementDetails from '../components/LogElementDetails'

// Types for the json-viewer component, modified from https://stackoverflow.com/a/72239265
declare module 'solid-js' {
    namespace JSX {
        interface IntrinsicElements {
            "json-viewer": ComponentProps<"div"> & { data: any }
        }
    }
}

export type LogDisplayProps = {
    parsedLog: ParsedLog
}

const LogDisplay: Component<LogDisplayProps> = (props) => {
    let sidebarElement!: HTMLElement
    const [activeIndex, setActiveIndex] = createSignal(0)
    const [search, setSearch] = createSignal('')

    // Filters
    const [showIncoming, setShowIncoming] = createSignal(true)
    const [showOutgoing, setShowOutgoing] = createSignal(true)

    const items = createMemo(() => {
        return props.parsedLog.xml
            .filter(item => item.buffer[0].type !== 'incoming' || showIncoming())
            .filter(item => item.buffer[0].type !== 'outgoing' || showOutgoing())
            .filter(item => item.buffer.some(buffer => buffer.data.includes(search())))
    })
    const activeItem = createMemo(() => items()[activeIndex()])

    const ListItem = (props: VirtualItemProps<ParsedLog['xml'][0]>) => {
        return (
            <>
                <li style={props.style} class='w-full' tabIndex={props.tabIndex} role="listitem">
                    <a class="w-full py-1 px-2 border-y border-base-100" classList={{active: props.index === activeIndex()}} onClick={() => setActiveIndex(props.index)}>
                        <LogDisplayListElement item={props.item} />
                    </a>
                </li>
            </>
        )
    }

    return (
        <>
            <div class="min-h-screen md:grid md:grid-cols-main">
                <aside class="md:sticky top-0 left-0 md:h-screen overflow-y-auto" aria-label="Sidebar" ref={sidebarElement}>
                    <div class="sticky top-0 z-10 bg-base-300 py-2">
                        <h1 class="text-xl font-semibold text-center mb-2">Valorant XMPP Log Viewer</h1>
                        <div class="text-center pb-2">
                            <GitHubStar user="techchrism" repo="valorant-xmpp-log-viewer"/>
                        </div>

                        <div class="mx-2 flex flex-row">
                            <input type="text" class="input mr-2 flex-grow" placeholder="Search..." oninput={(e) => {setSearch((e.target as HTMLInputElement).value)}}/>
                            <div class="dropdown dropdown-end">
                                <label tabindex="0" class="btn"><FiFilter title="Filter"/></label>
                                <div tabindex="0" class="dropdown-content p-2 shadow bg-base-100 rounded-box w-52">
                                    <label class="label cursor-pointer">
                                        <span class="label-text"><FiArrowDownLeft color="#F97316" class="inline"/> Incoming</span>
                                        <input type="checkbox" checked class="checkbox" onClick={(e) => setShowIncoming((e.target as HTMLInputElement).checked)}/>
                                    </label>
                                    <label class="label cursor-pointer">
                                        <span class="label-text"><FiArrowUpRight color="#3B82F6" class="inline"/> Outgoing</span>
                                        <input type="checkbox" checked class="checkbox" onClick={(e) => setShowOutgoing((e.target as HTMLInputElement).checked)}/>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <ul class="menu bg-base-200 text-base-content">
                        <VirtualContainer items={items()} itemSize={{height: 58}} scrollTarget={sidebarElement}>
                            {ListItem}
                        </VirtualContainer>
                    </ul>
                </aside>
                <main class="p-5 flex flex-col space-y-5">
                    <Show when={activeItem()}>
                        <LogElementDetails item={activeItem()}/>
                    </Show>
                </main>
            </div>
        </>
    )
}

export default LogDisplay