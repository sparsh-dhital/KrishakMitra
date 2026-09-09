#!/usr/bin/env node

(async () => {
  const { createServer } = await import('vite')
  
  const server = await createServer({
    server: {
      host: '127.0.0.1',
      port: 5173,
      middlewareMode: false
    }
  })
  
  await server.listen()
  
  console.log('Vite dev server running at http://127.0.0.1:5173')
})().catch(err => {
  console.error('Error starting Vite server:', err)
  process.exit(1)
})
