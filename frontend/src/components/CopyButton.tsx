import {Component, createSignal, JSX, Show} from 'solid-js'
import {HiOutlineClipboardCopy} from 'solid-icons/hi'
import {FaRegularCircleCheck} from 'solid-icons/fa'

export type LogDisplayListElementProps = {
    copyCallback: () => Promise<boolean>
    children?: JSX.Element
}

const CopyButton: Component<LogDisplayListElementProps> = (props) => {
    const [copied, setCopied] = createSignal(false)

    const copy = async () => {
        if(await props.copyCallback()) {
            setCopied(true)
            setTimeout(() => setCopied(false), 3000)
        }
    }

    return (
        <>
            <button class="btn gap-2" classList={{'btn-success': copied()}} onClick={copy}>
                <Show when={copied()} fallback={<>
                    <HiOutlineClipboardCopy />
                    {props.children}
                </>}>
                    <FaRegularCircleCheck />
                    Copied!
                </Show>
            </button>
        </>
    )
}

export default CopyButton