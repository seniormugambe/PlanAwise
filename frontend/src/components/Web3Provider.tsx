import type { ReactNode } from 'react'

interface Web3ProviderProps {
  children: ReactNode
}

export const Web3Provider = ({ children }: Web3ProviderProps) => <>{children}</>
