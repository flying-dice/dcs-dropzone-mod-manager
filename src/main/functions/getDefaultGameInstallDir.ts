import winreg from 'winreg'
import { Logger } from '@nestjs/common'

function getKeyValues(hive: string, key: string, value: string): Promise<string | undefined> {
  return new Promise((resolve) => {
    Logger.debug(`Getting key values for ${key} ${value}`)
    const reg = new winreg({ hive, key })

    reg.get(value, (err, item) => {
      if (err) {
        Logger.error(`Error getting key values for ${key} ${value}`, err)
        resolve(undefined)
      } else {
        Logger.debug(`Got key values for ${key} ${value}`, item)
        resolve(item.value)
      }
    })
  })
}

export async function getDefaultGameInstallDir(): Promise<string | undefined> {
  const openBeta = await getKeyValues(
    winreg.HKCU,
    '\\Software\\Eagle Dynamics\\DCS World OpenBeta',
    'Path'
  )

  if (openBeta) {
    return openBeta
  }

  return await getKeyValues(winreg.HKCU, '\\Software\\Eagle Dynamics\\DCS World', 'Path')
}
