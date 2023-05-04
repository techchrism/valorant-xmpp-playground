import {Component, createEffect, createMemo, createSignal, Show} from 'solid-js'
import CopyButton from './CopyButton'
import {ParsedLog} from '../fileParser'
import {XMLParser} from 'fast-xml-parser'

export type LogElementDetailsProps = {
    item: ParsedLog['xml'][0]
}

const LogElementDetails: Component<LogElementDetailsProps> = (props) => {
    const [attributePrefix, setAttributePrefix] = createSignal('')
    const jsonData = createMemo(() => {
        const xmlParser = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: attributePrefix()
        })
        return xmlParser.parse(props.item.buffer.map(b => b.data).join(''))
    })

    let jsonViewer
    let presenceJsonViewer
    createEffect(() => {
        if(props.item) {
            jsonViewer.expandAll()
        }
        if(props.item.parsed.type === 'presence') {
            presenceJsonViewer.expandAll()
        }
    })

    const copyXML = async () => {
        try {
            await navigator.clipboard.writeText(props.item.buffer.map(b => b.data).join(''))
            return true
        } catch(ignored) {
            return false
        }
    }

    const copyJSON = async () => {
        try {
            await navigator.clipboard.writeText(JSON.stringify(jsonData(), null, 4))
            return true
        } catch(ignored) {
            return false
        }
    }

    const copyPresenceJSON = async () => {
        try {
            if(props.item.parsed.type === 'presence') {
                await navigator.clipboard.writeText(JSON.stringify(props.item.parsed.data, null, 4))
                return true
            }
            return false
        } catch(ignored) {
            return false
        }
    }

    return (
        <>
            <div tabindex="0" class="collapse collapse-plus border bg-base-200 rounded-box">
                <input type="checkbox"/>
                <div class="collapse-title text-xl font-medium">
                    XML Data
                </div>
                <div class="collapse-content">
                    <div class="mb-2">
                        <CopyButton copyCallback={copyXML}>
                            Copy XML
                        </CopyButton>
                    </div>
                    <code class="break-all">
                        {props.item.buffer.map(b => b.data).join('')}
                    </code>
                </div>
            </div>

            <div tabindex="0" class="collapse collapse-plus border bg-base-200 rounded-box">
                <input type="checkbox" checked/>
                <div class="collapse-title text-xl font-medium">
                    Interactive JSON Representation
                </div>
                <div class="collapse-content break-all">
                    <label class="label cursor-pointer justify-start space-x-2">
                        <input type="checkbox" class="toggle toggle-info" onClick={(e) => setAttributePrefix((e.target as HTMLInputElement).checked ? '@_' : '')}/>
                        <span class="label-text">Attribute Prefix</span>
                    </label>
                    <div class="mb-2">
                        <CopyButton copyCallback={copyJSON}>
                            Copy JSON
                        </CopyButton>
                    </div>
                    <json-viewer data={jsonData()} ref={jsonViewer}></json-viewer>
                </div>
            </div>

            <Show when={props.item.parsed.type === 'presence'}>
                <div tabindex="0" class="collapse collapse-plus border bg-base-200 rounded-box">
                    <input type="checkbox" checked/>
                    <div class="collapse-title text-xl font-medium">
                        Decoded Presence Data
                    </div>
                    <div class="collapse-content break-all">
                        <div class="mb-2">
                            <CopyButton copyCallback={copyPresenceJSON}>
                                Copy JSON
                            </CopyButton>
                        </div>
                        <json-viewer data={props.item.parsed.type === 'presence' ? props.item.parsed.data : {}} ref={presenceJsonViewer}></json-viewer>
                    </div>
                </div>
            </Show>
        </>
    )
}

export default LogElementDetails