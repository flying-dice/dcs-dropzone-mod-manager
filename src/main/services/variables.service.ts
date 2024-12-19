import { Inject, Injectable } from '@nestjs/common'
import { SettingsManager } from '../manager/settings.manager'

/**
 * Service to handle variable replacements in strings.
 */
@Injectable()
export class VariablesService {
  @Inject(SettingsManager)
  private settingsManager: SettingsManager

  /**
   * Retrieves the variables and their values.
   * @returns {Promise<Record<string, string>>} A promise that resolves to an object containing variable names and their values.
   */
  async getVariables(): Promise<Record<string, string>> {
    return {
      DCS_USER_DIR: await this.settingsManager.getGameDir()
    }
  }

  /**
   * Replaces variables in the given text with their corresponding values.
   * @param {string} text - The text containing variables to be replaced.
   * @returns {Promise<string>} A promise that resolves to the text with variables replaced.
   * @throws {Error} Throws an error if a variable is unknown.
   */
  async replaceVariables(text: string): Promise<string> {
    const variables = await this.getVariables()

    return text.replace(/{{(.*?)}}/g, (_, variable) => {
      const variableValue = variables[variable]

      if (!variableValue) {
        throw new Error(`Unknown Variable ${variable} in ${text}`)
      }

      return variableValue
    })
  }
}
