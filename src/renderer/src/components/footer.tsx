import { AppShell, Center, CloseButton, ScrollArea, Stack } from "@mantine/core"
import { useInstallContext } from "@renderer/context/install.context"
import { FC } from "react"

export const Footer: FC = () => {
    const installContext = useInstallContext()
    return (
        <AppShell.Footer>
            <ScrollArea>
                <Center>
                    {installContext && installContext.installStates && (
                        <>
                            <Stack>
                                {Object.keys(installContext.installStates).map(x => (<p>{x}: {installContext.installStates && installContext.installStates[x]}</p>))}
                            </Stack>
                            {Object.keys(installContext.installStates).length > 0 && (
                                <CloseButton size={'sm'} variant={'default'} onClick={installContext.clearProgress} />
                            )}
                        </>
                    )}
                </Center>
            </ScrollArea>
        </AppShell.Footer>
    )
}