import {Component, createSignal, For} from 'solid-js'
import {XMLBuilder} from 'fast-xml-parser'

type MessageAddProps = {
    onSend: (message: string) => void
}

interface MessageTemplate {
    name: string
    json: Object
}

const templates: MessageTemplate[] = [
    {
        name: 'Presence',
        json: {
            "presence": {
                "games": {
                    "keystone": {
                        "st": "chat",
                        "s.t": 1683240498396,
                        "m": "",
                        "s.p": "keystone"
                    },
                    "valorant": {
                        "st": "dnd",
                        "p": {
                            "isValid": true,
                            "sessionLoopState": "INGAME",
                            "partyOwnerSessionLoopState": "INGAME",
                            "customGameName": "",
                            "customGameTeam": "",
                            "partyOwnerMatchMap": "/Game/Maps/Pitt/Pitt",
                            "partyOwnerMatchCurrentTeam": "",
                            "partyOwnerMatchScoreAllyTeam": 10,
                            "partyOwnerMatchScoreEnemyTeam": 20,
                            "partyOwnerProvisioningFlow": "Matchmaking",
                            "provisioningFlow": "Matchmaking",
                            "matchMap": "/Game/Maps/Pitt/Pitt",
                            "partyId": "00000000-0000-0000-0000-000000000000",
                            "isPartyOwner": true,
                            "partyState": "DEFAULT",
                            "partyAccessibility": "CLOSED",
                            "maxPartySize": 5,
                            "queueId": "deathmatch",
                            "partyLFM": false,
                            "partyClientVersion": "release-06.08-shipping-19-875485",
                            "partySize": 2,
                            "tournamentId": "",
                            "rosterId": "",
                            "partyVersion": 1683240978688,
                            "queueEntryTime": "2023.05.04-22.56.01",
                            "playerCardId": "4ca63988-4ca6-2911-a1b5-98a4b765dffd",
                            "playerTitleId": "0fa48078-4978-cea8-c417-13972c5f981d",
                            "preferredLevelBorderId": "",
                            "accountLevel": 100,
                            "competitiveTier": 10,
                            "leaderboardPosition": 0,
                            "isIdle": false
                        },
                        "s.p": "valorant",
                        "s.t": 1683241477034
                    }
                },
                "show": "chat",
                "status": "",
                "@_id": "presence_id"
            }
        }
    }, {
        name: 'Friend Request',
        json: {
            "iq": {
                "@_type": "set",
                "@_id": "roster_add_id",
                "query": {
                    "@_xmlns": "jabber:iq:riotgames:roster",
                    "item": {
                        "@_subscription": "pending_out",
                        "id": {
                            "@_name": "username",
                            "@_tagline": "tagline"
                        }
                    }
                }
            }
        }
    }
]

const MessageAdd: Component<MessageAddProps> = (props) => {
    let jsonInput: HTMLTextAreaElement
    const [xmlPreview, setXmlPreview] = createSignal('')
    const builder = new XMLBuilder({ignoreAttributes: false})

    const rebuildPreview = () => {
        try {
            const json = JSON.parse(jsonInput.value)
            if(json.hasOwnProperty('presence') &&
                json.presence.hasOwnProperty('games') &&
                json.presence.games.hasOwnProperty('valorant') &&
                json.presence.games.valorant.hasOwnProperty('p')
            ) {
                json.presence.games.valorant.p = btoa(JSON.stringify(json.presence.games.valorant.p))
            }
            const xml = builder.build(json)
            setXmlPreview(xml)
        } catch(e) {
            setXmlPreview(jsonInput.value)
        }
    }

    const activateTemplate = (template: MessageTemplate) => {
        jsonInput.value = JSON.stringify(template.json, null, 4)
        rebuildPreview()
    }

    return (
        <>
            <h3 class="text-lg font-bold text-center">Add Message</h3>
            <div>
                <div class="divider">Templates</div>

                <div class="flex flex-row space-x-2 justify-center">
                    <For each={templates}>
                        {(template) => (<>
                            <button class="btn btn-sm btn-primary" onclick={() => activateTemplate(template)}>{template.name}</button>
                        </>)}
                    </For>
                </div>

                <div class="divider">JSON</div>

                <textarea class="textarea h-48 w-full outline outline-1" placeholder="JSON" onInput={rebuildPreview} ref={jsonInput}></textarea>

                <div class="divider">Preview</div>

                <code class="text-sm w-full bg-base-300 block p-2 break-all">{xmlPreview()}</code>

                <div class="divider"/>

                <div class="text-center">
                    <button class="btn btn-success" onClick={() => {props.onSend(xmlPreview())}}>Send</button>
                </div>
            </div>
        </>
    )
}

export default MessageAdd