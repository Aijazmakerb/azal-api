import axios from "axios";
import { load } from "cheerio";
import CryptoJS from "crypto-js";
import { getSourceUrlById } from "../providers/dramacool.js";

const keys = {
    key: CryptoJS.enc.Utf8.parse('93422192433952489752342908585752'),
    iv: CryptoJS.enc.Utf8.parse('9262859232435825'),
}

export async function fetchSource(url)
{
    const aijaz = await getSourceUrlById(url);
    const videoUrl = new URL(aijaz);

    const res = await axios.get(videoUrl);
    const $ = load(res.data)

    const encryptedParams = await generateEncryptedAjaxParams($, videoUrl.searchParams.get('id') ?? '');

    const encryptedData = await axios.get(`${videoUrl.protocol}//${videoUrl.hostname}/encrypt-ajax.php?${encryptedParams}`,
    {
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
        },
    })

    const decryptedData = await decryptAjaxData(encryptedData.data.data);

    if (!decryptedData.source) throw new Error('No source found. Try a different server.');

    return decryptedData;
}   

function generateEncryptedAjaxParams($, id) {
    const encryptedKey = CryptoJS.AES.encrypt(id, keys.key, {
        iv: keys.iv,
    }).toString();

    const scriptValue = $("script[data-name='crypto']").data();
    const decryptedToken = CryptoJS.AES.decrypt(scriptValue, keys.key, {
        iv: keys.iv,
    }).toString(CryptoJS.enc.Utf8);

    return `id=${encryptedKey}&alias=${decryptedToken}`;
}

async function decryptAjaxData(encryptedData) {
    const decryptedData = CryptoJS.enc.Utf8.stringify(
        CryptoJS.AES.decrypt(encryptedData, keys.key, {
            iv: keys.iv,
        })
    );

    return JSON.parse(decryptedData);
}