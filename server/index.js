import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import analysisRoutes from './routes/analysis.js'
import webhookRoutes from './routes/webhooks.js'
import adminRoutes from './routes/admin.js'
import authRoutes from './routes/auth.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())

// Raw body for webhook signature verification
app.use('/api/webhooks', express.raw({ type: 'application/json' }))
app.use(express.json())

app.use('/api/analysis', analysisRoutes)
app.use('/api/webhooks', webhookRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/auth', authRoutes)

// Serve built frontend in production
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '..', 'dist')
  app.use(express.static(distPath))
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'))
  })
}

app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`)
})
