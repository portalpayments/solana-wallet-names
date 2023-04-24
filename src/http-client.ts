// You know how you always have to write a wrapper around fetch to have sensible defaults?
// This is that wrapper.
const log = console.log;

export const CONTENT_TYPES = {
  JSON: "application/json",
  TEXT: "text/plain",
  HTML: "text/html",
};

export const get = async (
  uri: string,
  headers: Record<string, string> | null = null,
  forceResponseContentType: string | null = null
) => {
  return fetchUnfucked(uri, "GET", headers, null, forceResponseContentType);
};

export const post = async (
  uri: string,
  headers: Record<string, string> | null = null,
  body: Record<string, unknown>,
  forceResponseContentType: string | null = null
) => {
  return fetchUnfucked(uri, "POST", headers, body, forceResponseContentType);
};

export const fetchUnfucked = async (
  uri: string,
  method = "GET",
  headers: Record<string, string> | null = {},
  body: Record<string, unknown> | null,
  forceResponseContentType: string | null = null
) => {
  const options: RequestInit = {
    method,
    body: body ? JSON.stringify(body) : null,
  };
  if (headers && Object.keys(headers).length) {
    options.headers = headers;
  }
  const response = await fetch(uri, options);

  let contentType: string = CONTENT_TYPES.JSON;
  if (forceResponseContentType) {
    contentType = forceResponseContentType;
  } else {
    let contentTypeHeader = response.headers.get("Content-Type");
    if (contentTypeHeader) {
      //Sometimes the header could be malformed
      const parts = contentTypeHeader.split(";");
      if(parts.length > 0){
        contentType = parts.at(0);
      }
    } else {
      log(`No Content Type header. Weird. Using default.`);
    }
  }

  if (
    contentType === CONTENT_TYPES.TEXT ||
    contentType === CONTENT_TYPES.HTML
  ) {
    const htmlOrText = await response.text();
    return htmlOrText;
  }
  if (contentType === CONTENT_TYPES.JSON) {
    return response.json();
  }
  throw new Error(`Don't know how to decode this contentType: ${contentType}`);
};
