
// backend/utils/regex.js
const emailRe: RegExp = /^\w{2,30}@\w{2,20}\.\w{2,20}$/i;
const UrlRe: RegExp = /^(https?:\/\/)[^\s/$.?#].[^\s]*$/i;
const numIntRe: RegExp = /^[0-9]\d*$/;
const nameRe: RegExp = /^[a-zA-Z0-9_\-\s\u0600-\u06FF]{3,50}$/;// الأسماء (دعم العربية والإنجليزية والأرقام)
const phoneRe: RegExp = /^(\+\d{2})?\d{11,16}$/;// أرقام الهواتف
const labelRe: RegExp = /^[\u0600-\u06FFa-zA-Z0-9-_\s]+(?:,[\u0600-\u06FFa-zA-Z0-9-_\s]+)*$/;// الوسوم (قائمة مفصولة بفواصل)
const durationIsoRegex: RegExp = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/;// صيغة ISO للوقت (مثال: PT1H30M)

const matchRegex = (input: string, regx: RegExp): boolean => regx.test(input);

const slugify = (str: string): string =>  {
    if (!str || typeof str !== "string") return "";
    
    return str.trim().toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]+/g, "-").replace(/^-+|-+$/g, "");
};

export {
    nameRe,
    phoneRe,
    labelRe,
    durationIsoRegex,
    emailRe,
    UrlRe,
    numIntRe,
    slugify,
    matchRegex
};
