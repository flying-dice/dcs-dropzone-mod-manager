import { Test, TestingModule } from '@nestjs/testing'
import { VariablesService } from './variables.service'
import { SettingsManager } from '../manager/settings.manager'

describe('VariablesService', () => {
  let service: VariablesService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VariablesService,
        {
          provide: SettingsManager,
          useValue: {
            getGameDir: vitest.fn().mockResolvedValue('/game/dir')
          }
        }
      ]
    }).compile()

    service = module.get<VariablesService>(VariablesService)
  })

  it('retrieves variables and their values', async () => {
    const variables = await service.getVariables()

    expect(variables).toEqual({
      DCS_USER_DIR: '/game/dir'
    })
  })

  it('replaces variables in text with their values', async () => {
    const result = await service.replaceVariables('Game: {{DCS_USER_DIR}}')

    expect(result).toBe('Game: /game/dir')
  })

  it('throws an error if a variable is unknown', async () => {
    await expect(service.replaceVariables('Unknown: {{UNKNOWN_VAR}}')).rejects.toThrow(
      'Unknown Variable UNKNOWN_VAR in Unknown: {{UNKNOWN_VAR}}'
    )
  })
})
