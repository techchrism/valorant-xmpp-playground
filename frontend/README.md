# Valorant XMPP Log Viewer

## Features

- Parses XMPP XML structures, even those that span multiple messages
- Allows for quick searching and filtering of messages
- Displays decoded presence data

## Usage

- Use <https://github.com/techchrism/valorant-xmpp-logger> to generate XMPP log files
- Visit <https://valxmpplogview.techchrism.me/> and upload the generated log file
- Browse the individual messages

## Development

```bash
$ npm install # or pnpm install or yarn install
```

In the project directory, you can run:

### `npm dev` or `npm start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>

### `npm run build`

Builds the app for production to the `dist` folder.<br>
It correctly bundles Solid in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

## Deployment

You can deploy the `dist` folder to any static host provider (netlify, surge, now, etc.)
