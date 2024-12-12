// https://dcs-mod-manager-registry.pages.dev/index.json
import { EntryIndex, EntryLatestRelease, RegistryIndexItem } from './client'

const registryIndexItem: RegistryIndexItem = {
  name: 'Hello World Mod',
  description: 'A simple mod that logs hello world to the console on DCS startup',
  authors: [
    {
      name: 'Flying Dice'
    }
  ],
  tags: ['hello'],
  category: 'example',
  id: 'example-mod',
  imageUrl: 'example-mod/index.png'
}

// https://dcs-mod-manager-registry.pages.dev/example-mod/index.json
const modIndex: EntryIndex = {
  name: 'Hello World Mod',
  description: 'A simple mod that logs hello world to the console on DCS startup',
  homepage: 'https://github.com/flying-dice/hello-world-mod',
  authors: [
    {
      name: 'Flying Dice'
    }
  ],
  tags: ['hello'],
  category: 'example',
  license: 'GNU General Public License v3.0',
  id: 'example-mod',
  imageUrl: 'example-mod/index.png',
  content:
    'IyBFeGFtcGxlIEhlbGxvIFdvcmxkIE1vZAoKRENTIHdvcmxkIEhlbGxvIFdvcmxkIE1vZAoKT24gRENTIFN0YXJ0dXAgbG9ncyBoZWxsbyB3b3JsZCB0byB0aGUgY29uc29sZQoKPiBUaGlzIGNvbnRlbnQgaXMgcHJlc2VudGVkIHRvIHRoZSB1c2VyIHdoZW4gdGhleSBvcGVuIHRoZSBtb2QgcGFnZQo='
}

// https://dcs-mod-manager-registry.pages.dev/example-mod/latest.json
const latestRelease: EntryLatestRelease = {
  releasepage: 'https://github.com/flying-dice/hello-world-mod/releases/tag/0.1.0',
  name: 'RC1',
  version: '0.1.0',
  tag: '0.1.0',
  date: '2023-01-07T12:00:00.000Z',
  assets: [
    {
      source:
        'https://github.com/flying-dice/hello-world-mod/releases/download/0.1.0/hello-world.lua',
      target: '{{DCS_USER_DIR}}/Scripts/Hooks/hello-world.lua'
    }
  ],
  content: 'IyAwLjEuMCBSQzEKCkxhdGVzdCBDaGFuZ2VzOgotIEFkZGVkIGEgbmV3IGZlYXR1cmU='
}

export const registryStubs = {
  'index.json': [registryIndexItem],
  'example-mod': {
    'index.json': modIndex,
    'latest.json': latestRelease
  }
}
