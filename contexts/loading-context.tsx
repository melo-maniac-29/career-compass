"use client"

import { createContext, useContext, useState, ReactNode } from "react"

interface LoadingContextProps {
  isLoading: boolean
  setLoading: (loading: boolean) => void
  startLoading: () => void
  endLoading: () => void
}

const LoadingContext = createContext<LoadingContextProps>({
  isLoading: false,
  setLoading: () => {},
  startLoading: () => {},
  endLoading: () => {},
})

export const useLoading = () => useContext(LoadingContext)

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false)

  const setLoading = (loading: boolean) => {
    setIsLoading(loading)
  }

  const startLoading = () => {
    setIsLoading(true)
  }

  const endLoading = () => {
    setIsLoading(false)
  }

  return (
    <LoadingContext.Provider value={{ isLoading, setLoading, startLoading, endLoading }}>
      {children}
    </LoadingContext.Provider>
  )
}
