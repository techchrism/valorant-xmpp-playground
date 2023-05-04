import {Component, createEffect, Show} from 'solid-js';
import Home from './pages/Home'
import {createSignal} from 'solid-js'
import {ParsedLog} from './fileParser'
import LogDisplay from './pages/LogDisplay'

const App: Component = () => {
    const [parsedLog, setParsedLog] = createSignal<ParsedLog | undefined>(undefined)

    return (
        <>
            <Show when={parsedLog() !== undefined} fallback={<Home onUpload={parsed => setParsedLog(parsed)}/>}>
                <LogDisplay parsedLog={parsedLog()}/>
            </Show>
        </>
    )
}

export default App;
