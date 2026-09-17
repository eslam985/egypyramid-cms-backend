// backend/utils/regex.js
const emailRe = /^\w{2,30}@\w{2,20}\.\w{2,20}$/i;
const UrlRe = /^(https?:\/\/)[^\s/$.?#].[^\s]*$/i;
const numIntRe = /^[0-9]\d*$/;
const nameRe = /^[a-zA-Z0-9_\-\s\u0600-\u06FF]{3,50}$/;// الأسماء (دعم العربية والإنجليزية والأرقام)
const phoneRe = /^(\+\d{2})?\d{11,16}$/;// أرقام الهواتف
const labelRe = /^[\u0600-\u06FFa-zA-Z0-9-_\s]+(?:,[\u0600-\u06FFa-zA-Z0-9-_\s]+)*$/;// الوسوم (قائمة مفصولة بفواصل)
const durationIsoRegex = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/;// صيغة ISO للوقت (مثال: PT1H30M)
const matchRegex = (input, regx) => regx.test(input);

const slugify = (str) => {
    if (!str || typeof str !== "string") return "";
    return str
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\u0600-\u06FF]+/g, "-")
        .replace(/^-+|-+$/g, "");
};

module.exports = {
    nameRe,
    phoneRe,
    labelRe,
    durationIsoRegex,
    emailRe,
    UrlRe,
    numIntRe,
    slugify
};
