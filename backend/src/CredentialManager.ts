import {promises as fs} from 'node:fs'
import {Logger} from "winston";
import fetch from "node-fetch";

// From https://github.com/techchrism/valorant-api/blob/trunk/src/credentialManager/LocalCredentialManager.ts
// Subtracts this amount from expiration to avoid requesting resources with an about-to-expire cred
const expirationDiff = 60 * 1000
const ssidRegex = new RegExp('ssid=(.+?);')

export class CredentialManager {
    private _entitlement: string | null = null
    private _token: string | null = null
    private _expiration: number = 0
    private _ssid: string | null = null
    private readonly _logger: Logger

    constructor(logger: Logger) {
        this._logger = logger
    }

    async getToken(): Promise<string> {
        if(Date.now() > this._expiration) await this._renewCredentials()
        return this._token!
    }

    async getEntitlement(): Promise<string> {
        if(Date.now() > this._expiration) await this._renewCredentials()
        return this._entitlement!
    }

    private async _renewCredentials(): Promise<void> {
        this._logger.info('Refreshing credentials...')
        if(this._ssid === null) {
            this._ssid = await fs.readFile('./ssid.txt', 'utf-8')
        }

        const response = await fetch('https://auth.riotgames.com/authorize?redirect_uri=https%3A%2F%2Fplayvalorant.com%2Fopt_in&client_id=play-valorant-web-prod&response_type=token%20id_token&nonce=1', {
            method: 'GET',
            redirect: 'manual',
            headers: {
                'User-Agent': '',
                'Cookie': `ssid=${this._ssid}`
            }
        })

        this._logger.verbose(`Response status: ${response.status}`)
        this._logger.verbose(`Response headers: ${JSON.stringify(response.headers.raw())}`)

        const searchParams = new URLSearchParams((new URL(response.headers.get('location')!)).hash.slice(1))

        this._token = searchParams.get('access_token')
        this._entitlement = searchParams.get('id_token')
        this._expiration = (Number(searchParams.get('expires_in')) * 1000) + Date.now() - expirationDiff
        this._logger.info(`Credentials refreshed, expires at ${new Date(this._expiration)}`)
        this._ssid = response.headers.get('set-cookie')!.match(ssidRegex)![1]

        // Re-write ssid.txt
        await fs.writeFile('./ssid.txt', this._ssid)

        const entitlementResponse = await (await fetch('https://entitlements.auth.riotgames.com/api/token/v1', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this._token}`,
                'Content-Type': 'application/json',
                'User-Agent': ''
            }
        })).json() as {entitlements_token: string}

        this._entitlement = entitlementResponse['entitlements_token']
    }
}