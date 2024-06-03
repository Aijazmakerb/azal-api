import axios from "axios";
import { load } from "cheerio";
import { getBasicInfoById } from "../meta/mydramalist.js";

const baseUrl = 'https://asianc.to';

export async function fetchEpisodes(id)
{
    const {title, status, type} = await getBasicInfoById(id);

    if(type !== 'Drama' && status == 'Releasing') return [];

    const resp = await (await axios.get(`${baseUrl}/search?type=movie&keyword=${title.toLowerCase()}`)).data;
    const $ = load(resp);

    const url = $('ul.switch-block.list-episode-item').find('li').eq(0).find('a').attr('href')

    const dc = await (await axios.get(`${baseUrl}${url}`)).data;
    const $$ = load(dc)

    let episodes = []

    $$('ul.list-episode-item-2.all-episode').find('li').each((index, element) => {
        const url = $$(element).find('a').attr('href')
        const ep = parseInt($$(element).find('a h3.title').text().split(' ').pop())

        episodes.push({
            ep,
            url
        })
    })

    episodes.sort((a, b) => a.ep - b.ep)
    return episodes;
}

export async function getSourceUrlById(id)
{
    const html = await (await axios.get(`${baseUrl}/${id}`)).data;
    const $ = load(html)

    let asianload = $('div.anime_muti_link ul').find('li').eq(1).attr('data-video');
    if(asianload.startsWith('//')) asianload = asianload.replace('//', 'https://')
    
    return asianload;
}