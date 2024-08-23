
async function get_img_urls(url) {
  try {
    const response = await fetch(url, {
      "headers": {
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "accept-language": "zh-CN,zh;q=0.9",
        "Accept-Encoding": "gzip, deflate",
        "Host": "xhslink.com",
        "upgrade-insecure-requests": "1",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36"
      },
      "body": null,
      "method": "GET",
    });
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const response_text = await response.text()
    const img_labels = response_text.match(/<meta name="og:image" content=(.*)>/g)
    if (img_labels == null) {
      return response_text
    }
    var img_urls = new Array()
    for (var i = 0; i < img_labels.length; i++) {
      var img_url = img_labels[i].match(/(?<=content\=).*/)
      img_url = img_url[0].match(/[^\"*].*[^\"\>*]/)
      img_urls[i] = img_url
    }
    return img_urls
  } catch (error) {
    console.error(error.message);
  }
}

function response_html(imgs) {
  const html_front = `<!DOCTYPE html>
  <body>
  `;
  const html_back = `
  </body>`;
  for (var i = 0; i < imgs.length; i++) {
    imgs[i] = '<img src="' + imgs[i] + '" alt="' + i.toString() + '"></img>'
  }
  var body = imgs.join('\n')
  const html = html_front + body + html_back
  console.log(html)

  return new Response(html, {
    headers: {
      "content-type": "text/html;charset=UTF-8",
    },
  });

}

function get_share_url(request_url) {
  const decode_request_url = decodeURI(request_url)
  const share = decode_request_url.match(/(?<=share\=).*/)
  if (share == null) {
    return share
  }
  const urls = share[0].match(/http.*\:\/\/.*[^'"]/);
  if (urls == null) {
    return urls
  }
  const url = urls[0]
  console.log(url)
  return url
}

function response_error(error_str) {
  const html_front = `<!DOCTYPE html>
      <body>
        <h1>`
  const html_back = `</h1>
      </body>`;
  const html = html_front + error_str + html_back
  return new Response(html, {
    headers: {
      "content-type": "text/html;charset=UTF-8",
    },
  });
}

export default {
  async fetch(request, env, ctx) {
    const share_url = get_share_url(request.url)
    if (share_url == null) {
      return response_error('url error')
    }
    const img_urls = await get_img_urls(share_url);
    if (img_urls == null) {
      return response_error('get img error')
    }
    else if (!Array.isArray(img_urls)) {
      return new Response(img_urls, {
        headers: {
          "content-type": "text/html;charset=UTF-8",
        },
      });
    }
    return response_html(img_urls);
  },
};