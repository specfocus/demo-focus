import { NextRequest, NextResponse } from 'next/server';

/**
 * Convert an async iterable into a readable stream
 * @param {AsyncIterable<Buffer | string>} iterable
 * @return Readable<Buffer | string>
 */
const toStream = (iterable: AsyncIterable<any>): ReadableStream => {
  // tslint:disable-next-line: no-empty
  const source: UnderlyingSource = {
    async pull(controller: ReadableStreamController<any>): Promise<void> {
      try {
        for await (const chunk of iterable) {
          // controller.enqueue(chunk)
          switch (typeof chunk) {
            case 'object':
              // just say the stream is done I guess
              if (chunk === null) controller.close();
              else if (ArrayBuffer.isView(chunk))
                controller.enqueue(new Uint8Array(chunk.buffer, chunk.byteOffset, chunk.byteLength));
              else if (Array.isArray(chunk) && chunk.every(value => typeof value === 'number'))
                controller.enqueue(new Uint8Array(chunk));
                /*
              else if ('function' === typeof chunk.valueOf && chunk.valueOf() !== chunk)
                this.transform(chunk.valueOf(), controller); // hack
              else if ('toJSON' in chunk) this.transform(JSON.stringify(chunk), controller);
              */
              break;
            case 'symbol':
              controller.error("Cannot send a symbol as a chunk part");
              break;
            case 'undefined':
              controller.error("Cannot send undefined as a chunk part");
              break;
            default:
              controller.enqueue(/*this.textencoder.encode(*/String(chunk)/*)*/);
              break;
          }
        }
      } catch (error) {
        controller.error(error);
        return;
      }
      controller.close();
    }
  };
  return new ReadableStream(source);
};

import crypto from 'crypto';

const chunks = [
  crypto.randomBytes(Math.round(Math.random() * 256)),
  crypto.randomBytes(Math.round(Math.random() * 256)),
  crypto.randomBytes(Math.round(Math.random() * 256)),
  crypto.randomBytes(Math.round(Math.random() * 256)),
];

async function* getChunks() {
  for (const item of chunks) {
    await new Promise((resolve) => setTimeout(resolve));
    yield item;
  }
}

export default function middleware(req: NextRequest) {
  /*
  const basicAuth = req.headers.get('authorization');
  if (basicAuth) {
    const auth = basicAuth.split(' ')[1];
    const [user, pwd] = Buffer.from(auth, 'base64').toString().split(':');

    if (user !== '4dmin' && pwd !== 'testpwd123') {
      // alert
      return new Response('Auth required', {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Secure Area"',
        },
      })
    }
  }
  const contentType = req.headers.get('content-type');
  if (contentType !== 'application/json') {
    return NextResponse.next();
  }*/

  return new Response(
    toStream(getChunks()),
    {
      status: 200,
      headers: {
        'content-type': 'application/json',
      },
    }
  );
}