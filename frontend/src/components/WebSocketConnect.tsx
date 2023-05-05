import {Component, createSignal, Show} from 'solid-js'

export type WebSocketConnectProps = {
    onConnect: (websocket: WebSocket, loadHistory: boolean) => void
}

const WebSocketConnect: Component<WebSocketConnectProps> = (props) => {
    const [loading, setLoading] = createSignal(false)
    const [error, setError] = createSignal('')
    let checkboxElement: HTMLInputElement
    let urlElement: HTMLInputElement

    const connect = async () => {
        return new Promise((resolve, reject) => {
            setLoading(true)
            setError('')

            try {
                const ws = new WebSocket(urlElement.value)

                const onOpen = () => {
                    ws.removeEventListener('error', onError)

                    setLoading(false)
                    props.onConnect(ws, checkboxElement.checked)
                    resolve({
                        websocket: ws,
                        loadHistory: checkboxElement.checked
                    })
                }
                const onError = (err) => {
                    ws.removeEventListener('open', onOpen)

                    setLoading(false)
                    setError(err.toString())
                    reject(err)
                }

                ws.addEventListener('open', onOpen, {once: true})
                ws.addEventListener('error', onError, {once: true})
            } catch(err) {
                setLoading(false)
                setError(err.toString())
                reject(err)
            }
        })
    }

    return (
        <>
            <div class="flex flex-col items-center justify-center">
                <input type="text" placeholder="WebSocket URL" class="input input-bordered" ref={urlElement}/>
                <label class="label cursor-pointer">
                    <input type="checkbox" checked class="checkbox checkbox-primary" ref={checkboxElement}/>
                    <span class="label-text ml-2">Load message history</span>
                </label>
                <button class="btn btn-primary mt-3" classList={{loading: loading()}} onclick={connect}>Connect</button>
                <Show when={error()}>
                    <div class="alert alert-error shadow-lg mt-2">
                        {error()}
                    </div>
                </Show>
            </div>
        </>
    )
}

export default WebSocketConnect