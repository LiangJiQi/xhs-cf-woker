
async function getData(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    var response_text = await response.text()
    //console.log(response_text)
    var imgs = response_text.match(/<meta name="og:image" content=(.*)>/g)
    //console.log(imgs)
    //return imgs;
    
    for (var i=0;i<imgs.length;i++)
    { 
        var img_url = imgs[i].match(/(?<=content\=).*/)
        img_url = img_url[0].match(/[^\"*].*[^\"\>*]/)
        //console.log(img_url)
        imgs[i] = img_url
    }
    return imgs
  } catch (error) {
    console.error(error.message);
  }
}

async function response_html(imgs) {
  const html_front = `<!DOCTYPE html>
  <body>`;
  const html_back = `</body>`;
  for (var i=0;i<imgs.length;i++)
  { 
    imgs[i] = '<img src="' + imgs[i] +  '" alt="' + toString(i) + '"></img>'
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

export default {
  async fetch(request, env, ctx) {
    const request_url = decodeURI(request.url)
    const share = request_url.match(/(?<=share\=).*/)
    const urls = share[0].match(/http.*\/\/.*[^']/);
    const url = urls[0]
    const response = await getData(url);
    return response_html(response);
  },
};
