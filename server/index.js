import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import analysisRoutes from './routes/analysis.js'
import chatRoutes from './routes/chat.js'
import webhookRoutes from './routes/webhooks.js'
import adminRoutes from './routes/admin.js'
import authRoutes from './routes/auth.js'
import stripeRoutes from './routes/stripe.js'
import stripeWebhookRoutes from './routes/stripeWebhook.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())

// Raw body required for Stripe and ThriveCart webhook signature verification
app.use('/api/webhooks', express.raw({ type: 'application/json' }))
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }))
app.use(express.json())

app.use('/api/analysis', analysisRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/webhooks', webhookRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/stripe', stripeRoutes)
app.use('/api/stripe/webhook', stripeWebhookRoutes)

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
