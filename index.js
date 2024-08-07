import express from "express";
import cors from "cors";
import { fetchEpisodesMetadata, fetchInfo, fetchPopular, fetchTopRated, fetchTrending, search } from "./src/meta/mydramalist.js";
import { fetchEpisodes, fetchRecentAdded } from "./src/providers/dramacool.js";
import { fetchSource } from "./src/extrtactors/asianload.js";

const app = express();
const port = 3001;

app.use(cors())

app.get('/', (req, res) => {
    res.status(200).json({
        intro: "Welcome to the official azal provider that runs on @ https://mydramalist.com/ : check the website @ `currently in development` ",
        routes: {
            search: "/search/:query",
            info: "/info/:mdlid",
            episodes: "/episodes/:mdlid",
            recent: "/recently-added",
            trending: "/trending",
            popular: "/popular",
            topRated: "/top-rated",
            sources: "/sources/:episodeId"
        },
        author: "This api is developed and created by AijaZ"
    })
});

app.get('/search/:query', async (req, res) => {
    const query = req.params.query;
    const data = await search(query);

    res.status(200).json(data)
})

app.get('/info/:id', async (req, res) => {
    const id = req.params.id;
    const data = await fetchInfo(id);

    res.status(200).json(data)
})

app.get('/content-metadata/:id', async (req, res) => {
    const id = req.params.id;
    const data = await fetchEpisodesMetadata(id);

    res.status(200).json(data)
})

app.get('/recently-added', async (req, res) => {
    const data = await fetchRecentAdded();

    res.status(200).json(data)
})

app.get('/trending', async (req, res) => {
    const data = await fetchTrending();

    res.status(200).json(data)
})

app.get('/popular', async (req, res) => {
    const data = await fetchPopular();

    res.status(200).json(data)
})

app.get('/top-rated', async (req, res) => {
    const data = await fetchTopRated();

    res.status(200).json(data)
})

app.get('/episodes/:id', async (req, res) => {
    const id = req.params.id;
    const data = await fetchEpisodes(id);

    res.status(200).json(data)
})

app.get('/sources/:id', async (req, res) => {
    const id = req.params.id;
    const data = await fetchSource(id);

    res.status(200).json(data)
})

app.listen(port, () => {
    console.log(`Example app listening on port http://localhost:${port}`)
});