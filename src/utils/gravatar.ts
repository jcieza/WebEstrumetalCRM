/**
 * Definitive Gravatar Utility (2025 Upgrade)
 * Standardizing on SHA256 and Modern JSON endpoints.
 * Integrates official @gravatar/js SDK for interactive features.
 */

// Simple SHA-256 implementation
async function sha256(message: string): Promise<string> {
    if (typeof crypto === 'undefined' || !crypto.subtle) {
        // Fallback or very basic implementation handled by SDK if available
        return '';
    }
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// MD5 implementation for legacy compatibility
const md5 = (string: string) => {
    function md5cycle(x: any, k: any) {
        var a = x[0], b = x[1], c = x[2], d = x[3];
        a = ff(a, b, c, d, k[0], 7, -680876936); d = ff(d, a, b, c, k[1], 12, -389564586); c = ff(c, d, a, b, k[2], 17, 606105819); b = ff(b, c, d, a, k[3], 22, -1044525330);
        a = ff(a, b, c, d, k[4], 7, -176418897); d = ff(d, a, b, c, k[5], 12, 1200080426); c = ff(c, d, a, b, k[6], 17, -1473231341); b = ff(b, c, d, a, k[7], 22, -45705983);
        a = ff(a, b, c, d, k[8], 7, 1770035416); d = ff(d, a, b, c, k[9], 12, -1958414417); c = ff(c, d, a, b, k[10], 17, -42063); b = ff(b, c, d, a, k[11], 22, -1990404162);
        a = ff(a, b, c, d, k[12], 7, 1804603682); d = ff(d, a, b, c, k[13], 12, -40341101); c = ff(c, d, a, b, k[14], 17, -1502002290); b = ff(b, c, d, a, k[15], 22, 1236535329);
        a = gg(a, b, c, d, k[1], 5, -165796510); d = gg(d, a, b, c, k[6], 9, -1069501632); c = gg(c, d, a, b, k[11], 14, 643717713); b = gg(b, c, d, a, k[0], 20, -373897302);
        a = gg(a, b, c, d, k[5], 5, -701558691); d = gg(d, a, b, c, k[10], 9, 38016083); c = gg(c, d, a, b, k[15], 14, -660478335); b = gg(b, c, d, a, k[4], 20, -405537848);
        a = gg(a, b, c, d, k[9], 5, 568446438); d = gg(d, a, b, c, k[14], 9, -1019803690); c = gg(c, d, a, b, k[3], 14, -187363961); b = gg(b, c, d, a, k[8], 20, 1163531501);
        a = gg(a, b, c, d, k[13], 5, -1444681467); d = gg(d, a, b, c, k[2], 9, -51403784); c = gg(c, d, a, b, k[7], 14, 1735328473); b = gg(b, c, d, a, k[12], 20, -1926607734);
        a = hh(a, b, c, d, k[5], 4, -378558); d = hh(d, a, b, c, k[8], 11, -2022574463); c = hh(c, d, a, b, k[11], 16, 1839030562); b = hh(b, c, d, a, k[14], 23, -35309556);
        a = hh(a, b, c, d, k[1], 4, -1530992060); d = hh(d, a, b, c, k[4], 11, 1272893353); c = hh(c, d, a, b, k[7], 16, -155497632); b = hh(b, c, d, a, k[10], 23, -1094730640);
        a = hh(a, b, c, d, k[13], 4, 681279174); d = hh(d, a, b, c, k[0], 11, -358537222); c = hh(c, d, a, b, k[3], 16, -722521979); b = hh(b, c, d, a, k[6], 23, 76029189);
        a = hh(a, b, c, d, k[9], 4, -640364487); d = hh(d, a, b, c, k[12], 11, -421815835); c = hh(c, d, a, b, k[15], 16, 530742520); b = hh(b, c, d, a, k[2], 23, -995338651);
        a = ii(a, b, c, d, k[0], 6, -198630844); d = ii(d, a, b, c, k[7], 10, 1126891415); c = ii(c, d, a, b, k[14], 15, -1416354905); b = ii(b, c, d, a, k[5], 21, -57434055);
        a = ii(a, b, c, d, k[12], 6, 1700485571); d = ii(d, a, b, c, k[3], 10, -1894986606); c = ii(c, d, a, b, k[10], 15, -1051523); b = ii(b, c, d, a, k[1], 21, -2054922799);
        a = ii(a, b, c, d, k[8], 6, 1873313359); d = ii(d, a, b, c, k[15], 10, -30611744); c = ii(c, d, a, b, k[6], 15, -1560198380); b = ii(b, c, d, a, k[13], 21, 1309151649);
        a = ii(a, b, c, d, k[4], 6, -145523070); d = ii(d, a, b, c, k[11], 10, -1120210379); c = ii(c, d, a, b, k[2], 15, 718787280); b = ii(b, c, d, a, k[9], 21, -343485551);
        x[0] = add32(a, x[0]); x[1] = add32(b, x[1]); x[2] = add32(c, x[2]); x[3] = add32(d, x[3]);
    }
    function cmn(q: any, a: any, b: any, x: any, s: any, t: any) { a = add32(a, add32(q, add32(x, t))); return add32((a << s) | (a >>> (32 - s)), b); }
    function ff(a: any, b: any, c: any, d: any, x: any, s: any, t: any) { return cmn((b & c) | ((~b) & d), a, b, x, s, t); }
    function gg(a: any, b: any, c: any, d: any, x: any, s: any, t: any) { return cmn((b & d) | (c & (~d)), a, b, x, s, t); }
    function hh(a: any, b: any, c: any, d: any, x: any, s: any, t: any) { return cmn(b ^ c ^ d, a, b, x, s, t); }
    function ii(a: any, b: any, c: any, d: any, x: any, s: any, t: any) { return cmn(c ^ (b | (~d)), a, b, x, s, t); }
    function add32(a: any, b: any) { return (a + b) & 0xFFFFFFFF; }
    function hex(n: any) {
        var s = "", j;
        for (j = 0; j < 4; j++) s += hex_chr.charAt((n >> (j * 8 + 4)) & 0x0F) + hex_chr.charAt((n >> (j * 8)) & 0x0F);
        return s;
    }
    var hex_chr = "0123456789abcdef";
    function str2blks_MD5(str: any) {
        var nblk = ((str.length + 8) >> 6) + 1, blks = new Array(nblk * 16), i;
        for (i = 0; i < nblk * 16; i++) blks[i] = 0;
        for (i = 0; i < str.length; i++) blks[i >> 2] |= str.charCodeAt(i) << ((i % 4) * 8);
        blks[i >> 2] |= 0x80 << ((i % 4) * 8);
        blks[nblk * 16 - 2] = str.length * 8;
        return blks;
    }
    var b = str2blks_MD5(string);
    var a = [1732584193, -271733879, -1732584194, 271733878], i;
    for (i = 0; i < b.length; i += 16) md5cycle(a, b.slice(i, i + 16));
    return hex(a[0]) + hex(a[1]) + hex(a[2]) + hex(a[3]);
};

/**
 * Get Gravatar image URL
 */
export const getGravatarUrl = (email: string, size: number = 150) => {
    if (!email) return '';
    const cleanEmail = email.trim().toLowerCase();
    const hash = md5(cleanEmail);
    return `https://www.gravatar.com/avatar/${hash}?d=identicon&s=${size}`;
};

/**
 * Get SHA256 Hash
 */
export const getGravatarHash = async (email: string) => {
    return await sha256(email.trim().toLowerCase());
};

/**
 * Fetch full profile JSON using Gravatar API v3
 */
export const fetchGravatarProfile = async (email: string) => {
    try {
        const hash = await getGravatarHash(email);
        const response = await fetch(`https://api.gravatar.com/v3/profiles/${hash}`);
        if (!response.ok) {
            if (response.status !== 404) {
                console.warn(`Gravatar API v3 returned ${response.status} for ${email}`);
            }
            return null;
        }
        const data = await response.json();
        return data || null;
    } catch (error) {
        console.error('Error fetching Gravatar profile v3:', error);
        return null;
    }
};

/**
 * Initialize official Gravatar Hovercards
 */
export const initGravatarHovercards = async () => {
    if (typeof window === 'undefined') return;
    try {
        // @ts-ignore
        const { hovercards } = await import('@gravatar/js');
        hovercards.attach();
    } catch (error) {
        // Quietly fail as it might be blocked or environment issue
    }
};

/**
 * Get Gravatar URL with cache busting for instant refresh
 */
export const refreshGravatarCache = (email: string, size: number = 150) => {
    const baseUrl = getGravatarUrl(email, size);
    return `${baseUrl}&t=${Date.now()}`;
};

/**
 * Open Gravatar Quick Editor (SDK Optimized)
 */
export const openGravatarQuickEditor = async (token: string, options?: {
    onSave?: (type: 'avatar_updated' | 'profile_updated') => void,
    onClose?: () => void
}) => {
    if (typeof window === 'undefined') return;
    try {
        // @ts-ignore
        const { quickEditor } = await import('@gravatar/js');
        quickEditor.open({
            accessToken: token,
            scope: ['about', 'avatars', 'verified-accounts', 'links'],
            locale: 'es',
            onClose: () => {
                console.log('Gravatar Editor closed');
                options?.onClose?.();
            },
            onSave: (type: any) => {
                console.log('Gravatar Profile saved:', type);
                options?.onSave?.(type);
            }
        });
    } catch (error) {
        console.error('Failed to open Gravatar Quick Editor:', error);
    }
};

/**
 * Get QR Code URL using Gravatar API v3
 */
export const getGravatarQRUrl = async (email: string) => {
    const hash = await getGravatarHash(email);
    return `https://api.gravatar.com/v3/qr-code/${hash}`;
};
