import {Component, Show} from 'solid-js';
import Home from './pages/Home'
import {createSignal} from 'solid-js'
import LogDisplay from './pages/LogDisplay'

const App: Component = () => {
    const [websocket, setWebsocket] = createSignal<WebSocket | undefined>(undefined)
    const [requestHistory, setRequestHistory] = createSignal(false)

    const onConnect = (websocket: WebSocket, loadHistory: boolean) => {
        setRequestHistory(loadHistory)
        setWebsocket(websocket)
    }

    return (
        <>
            <Show when={websocket() !== undefined} fallback={<Home onWebSocketConnect={onConnect}/>}>
                <LogDisplay requestHistory={requestHistory()} websocket={websocket()}/>
            </Show>
        </>
    )
}

export default App;
