import type {Component} from 'solid-js'
import WebSocketConnect from '../components/WebSocketConnect'

export type HomeProps = {
    onWebSocketConnect: (websocket: WebSocket, loadHistory: boolean) => void
}

const Home: Component<HomeProps> = (props) => {
    return (
        <div class="hero mt-20 bg-base-200">
            <div class="hero-content text-center">
                <div class="max-w-2xl">
                    <h1 class="text-5xl font-bold">Valorant XMPP Playground</h1>
                    <p class="py-6">
                        This is a tool to send and view Valorant XMPP messages.
                        Based on <a class="link" href="https://github.com/techchrism/valorant-xmpp-log-viewer">Valorant XMPP Log Viewer</a>.
                    </p>

                    <WebSocketConnect onConnect={props.onWebSocketConnect}/>
                </div>
            </div>
        </div>
    )
}

export default Home
