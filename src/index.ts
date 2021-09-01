import Express from "express"

const app = Express()

app.get("/", (req, res) => {
    res.send(`request ${req} - Hello World!`);
})