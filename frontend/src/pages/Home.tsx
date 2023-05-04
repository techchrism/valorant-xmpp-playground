import type {Component} from 'solid-js'
import FileUpload from '../components/FileUpload'
import {ParsedLog} from '../fileParser'

export type HomeProps = {
    onUpload: (parsedLog: ParsedLog) => void
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

                    <FileUpload onParse={props.onUpload}/>
                </div>
            </div>
        </div>
    )
}

export default Home
