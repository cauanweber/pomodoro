import express      from 'express'
import cors         from 'cors'

const app = express()
      app.use(cors())
      app.use(express.json())

app.get("/health", (_, express_response) => {
    return express_response.json({
        status: 'OK'
    })
})

const PORT = process.env.PORT || 3333
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})