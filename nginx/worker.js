const html = `
<!DOCTYPE html>
<html>
<head>
<title>Welcome to nginx!</title>
<style>
html { color-scheme: light dark; }
body { width: 35em; margin: 0 auto; font-family: Tahoma, Verdana, Arial, sans-serif; }
</style>
</head>
<body>
<h1>Welcome to nginx!</h1>
<p>If you see this page, the nginx web server is successfully installed and working. Further configuration is required.</p>
<p>For online documentation and support please refer to <a href="http://nginx.org/">nginx.org</a>.<br/>
Commercial support is available at <a href="http://nginx.com/">nginx.com</a>.</p>
<p><em>Thank you for using nginx.</em></p>
</body>
</html>`;

function createCombinedHeaders(request, htmlheaders) {
    // Create a new Headers object for combining headers
    const combinedHeaders = new Headers(htmlheaders.headers);
    
    // Add request headers into the combined headers
    request.headers.forEach((value, key) => {
        combinedHeaders.set(key, value);
    });

    // Return the combined headers along with other response information
    return {
        status: htmlheaders.status,
        method: htmlheaders.method,
        headers: combinedHeaders,
        body: htmlheaders.body
    };
}

function getSubscriptionUserInfo() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const UD = Math.floor(((Date.now() - today.getTime()) / 86400000) * 24 * 1099511627776 / 2);
    const pagesSum = UD;
    const workersSum = UD;
    const total = 24 * 1099511627776;
    const expire = Math.floor(Date.now() / 1000) + 3600;
    return `upload=${pagesSum}; download=${workersSum}; total=${total}; expire=${expire}`;
}

function modifyTargetUrl(request, searchParams, targetUrl) {
    if ((request.headers.has('clash') && !request.headers.has('nekobox')) || 
        (searchParams.has('clash') && !request.headers.has('subconverter'))) {
        targetUrl += '?clash';
    } else if (request.headers.has('sing-box') || request.headers.has('singbox') || 
        ((searchParams.has('singbox') || searchParams.has('sb')) && !request.headers.has('subconverter'))) {
        targetUrl += '?sb';
    } else {
        targetUrl += '?sub';
    }
    return targetUrl;
}

export default {
    async fetch(request, env, ctx) {
        // Ensure the User-Agent header is in lowercase
        const userAgent = (request.headers.get('User-Agent') || '').toLowerCase();

        // Create a new Headers object for the request, and add the lowercase User-Agent
        const newHeaders = new Headers(request.headers);
        newHeaders.set('User-Agent', userAgent);

        const url = new URL(request.url);
        const path = url.searchParams.get('token');
        const path2 = url.searchParams.get('url');
        const htmlheaders = {
            status: 200,
            method: request.method,
            headers: {
                "Content-Type": "text/html;charset=utf-8",
                "Profile-Update-Interval": "6",
                "Subscription-Userinfo": getSubscriptionUserInfo(),
                "Cache-Control": "no-store",
            },
            body: (request.method !== 'GET' && request.method !== 'HEAD') ? request.body : null
        };

        const combinedHeaders = createCombinedHeaders({ ...request, headers: newHeaders }, htmlheaders);

        if (!path || !env.URL) {
            return new Response(html, combinedHeaders);
        }

        let targetUrl = await env.URL.get(path);
        if (!targetUrl) {
            return new Response(html, combinedHeaders);
        }

        if (path2) {
            const response = await fetch(targetUrl, combinedHeaders);
            return new Response(response.body, combinedHeaders);
        }

        targetUrl = modifyTargetUrl(request, url.searchParams, targetUrl);

        const response = await fetch(targetUrl, combinedHeaders);
        return new Response(response.body, combinedHeaders);
    }
};
