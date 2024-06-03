import axios from "axios";
import { load } from "cheerio";

const baseUrl = 'https://mydramalist.com'

export async function fetchInfo(id) {
    const html = await (await axios.get(`${baseUrl}/${id}`)).data;
    const $ = load(html);

    const title = $('h1.film-title a').text()
    const nativeTitle = $('ul.list.m-a-0').find('[class="list-item p-a-0"]').eq(0).find('a').text()
    const synopsis = $('div.show-synopsis p').text().split('Edit Translation')[0].trim()
    const img = $('div.col-sm-4.film-cover.cover').find('a.block').find('img').attr('src').replace(/(c)(?=\.jpg)/, "f")
    const rating = $('div.box.deep-orange').text()

    const country = $('ul.list.m-b-0').find('li').eq(1).text().split(':')[1].trim()
    const year = $('h1.film-title').text().match(/\(([^)]+)\)/)[1]
    const type = $('ul.list.m-a-0.hidden-md-up').find('li').eq(1).text().split(':')[1].trim()

    const totalEpisodes = type == 'Drama' ? parseInt($('ul.list.m-b-0').find('li').eq(2).text().split(':')[1].trim()) : 1;

    let currentEpisode = 0;
    const ep$ = load(await (await axios.get(`${baseUrl}/${id}/episodes`)).data);
    if(type == 'Drama')
    {
        ep$('div.episodes.clear.m-t').find('div.col-xs-12.col-sm-6.col-md-4.p-a.episode').each((index, element) => {
            if($(element).find('div.cover').attr()['class'].includes("missing")) return;
            currentEpisode++;
        })
    }else if(type !== 'Drama' && !isUpcoming(ep$))
    {
        currentEpisode = 1;
    }

    const status = currentEpisode == totalEpisodes ? "Completed" : "Releasing";
    const duration = !isUpcoming($) ? $('ul.list.m-b-0').find('li').eq(type == "Drama" ? 6 : 3).text().split(':')[1].trim() : null 
    const contentRating = !isUpcoming($) ? $('ul.list.m-b-0').find('li').eq(type == "Drama" ? 7 : 4).text().split(':')[1].trim() : null

    let alternateTitle = []
    let genres = []
    let cast = []
    let recommendations = []

    $('span.mdl-aka-titles').find('a').each((index, element) => {
        let alternateTitle_elements = $(element).text()
        alternateTitle.push(alternateTitle_elements)
    })

    $('[class="list-item p-a-0 show-genres"]').find('a').each((index, element) => {
        let genre = $(element).text()
        let genre_id = $(element).attr('href').split('&ge=')[1].split('&')[0]
        genres.push({
            genre_id,
            genre
        })
    })

    $('ul.list.no-border.p-b.credits').find('li').each((index, element) => {
        let cast_name = $(element).find('div.col-xs-8.col-sm-7.p-a-0').find('a').attr('title')
        let character_name = $(element).find('div.text-ellipsis').find('small').text()
        let cast_image = $(element).find('div.col-xs-4.col-sm-5.p-r.p-l-0.credits-left').find('a').find('img').attr('data-src').replace(/(s)(?=\.jpg)/, "c")
        let role_type = $(element).find('small.text-muted').text()
        cast.push({
            cast_image,
            cast_name,
            character_name,
            role_type
        })
    })

    $('div.box-body.details-recommendations div.row.p-l-sm.p-r-sm').find('div').each((index, element) => {
        const id = $(element).find('a').attr('href')
        const img = $(element).find('a').find('img').attr('data-src').replace(/(t)(?=\.jpg)/, "f")
        const title = $(element).find('a').attr('title')

        recommendations.push({
            id,
            img,
            title
        })
    })

    let data = {
        id,
        img,
        titles: {
            title,
            nativeTitle,
            alternateTitle,
        },
        rating,
        synopsis,
        details: {
            country,
            type,
            status,
            year,
            currentEpisode,
            totalEpisodes,
            duration,
            contentRating
        },
        genres,
        cast,
        recommendations,
    }

    return data
}

export async function fetchEpisodesMetadata(id) {
    const html = await (await axios.get(`${baseUrl}/${id}/episodes`)).data;
    const $ = load(html);

    let data = []

    $('div.episodes.clear.m-t').find('div.col-xs-12.col-sm-6.col-md-4.p-a.episode').each((index, element) => {
        if($(element).find('div.cover').attr()['class'].includes("missing")) return;
        const title = $(element).find('h2.title a.text-primary').text()
        const img = $(element).find('div.cover a img').attr('data-src').replace(/(m)(?=\.jpg)/, "f")
        const description = $(element).find('div.summary.hide').text()

        data.push({
            title,
            img,
            description
        })
    })
    return data
}

export async function fetchTrending() {
    const html = await (await axios.get(`${baseUrl}/`)).data;
    const $ = load(html);

    let data = []

    $('#slide-trending div.swiper-wrapper').find('div.swiper-slide').each((index, element) => {
        const id = $(element).find('a').attr('href')
        const title = $(element).find('a').eq(1).text()
        const img = $(element).find('a img').attr('data-src').replace(/(s)(?=\.jpg)/, "f")

        data.push({
            id,
            title,
            img
        })
    })
    return data;
}

export async function fetchPopular() {
    const html = await (await axios.get(`${baseUrl}/shows/popular`)).data;
    const $ = load(html);

    let data = []

    $('div.m-t.nav-active-border.b-primary').find('div.box').each((index, element) => {
        const id = $(element).find('a.block').attr('href')
        const title = $(element).find('h6.text-primary.title a').text()
        const img = $(element).find('a.block img').attr('data-src').replace(/(s)(?=\.jpg)/, "f")

        data.push({
            id,
            title,
            img
        })
    })
    return data;
}

export async function fetchTopRated() {
    const html = await (await axios.get(`${baseUrl}/search?adv=titles&ty=68,77,86&so=rated`)).data;
    const $ = load(html);

    let data = []

    $('div.m-t.nav-active-border.b-primary').find('div.box').each((index, element) => {
        const id = $(element).find('a.block').attr('href')
        const title = $(element).find('h6.text-primary.title a').text()
        const img = $(element).find('a.block img').attr('data-src').replace(/(s)(?=\.jpg)/, "f")

        data.push({
            id,
            title,
            img
        })
    })
    return data;
}

export async function search(query) {
    const html = await (await axios.get(`${baseUrl}/search?q=${query.toLowerCase()}`)).data;
    const $ = load(html);

    let data = []

    $('div.m-t.nav-active-border.b-primary').find('div.box').each((index, element) => {
        if ($(element).find('a.block') != "") {
            const id = $(element).find('a.block').attr('href')
            const title = $(element).find('h6.text-primary.title a').text()
            const img = $(element).find('a.block img').attr('data-src').replace(/(s)(?=\.jpg)/, "f")

            data.push({
                id,
                title,
                img
            })
        }
    })
    return data;
}

export const getBasicInfoById = async(id) => {
    const html = await (await axios.get(`${baseUrl}/${id}/episodes`)).data;
    const $ = load(html);

    const title = $('h1.film-title').text()
    const type = $('ul.list.m-b-0').find('li').eq(0).find('b.inline').text().replace(':', '')

    if(type !== 'Drama' && isUpcoming($)) return { title, status: 'Releasing', type}

    const totalEpisodes = type == 'Drama' ? parseInt($('ul.list.m-b-0').find('li').eq(2).text().split(':')[1].trim()) : 1;

    let currentEpisode = 0;

    if(type == 'Drama')
    {
        $('div.episodes.clear.m-t').find('div.col-xs-12.col-sm-6.col-md-4.p-a.episode').each((index, element) => {
            if($(element).find('div.cover').attr()['class'].includes("missing")) return;
            currentEpisode++;
        })
    }else{
        currentEpisode = 1;
    }

    const status = currentEpisode == totalEpisodes ? "Completed" : "Releasing";

    return { title, status, type };
}

const isUpcoming = ($) => {
    //checking by score
    const score = $('div.box.clear.hidden-sm-down').eq(1).find('ul.list.m-b-0').find('li').eq(0).find('span').text()

    return score.includes('(scored by 0 users)')
}