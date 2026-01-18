'use client'

import {
  isServer,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Data dianggap "fresh" selama 1 menit.
        // Ini mengurangi request berlebih ke server.
        staleTime: 60 * 1000,
        // Refetch saat window focus defaultnya true, bisa dimatikan jika terlalu mengganggu
        refetchOnWindowFocus: false,
      },
    },
  })
}

let browserQueryClient: QueryClient | undefined = undefined

function getQueryClient() {
  if (isServer) {
    // Server: selalu buat query client baru
    return makeQueryClient()
  } else {
    // Browser: buat query client baru jika belum ada
    // Ini sangat penting agar kita tidak me-recreate client saat re-render
    if (!browserQueryClient) browserQueryClient = makeQueryClient()
    return browserQueryClient
  }
}

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  // NOTE: Hindari inisialisasi QueryClient di luar komponen component scope 
  // atau di dalam useState tanpa lazy initializer jika tidak menggunakan pola singleton di atas.
  const queryClient = getQueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* DevTools tidak akan muncul di production secara default */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
