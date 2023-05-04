import type {Component} from 'solid-js'
import {createEffect, createResource, createSignal, Show} from 'solid-js'
import {ParsedLog, parseFile} from '../fileParser'

export type FileUploadProps = {
    onParse: (parsedLog: ParsedLog) => void
}

async function readFile(file: File | undefined): Promise<ParsedLog | undefined> {
    if(file === undefined) {
        return undefined
    }
    return parseFile(file)
}

const FileUpload: Component<FileUploadProps> = (props) => {
    let hiddenInput
    const [file, setFile] = createSignal<File | undefined>(undefined)
    const [parsedData] = createResource(file, readFile)

    createEffect(() => {
        const parsed = parsedData()
        if(parsed !== undefined) {
            props.onParse(parsed)
        }
    })

    function uploadClick() {
        hiddenInput.click()
    }

    function onChanged(event: Event) {
        setFile((event.target as HTMLInputElement).files[0])
    }

    return (
        <>
            <input type="file" accept=".txt" class="hidden" ref={hiddenInput} onChange={onChanged}/>
            <button class="btn btn-primary" classList={{loading: parsedData.loading}} onClick={uploadClick}>Click to Upload</button>
            <Show when={parsedData.state === 'errored'}>
                <div class="alert alert-error shadow-lg mt-2">
                    <div>
                        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span>{parsedData.error.toString()}</span>
                    </div>
                </div>
            </Show>
        </>
    )
}

export default FileUpload
